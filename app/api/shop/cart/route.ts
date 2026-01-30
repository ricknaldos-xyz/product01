import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Get or create user cart
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                priceCents: true,
                thumbnailUrl: true,
                stock: true,
                isActive: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Filter out inactive products and compute totals
    const activeItems = cart.items.filter((item) => item.product.isActive)
    const subtotalCents = activeItems.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0
    )
    const shippingCents = activeItems.length > 0 ? 1500 : 0
    const totalCents = subtotalCents + shippingCents

    return NextResponse.json({
      id: cart.id,
      items: activeItems,
      subtotalCents,
      shippingCents,
      totalCents,
      itemCount: activeItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    logger.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
