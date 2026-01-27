import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGeminiClient } from '@/lib/gemini/client'
import { buildTennisPrompt } from '@/lib/openai/prompts/tennis'
import { sendAnalysisCompleteEmail } from '@/lib/email'
import { readFile } from 'fs/promises'
import path from 'path'

export const maxDuration = 300 // 5 minutes for video processing

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Get analysis with all related data
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        technique: {
          include: { sport: true },
        },
        variant: true,
        mediaItems: true,
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analisis no encontrado' },
        { status: 404 }
      )
    }

    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (analysis.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Este analisis ya fue procesado' },
        { status: 400 }
      )
    }

    if (analysis.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Este analisis ya esta siendo procesado' },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.analysis.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    })

    try {
      // Build prompt based on sport and technique
      let prompt: string

      if (analysis.technique.sport.slug === 'tennis') {
        prompt = buildTennisPrompt(
          analysis.technique.slug,
          analysis.variant?.slug || null,
          analysis.technique.correctForm,
          analysis.technique.commonErrors
        )
      } else {
        prompt = `Analiza la tecnica deportiva en el video/imagenes y proporciona feedback detallado en formato JSON.`
      }

      const genAI = getGeminiClient()
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

      // Prepare content parts for Gemini
      const contentParts: Array<{
        inlineData: { mimeType: string; data: string }
      } | { text: string }> = []

      // Process each media item
      for (const item of analysis.mediaItems) {
        console.log(`Processing ${item.type}: ${item.filename}`)

        let buffer: ArrayBuffer

        // Check if it's a local file or remote URL
        if (item.url.startsWith('/uploads/')) {
          // Local file - read from filesystem
          const filePath = path.join(process.cwd(), 'public', item.url)
          const fileBuffer = await readFile(filePath)
          buffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength)
        } else {
          // Remote URL - fetch from network
          const response = await fetch(item.url)
          if (!response.ok) {
            console.error(`Failed to download file: ${item.url}`)
            continue
          }
          buffer = await response.arrayBuffer()
        }

        const base64 = Buffer.from(buffer).toString('base64')

        // Determine mime type
        let mimeType: string
        if (item.type === 'VIDEO') {
          mimeType = item.filename.endsWith('.mov')
            ? 'video/quicktime'
            : item.filename.endsWith('.webm')
            ? 'video/webm'
            : item.filename.endsWith('.avi')
            ? 'video/x-msvideo'
            : 'video/mp4'
        } else {
          mimeType = item.filename.endsWith('.png')
            ? 'image/png'
            : item.filename.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg'
        }

        contentParts.push({
          inlineData: {
            mimeType,
            data: base64,
          },
        })
      }

      if (contentParts.length === 0) {
        throw new Error('No se encontraron archivos para analizar')
      }

      // Add the text prompt
      contentParts.push({ text: prompt })

      console.log('Sending to Gemini for analysis...')

      // Call Gemini API
      const result = await model.generateContent(contentParts)
      const response = result.response
      const content = response.text()

      if (!content) {
        throw new Error('Respuesta vacia de Gemini')
      }

      // Parse JSON from response (Gemini might wrap it in markdown code blocks)
      let jsonContent = content
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim()
      }

      // Parse response
      const analysisResult = JSON.parse(jsonContent)

      // Validate result structure
      if (typeof analysisResult.overallScore !== 'number' || !Array.isArray(analysisResult.issues)) {
        throw new Error('Formato de respuesta invalido')
      }

      // Save results in transaction
      await prisma.$transaction(async (tx) => {
        // Update analysis
        await tx.analysis.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            overallScore: analysisResult.overallScore,
            aiResponse: analysisResult,
            summary: analysisResult.summary || null,
            strengths: analysisResult.strengths || [],
            priorityFocus: analysisResult.priorityFocus || null,
            processingMs: Date.now() - startTime,
          },
        })

        // Create issues
        if (analysisResult.issues.length > 0) {
          await tx.issue.createMany({
            data: analysisResult.issues.map((issue: {
              category: string
              title: string
              description: string
              severity: string
              correction: string
              drills: string[]
            }) => ({
              analysisId: id,
              category: issue.category,
              title: issue.title,
              description: issue.description,
              severity: issue.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
              correction: issue.correction,
              drills: issue.drills || [],
            })),
          })
        }
      })

      // Return updated analysis
      const updatedAnalysis = await prisma.analysis.findUnique({
        where: { id },
        include: {
          technique: {
            include: { sport: true },
          },
          variant: true,
          mediaItems: true,
          issues: {
            orderBy: { severity: 'desc' },
          },
          user: {
            select: { email: true, name: true, emailNotifications: true },
          },
        },
      })

      // Send email notification (non-blocking)
      if (updatedAnalysis?.user?.emailNotifications && updatedAnalysis.user.email) {
        sendAnalysisCompleteEmail(
          updatedAnalysis.user.email,
          updatedAnalysis.user.name || 'Deportista',
          updatedAnalysis.technique.name,
          updatedAnalysis.overallScore || 0,
          updatedAnalysis.id
        ).catch((error) => {
          console.error('Failed to send analysis complete email:', error)
        })
      }

      // Log activity for streaks (non-blocking)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      prisma.activityLog.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        update: {
          analysisCount: { increment: 1 },
        },
        create: {
          userId: session.user.id,
          date: today,
          analysisCount: 1,
          exerciseCount: 0,
        },
      }).then(() => {
        return prisma.userStreak.upsert({
          where: { userId: session.user.id },
          update: {
            lastActivityAt: new Date(),
          },
          create: {
            userId: session.user.id,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityAt: new Date(),
          },
        })
      }).catch((error) => {
        console.error('Failed to log activity:', error)
      })

      return NextResponse.json(updatedAnalysis)
    } catch (error) {
      console.error('Processing error:', error)

      // Update status to failed
      await prisma.analysis.update({
        where: { id },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Error desconocido',
          processingMs: Date.now() - startTime,
        },
      })

      return NextResponse.json(
        { error: 'Error al procesar el analisis' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Process analysis error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
