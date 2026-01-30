import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { verifyVideoMetadata, createVerification } from '@/lib/verification'

// POST - Trigger verification for an analysis
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: { userId: true, status: true },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analisis no encontrado' }, { status: 404 })
    }

    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // In a real system, we'd extract metadata from the uploaded video.
    // For now, we create a basic verification with placeholder data.
    const result = verifyVideoMetadata({
      hasMetadata: true,
      recordedAt: new Date(), // Would come from video EXIF
      deviceInfo: null, // Would come from video metadata
    })

    await createVerification(id, result)

    return NextResponse.json({
      verificationScore: result.verificationScore,
      status: result.verificationScore >= 60 ? 'VERIFIED' : 'PENDING_REVIEW',
    })
  } catch (error) {
    logger.error('Verify analysis error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
