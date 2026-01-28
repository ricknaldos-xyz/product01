import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS, uploadToGemini } from '@/lib/gemini/client'
import { buildDetectionPrompt } from '@/lib/openai/prompts/detection'
import { readFile } from 'fs/promises'
import path from 'path'

export const maxDuration = 120

interface DetectionResult {
  technique: string
  variant: string | null
  confidence: number
  reasoning: string
  multipleDetected: boolean
  alternatives: Array<{
    technique: string
    variant: string | null
    confidence: number
  }>
}

function getMimeType(item: { type: string; filename: string }): string {
  if (item.type === 'VIDEO') {
    return item.filename.endsWith('.mov')
      ? 'video/quicktime'
      : item.filename.endsWith('.webm')
      ? 'video/webm'
      : item.filename.endsWith('.avi')
      ? 'video/x-msvideo'
      : 'video/mp4'
  }
  return item.filename.endsWith('.png')
    ? 'image/png'
    : item.filename.endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg'
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const sportId = formData.get('sportId') as string | null
    const fileUrls = formData.get('fileUrls') as string | null

    if (!sportId) {
      return NextResponse.json(
        { error: 'sportId es requerido' },
        { status: 400 }
      )
    }

    if (!fileUrls) {
      return NextResponse.json(
        { error: 'fileUrls es requerido' },
        { status: 400 }
      )
    }

    const urls: Array<{ url: string; type: string; filename: string }> = JSON.parse(fileUrls)

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un archivo' },
        { status: 400 }
      )
    }

    // Load techniques for this sport
    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      include: {
        techniques: {
          include: { variants: true },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!sport) {
      return NextResponse.json(
        { error: 'Deporte no encontrado' },
        { status: 404 }
      )
    }

    // Build detection prompt
    const prompt = buildDetectionPrompt(
      sport.slug,
      sport.techniques.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        variants: t.variants.map((v) => ({ slug: v.slug, name: v.name })),
      }))
    )

    // Upload files to Gemini File API and prepare content parts
    const contentParts: Array<
      | { fileData: { mimeType: string; fileUri: string } }
      | { inlineData: { mimeType: string; data: string } }
      | { text: string }
    > = []

    for (const item of urls) {
      const mimeType = getMimeType(item)
      let buffer: Buffer

      if (item.url.startsWith('/uploads/')) {
        buffer = await readFile(path.join(process.cwd(), 'public', item.url))
      } else {
        const response = await fetch(item.url)
        if (!response.ok) continue
        buffer = Buffer.from(await response.arrayBuffer())
      }

      // Use File API for videos (too large for inline data), inline for images
      if (item.type === 'VIDEO') {
        console.log(`Uploading video to Gemini File API: ${item.filename}`)
        const fileData = await uploadToGemini(buffer, mimeType, item.filename)
        contentParts.push({ fileData })
      } else {
        const base64 = buffer.toString('base64')
        contentParts.push({ inlineData: { mimeType, data: base64 } })
      }
    }

    if (contentParts.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar los archivos' },
        { status: 400 }
      )
    }

    contentParts.push({ text: prompt })

    // Call Gemini for detection
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: SPORTS_SAFETY_SETTINGS,
    })
    console.log('Sending to Gemini for technique detection...')
    const result = await model.generateContent(contentParts)

    // Check if response was blocked by safety filters
    const blockReason = result.response.promptFeedback?.blockReason
    if (blockReason) {
      console.error('Gemini blocked detection response:', blockReason)
      return NextResponse.json(
        { error: 'El contenido del video fue bloqueado por filtros de seguridad. Intenta con otro video.' },
        { status: 422 }
      )
    }

    const content = result.response.text()

    if (!content || content.trim().length === 0) {
      console.error('Gemini returned empty detection response')
      return NextResponse.json(
        { error: 'El modelo no pudo analizar el video. Intenta con otro video o formato.' },
        { status: 422 }
      )
    }

    // Parse JSON response
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }

    let detection: DetectionResult
    try {
      detection = JSON.parse(jsonContent)
    } catch {
      console.error('Failed to parse Gemini detection response:', content.substring(0, 500))
      return NextResponse.json(
        { error: 'No se pudo interpretar la respuesta del modelo' },
        { status: 500 }
      )
    }

    // Validate detected technique exists in DB
    const detectedTechnique = sport.techniques.find(
      (t) => t.slug === detection.technique
    )

    if (!detectedTechnique) {
      return NextResponse.json({
        detected: null,
        warning: 'No se detectó una técnica conocida',
        reasoning: detection.reasoning,
        confidence: detection.confidence,
      })
    }

    const detectedVariant = detection.variant
      ? detectedTechnique.variants.find((v) => v.slug === detection.variant)
      : null

    // Build alternatives with DB references
    const alternatives = (detection.alternatives || [])
      .map((alt) => {
        const tech = sport.techniques.find((t) => t.slug === alt.technique)
        if (!tech) return null
        const variant = alt.variant
          ? tech.variants.find((v) => v.slug === alt.variant)
          : null
        return {
          technique: { id: tech.id, slug: tech.slug, name: tech.name },
          variant: variant
            ? { id: variant.id, slug: variant.slug, name: variant.name }
            : null,
          confidence: alt.confidence,
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      detected: {
        technique: {
          id: detectedTechnique.id,
          slug: detectedTechnique.slug,
          name: detectedTechnique.name,
          description: detectedTechnique.description,
        },
        variant: detectedVariant
          ? {
              id: detectedVariant.id,
              slug: detectedVariant.slug,
              name: detectedVariant.name,
            }
          : null,
        confidence: detection.confidence,
        reasoning: detection.reasoning,
      },
      multipleDetected: detection.multipleDetected,
      alternatives,
    })
  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json(
      { error: 'Error al detectar la técnica' },
      { status: 500 }
    )
  }
}
