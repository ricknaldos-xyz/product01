import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS } from '@/lib/gemini/client'
import { buildTennisPrompt } from '@/lib/openai/prompts/tennis'
import { sendAnalysisCompleteEmail } from '@/lib/email'
import { recalculateSkillScore } from '@/lib/skill-score'
import { retrieveRelevantChunks } from '@/lib/rag/retriever'
import { buildRagContext } from '@/lib/rag/context-builder'
import { readFile } from 'fs/promises'
import path from 'path'
import { analyzeLimiter } from '@/lib/rate-limit'

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

    const { success } = await analyzeLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
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

    // Check subscription tier for free users
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    })

    if (!userRecord || userRecord.subscription === 'FREE') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const thisMonthCount = await prisma.analysis.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      })

      if (thisMonthCount >= 3) {
        return NextResponse.json(
          { error: 'Has alcanzado el limite de analisis gratuitos este mes' },
          { status: 403 }
        )
      }
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
      // Retrieve RAG context from knowledge base
      let ragContext = ''
      try {
        const retrievalQuery = `${analysis.technique.name} ${analysis.variant?.name || ''} técnica biomecánica errores ejercicios`
        const ragChunks = await retrieveRelevantChunks(retrievalQuery, {
          sportSlug: analysis.technique.sport.slug,
          technique: analysis.technique.slug,
          limit: 5,
          threshold: 0.3,
        })
        ragContext = buildRagContext(ragChunks)
      } catch (error) {
        console.warn('RAG retrieval skipped:', error)
      }

      // Build prompt based on sport and technique
      let prompt: string

      if (analysis.technique.sport.slug === 'tennis') {
        prompt = buildTennisPrompt(
          analysis.technique.slug,
          analysis.variant?.slug || null,
          analysis.technique.correctForm,
          analysis.technique.commonErrors,
          ragContext
        )
      } else {
        prompt = `Analiza la tecnica deportiva en el video/imagenes y proporciona feedback detallado en formato JSON.${ragContext}`
      }

      const genAI = getGeminiClient()
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: SPORTS_SAFETY_SETTINGS,
      })

      // Prepare content parts for Gemini (inline base64)
      const contentParts: Array<
        | { inlineData: { mimeType: string; data: string } }
        | { text: string }
      > = []

      // Process each media item
      for (const item of analysis.mediaItems) {
        console.log(`[process] Processing ${item.type}: ${item.filename}, url: ${item.url.substring(0, 80)}`)

        try {
          let buffer: Buffer

          // Check if it's a local file or remote URL
          if (item.url.startsWith('/uploads/')) {
            buffer = await readFile(path.join(process.cwd(), 'public', item.url))
          } else {
            const response = await fetch(item.url)
            if (!response.ok) {
              console.error(`[process] Failed to download file: ${item.url}, status: ${response.status}`)
              continue
            }
            buffer = Buffer.from(await response.arrayBuffer())
          }

          console.log(`[process] File loaded, size: ${buffer.length} bytes`)

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

          const base64 = buffer.toString('base64')
          contentParts.push({ inlineData: { mimeType, data: base64 } })
        } catch (fileError) {
          console.error(`[process] Error loading file: ${item.filename}`, fileError)
          continue
        }
      }

      if (contentParts.length === 0) {
        throw new Error('No se encontraron archivos para analizar')
      }

      // Add the text prompt
      contentParts.push({ text: prompt })

      console.log('[process] Sending to Gemini for analysis...')

      // Call Gemini API with retry on 429
      let result
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          result = await model.generateContent(contentParts)
          break
        } catch (err) {
          const is429 = err instanceof Error && err.message.includes('429')
          if (is429 && attempt < 2) {
            const waitSec = (attempt + 1) * 15
            console.log(`[process] Rate limited, retrying in ${waitSec}s (attempt ${attempt + 1}/3)`)
            await new Promise((r) => setTimeout(r, waitSec * 1000))
          } else {
            throw err
          }
        }
      }

      if (!result) {
        throw new Error('No se pudo obtener respuesta del modelo de IA')
      }

      // Check if response was blocked by safety filters
      const blockReason = result.response.promptFeedback?.blockReason
      if (blockReason) {
        console.error('Gemini blocked analysis response:', blockReason)
        throw new Error(`Video bloqueado por filtros de seguridad: ${blockReason}`)
      }

      const content = result.response.text()

      if (!content || content.trim().length === 0) {
        console.error('Gemini returned empty analysis response')
        throw new Error('Respuesta vacia de Gemini')
      }

      // Parse JSON from response (Gemini might wrap it in markdown code blocks)
      let jsonContent = content
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim()
      }

      // Parse response
      let analysisResult
      try {
        analysisResult = JSON.parse(jsonContent)
      } catch {
        console.error('Failed to parse Gemini analysis response:', content.substring(0, 500))
        throw new Error('Formato de respuesta invalido de Gemini')
      }

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

      // Recalculate skill score (non-blocking)
      recalculateSkillScore(session.user.id).catch((error) => {
        console.error('Failed to recalculate skill score:', error)
      })

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
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('Processing error:', errorMsg)

      // Update status to failed
      await prisma.analysis.update({
        where: { id },
        data: {
          status: 'FAILED',
          errorMessage: errorMsg.substring(0, 500),
          processingMs: Date.now() - startTime,
        },
      })

      // Check for quota exhaustion vs temporary rate limit
      if (errorMsg.includes('429')) {
        const isQuotaExhausted = errorMsg.includes('quota') || errorMsg.includes('Quota')
        if (isQuotaExhausted) {
          return NextResponse.json(
            { error: 'Cuota de IA agotada por hoy. La cuota se renueva a las 2:00 AM (hora Peru). Intenta mas tarde.' },
            { status: 429 }
          )
        }
        return NextResponse.json(
          { error: 'Servicio de IA temporalmente ocupado. Espera 30 segundos e intenta de nuevo.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: `Error al procesar: ${errorMsg.substring(0, 100)}` },
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
