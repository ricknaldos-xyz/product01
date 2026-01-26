import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpenAIClient } from '@/lib/openai/client'
import { buildTennisPrompt } from '@/lib/openai/prompts/tennis'
import { sendAnalysisCompleteEmail } from '@/lib/email'

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

    // Update status to processing
    await prisma.analysis.update({
      where: { id },
      data: { status: 'PROCESSING' },
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
        // Generic prompt for other sports (future)
        prompt = `Analiza la tecnica deportiva en las imagenes y proporciona feedback detallado en formato JSON.`
      }

      // Prepare images for OpenAI Vision
      const imageUrls = analysis.mediaItems.map((item) => item.url)

      // Call OpenAI Vision API
      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...imageUrls.map((url) => ({
                type: 'image_url' as const,
                image_url: { url, detail: 'high' as const },
              })),
            ],
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Respuesta vacia de OpenAI')
      }

      // Parse response
      const result = JSON.parse(content)

      // Validate result structure
      if (typeof result.overallScore !== 'number' || !Array.isArray(result.issues)) {
        throw new Error('Formato de respuesta invalido')
      }

      // Save results in transaction
      await prisma.$transaction(async (tx) => {
        // Update analysis
        await tx.analysis.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            overallScore: result.overallScore,
            aiResponse: result,
            summary: result.summary || null,
            strengths: result.strengths || [],
            priorityFocus: result.priorityFocus || null,
            processingMs: Date.now() - startTime,
          },
        })

        // Create issues
        if (result.issues.length > 0) {
          await tx.issue.createMany({
            data: result.issues.map((issue: {
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
