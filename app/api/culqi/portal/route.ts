import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getCulqiClient } from '@/lib/culqi'

// DELETE - Cancel subscription
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { culqiSubscriptionId: true, subscription: true },
    })

    if (!user?.culqiSubscriptionId) {
      return NextResponse.json(
        { error: 'No tienes suscripcion activa' },
        { status: 400 }
      )
    }

    const culqi = getCulqiClient()
    await culqi.subscriptions.deleteSubscription({
      id: user.culqiSubscriptionId,
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscription: 'FREE',
        culqiSubscriptionId: null,
        culqiCurrentPeriodEnd: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripcion' },
      { status: 500 }
    )
  }
}

// GET - Get subscription info
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscription: true,
        culqiSubscriptionId: true,
        culqiCurrentPeriodEnd: true,
      },
    })

    return NextResponse.json({
      subscription: user?.subscription || 'FREE',
      hasActiveSubscription: !!user?.culqiSubscriptionId,
      periodEnd: user?.culqiCurrentPeriodEnd,
    })
  } catch (error) {
    logger.error('Get subscription info error:', error)
    return NextResponse.json(
      { error: 'Error al obtener info' },
      { status: 500 }
    )
  }
}
