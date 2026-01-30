import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { processPeerReviews } from '@/lib/verification'

const peerReviewSchema = z.object({
  approved: z.boolean(),
  comment: z.string().max(500).optional(),
})

// POST - Submit peer review for an analysis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: analysisId } = await params
    const body = await request.json()
    const validated = peerReviewSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    // Can't review own analysis
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { userId: true },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analisis no encontrado' }, { status: 404 })
    }

    if (analysis.userId === session.user.id) {
      return NextResponse.json({ error: 'No puedes revisar tu propio analisis' }, { status: 400 })
    }

    const verification = await prisma.analysisVerification.findUnique({
      where: { analysisId },
    })

    if (!verification) {
      return NextResponse.json({ error: 'No hay verificacion pendiente' }, { status: 404 })
    }

    await prisma.peerReview.create({
      data: {
        verificationId: verification.id,
        reviewerId: session.user.id,
        ...validated.data,
      },
    })

    // Process reviews if enough have accumulated
    await processPeerReviews(verification.id)

    return NextResponse.json({ submitted: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya revisaste este analisis' }, { status: 400 })
    }
    logger.error('Peer review error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
