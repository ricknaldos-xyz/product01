import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS } from '@/lib/gemini/client'
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

    let urls: Array<{ url: string; type: string; filename: string }>
    try {
      urls = JSON.parse(fileUrls)
    } catch {
      console.error('Failed to parse fileUrls:', fileUrls)
      return NextResponse.json(
        { error: 'fileUrls tiene formato invalido' },
        { status: 400 }
      )
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un archivo' },
        { status: 400 }
      )
    }

    console.log('[detect] Starting detection for sport:', sportId, 'files:', urls.length)

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

    console.log('[detect] Sport found:', sport.slug, 'techniques:', sport.techniques.length)

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

    // Prepare content parts with inline base64 data
    const contentParts: Array<
      | { inlineData: { mimeType: string; data: string } }
      | { text: string }
    > = []

    for (const item of urls) {
      const mimeType = getMimeType(item)
      console.log('[detect] Processing file:', item.filename, 'type:', item.type, 'mime:', mimeType, 'url:', item.url.substring(0, 80))

      try {
        let buffer: Buffer

        if (item.url.startsWith('/uploads/')) {
          buffer = await readFile(path.join(process.cwd(), 'public', item.url))
        } else {
          const response = await fetch(item.url)
          if (!response.ok) {
            console.error('[detect] Failed to fetch file:', item.url, 'status:', response.status)
            continue
          }
          buffer = Buffer.from(await response.arrayBuffer())
        }

        console.log('[detect] File loaded, size:', buffer.length, 'bytes')
        const base64 = buffer.toString('base64')
        contentParts.push({ inlineData: { mimeType, data: base64 } })
      } catch (fileError) {
        console.error('[detect] Error loading file:', item.filename, fileError)
        continue
      }
    }

    if (contentParts.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar los archivos' },
        { status: 400 }
      )
    }

    contentParts.push({ text: prompt })

    // Call Gemini for detection with retry on 429
    console.log('[detect] Calling Gemini gemini-2.5-flash with', contentParts.length, 'parts')
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: SPORTS_SAFETY_SETTINGS,
    })

    let result
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(contentParts)
        break
      } catch (err) {
        const is429 = err instanceof Error && err.message.includes('429')
        if (is429 && attempt < 2) {
          const waitSec = (attempt + 1) * 15
          console.log(`[detect] Rate limited, retrying in ${waitSec}s (attempt ${attempt + 1}/3)`)
          await new Promise((r) => setTimeout(r, waitSec * 1000))
        } else {
          throw err
        }
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'No se pudo obtener respuesta del modelo de IA' },
        { status: 503 }
      )
    }

    // Check if response was blocked by safety filters
    const blockReason = result.response.promptFeedback?.blockReason
    if (blockReason) {
      console.error('[detect] Gemini blocked response:', blockReason)
      return NextResponse.json(
        { error: 'El contenido del video fue bloqueado por filtros de seguridad. Intenta con otro video.' },
        { status: 422 }
      )
    }

    const content = result.response.text()
    console.log('[detect] Gemini response length:', content.length)

    if (!content || content.trim().length === 0) {
      console.error('[detect] Gemini returned empty response')
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
      console.error('[detect] Failed to parse JSON:', content.substring(0, 500))
      return NextResponse.json(
        { error: 'No se pudo interpretar la respuesta del modelo' },
        { status: 500 }
      )
    }

    console.log('[detect] Detection result:', detection.technique, 'confidence:', detection.confidence)

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
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[detect] UNCAUGHT ERROR:', errorMsg)

    // Check for quota exhaustion vs temporary rate limit
    if (errorMsg.includes('429')) {
      const isQuotaExhausted = errorMsg.includes('quota') || errorMsg.includes('Quota')
      if (isQuotaExhausted) {
        return NextResponse.json(
          { error: 'Cuota de IA agotada por hoy. La cuota se renueva a las 2:00 AM (hora Peru). Puedes intentar mas tarde o usar la seleccion manual de tecnica.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Servicio de IA temporalmente ocupado. Espera 30 segundos e intenta de nuevo.' },
        { status: 429 }
      )
    }

    // Check for network/fetch errors
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Error de conexion con el servicio de IA. Verifica tu conexion e intenta de nuevo.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: `Error al detectar la tecnica: ${errorMsg.substring(0, 100)}` },
      { status: 500 }
    )
  }
}
