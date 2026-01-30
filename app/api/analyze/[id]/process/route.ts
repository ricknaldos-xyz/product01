import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS } from '@/lib/gemini/client'
import { generateWithFallback } from '@/lib/gemini/model-with-fallback'
import { getSportPromptBuilder } from '@/lib/prompts'
import { sendAnalysisCompleteEmail } from '@/lib/email'
import { recalculateSkillScore } from '@/lib/skill-score'
import { updateGoalProgress } from '@/lib/goals/progress'
import { retrieveRelevantChunks } from '@/lib/rag/retriever'
import { buildRagContext } from '@/lib/rag/context-builder'
import { readFile } from 'fs/promises'
import path from 'path'
import { analyzeLimiter } from '@/lib/rate-limit'
import { checkAnalysisLimit } from '@/lib/subscription'

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

    // Check subscription limit for analyses
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    })

    const analysisCheck = await checkAnalysisLimit(
      session.user.id,
      userRecord?.subscription ?? 'FREE'
    )
    if (!analysisCheck.allowed) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${analysisCheck.limit} análisis gratuitos este mes. Mejora tu plan para más análisis.` },
        { status: 403 }
      )
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
        const retrievalQuery = `${analysis.technique.name} ${analysis.variant?.name || ''} técnica biomecánica errores comunes corrección ejercicios`
        logger.debug('[process] RAG query:', retrievalQuery)

        const ragChunks = await retrieveRelevantChunks(retrievalQuery, {
          sportSlug: analysis.technique.sport.slug,
          technique: analysis.technique.slug,
          limit: 8,  // More context for better analysis
          threshold: 0.4,  // Higher threshold for more relevant results
        })

        logger.debug('[process] RAG chunks retrieved:', ragChunks.length)
        if (ragChunks.length > 0) {
          logger.debug('[process] RAG top results:', ragChunks.slice(0, 3).map(c => ({
            similarity: c.similarity.toFixed(3),
            category: c.category,
            source: c.documentFilename,
          })))
        }

        ragContext = buildRagContext(ragChunks)
        logger.debug('[process] RAG context length:', ragContext.length, 'chars')
      } catch (error) {
        logger.warn('[process] RAG retrieval failed:', error)
      }

      // Build prompt based on sport and technique
      let prompt: string

      const buildPrompt = getSportPromptBuilder(analysis.technique.sport.slug)
      prompt = buildPrompt(
        analysis.technique.slug,
        analysis.variant?.slug || null,
        analysis.technique.correctForm,
        analysis.technique.commonErrors,
        ragContext
      )

      const genAI = getGeminiClient()

      // Prepare content parts for Gemini (inline base64)
      const contentParts: Array<
        | { inlineData: { mimeType: string; data: string } }
        | { text: string }
      > = []

      // Process each media item
      let failedFiles = 0
      for (const item of analysis.mediaItems) {
        logger.debug(`[process] Processing ${item.type}: ${item.filename}, url: ${item.url.substring(0, 80)}`)

        try {
          let buffer: Buffer

          // Check if it's a local file or remote URL
          if (item.url.startsWith('/uploads/')) {
            buffer = await readFile(path.join(process.cwd(), 'public', item.url))
          } else {
            const response = await fetch(item.url)
            if (!response.ok) {
              logger.error(`[process] Failed to download file: ${item.url}, status: ${response.status}`)
              failedFiles++
              continue
            }
            buffer = Buffer.from(await response.arrayBuffer())
          }

          logger.debug(`[process] File loaded, size: ${buffer.length} bytes`)

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
          logger.error(`[process] Error loading file: ${item.filename}`, fileError)
          failedFiles++
          continue
        }
      }

      if (contentParts.length === 0) {
        throw new Error(
          failedFiles > 0
            ? `No se pudieron descargar los ${failedFiles} archivo(s). Intenta subir el video de nuevo.`
            : 'No se encontraron archivos para analizar'
        )
      }

      // Add the text prompt
      contentParts.push({ text: prompt })

      logger.debug('[process] Sending to Gemini for analysis...')

      // Call Gemini API with automatic model fallback
      const { result, modelUsed } = await generateWithFallback(
        genAI,
        contentParts,
        SPORTS_SAFETY_SETTINGS
      )
      logger.debug('[process] Using model:', modelUsed)

      // Check if response was blocked by safety filters
      const blockReason = result.response.promptFeedback?.blockReason
      if (blockReason) {
        logger.error('Gemini blocked analysis response:', blockReason)
        throw new Error(`Video bloqueado por filtros de seguridad: ${blockReason}`)
      }

      const content = result.response.text()

      if (!content || content.trim().length === 0) {
        logger.error('Gemini returned empty analysis response')
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
        logger.error('Failed to parse Gemini analysis response:', content.substring(0, 500))
        throw new Error('Formato de respuesta invalido de Gemini')
      }

      // Validate result structure
      if (typeof analysisResult.overallScore !== 'number' || !Array.isArray(analysisResult.issues)) {
        throw new Error('Formato de respuesta invalido')
      }

      // Clamp score to [1.0, 10.0] with 1 decimal place
      analysisResult.overallScore = Math.max(1, Math.min(10, Math.round(analysisResult.overallScore * 10) / 10))

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
            modelUsed,
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
          logger.error('Failed to send analysis complete email:', error)
        })
      }

      // Recalculate skill score (non-blocking)
      recalculateSkillScore(session.user.id).catch((error) => {
        logger.error('Failed to recalculate skill score:', error)
      })

      // Update goal progress (non-blocking)
      updateGoalProgress(session.user.id, id).catch((error) => {
        logger.error('Failed to update goal progress:', error)
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
        logger.error('Failed to log activity:', error)
      })

      return NextResponse.json(updatedAnalysis)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error('Processing error:', errorMsg)

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
        { error: 'Error al procesar analisis' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('Process analysis error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
