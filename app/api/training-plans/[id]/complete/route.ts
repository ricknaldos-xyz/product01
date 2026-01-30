import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

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

    const plan = await prisma.trainingPlan.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    await prisma.trainingPlan.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Complete plan error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
