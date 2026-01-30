import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const MAX_RETRIES = 3

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Get analysis
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
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

    if (analysis.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Solo se pueden reintentar analisis fallidos' },
        { status: 400 }
      )
    }

    if (analysis.retryCount >= MAX_RETRIES) {
      return NextResponse.json(
        { error: `Se ha alcanzado el maximo de ${MAX_RETRIES} reintentos` },
        { status: 400 }
      )
    }

    // Reset analysis status and increment retry count
    const updatedAnalysis = await prisma.analysis.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorMessage: null,
        processingStartedAt: null,
        retryCount: { increment: 1 },
      },
      include: {
        technique: {
          include: { sport: true },
        },
        variant: true,
        mediaItems: true,
      },
    })

    // Delete existing issues if any (from previous failed attempts that might have partial data)
    await prisma.issue.deleteMany({
      where: { analysisId: id },
    })

    return NextResponse.json({
      message: 'Analisis listo para reintentarse',
      analysis: updatedAnalysis,
    })
  } catch (error) {
    logger.error('Retry analysis error:', error)
    return NextResponse.json(
      { error: 'Error al reintentar el analisis' },
      { status: 500 }
    )
  }
}
