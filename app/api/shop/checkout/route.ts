import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkoutLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { getCulqiClient } from '@/lib/culqi'
import { Prisma } from '@prisma/client'
import { sanitizeZodError } from '@/lib/validation'

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Nombre requerido').max(100),
  shippingPhone: z.string().min(6, 'Telefono requerido').max(20),
  shippingAddress: z.string().min(5, 'Direccion requerida').max(300),
  shippingDistrict: z.string().min(2, 'Distrito requerido').max(50),
  shippingCity: z.string().max(50).default('Lima'),
  shippingNotes: z.string().max(500).optional(),
  tokenId: z.string(),
})

function generateOrderNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `ORD-${dateStr}-${random}`
}

// POST - Create checkout and process payment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { success } = await checkoutLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { tokenId } = parsed.data

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                priceCents: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito esta vacio' },
        { status: 400 }
      )
    }

    // Validate active status before transaction
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return NextResponse.json(
          { error: `El producto "${item.product.name}" ya no esta disponible` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotalCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0
    )
    const shippingCents = 1500
    const totalCents = subtotalCents + shippingCents

    // Atomically check stock, decrement, and create order in a transaction
    let order
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        order = await prisma.$transaction(async (tx) => {
          // Atomically decrement stock for each item (fails if insufficient)
          for (const item of cart.items) {
            const updated = await tx.product.updateMany({
              where: {
                id: item.product.id,
                stock: { gte: item.quantity },
              },
              data: {
                stock: { decrement: item.quantity },
              },
            })
            if (updated.count === 0) {
              throw new Error(`Stock insuficiente para "${item.product.name}"`)
            }
          }

          // Create the order inside the transaction
          return tx.shopOrder.create({
            data: {
              userId: session.user.id,
              orderNumber: generateOrderNumber(),
              subtotalCents,
              shippingCents,
              totalCents,
              shippingName: parsed.data.shippingName,
              shippingPhone: parsed.data.shippingPhone,
              shippingAddress: parsed.data.shippingAddress,
              shippingDistrict: parsed.data.shippingDistrict,
              shippingCity: parsed.data.shippingCity,
              shippingNotes: parsed.data.shippingNotes,
              items: {
                create: cart.items.map((item) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                  priceCents: item.product.priceCents,
                  productName: item.product.name,
                  productSlug: item.product.slug,
                })),
              },
            },
            include: { items: true },
          })
        })
        break
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          attempt < 2
        ) {
          continue
        }
        if (e instanceof Error && e.message.startsWith('Stock insuficiente')) {
          return NextResponse.json(
            { error: e.message },
            { status: 400 }
          )
        }
        throw e
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Error al generar numero de pedido' },
        { status: 500 }
      )
    }

    // Create Culqi charge
    try {
      const culqi = getCulqiClient()
      const charge = await culqi.charges.createCharge({
        amount: String(order.totalCents),
        currency_code: 'PEN',
        email: session.user.email || '',
        source_id: tokenId,
        metadata: {
          type: 'shop_order',
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      })

      await prisma.shopOrder.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          culqiChargeId: charge.id,
          paidAt: new Date(),
        },
      })

      // Clear cart
      const cart2 = await prisma.cart.findUnique({ where: { userId: session.user.id } })
      if (cart2) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart2.id } })
      }

      return NextResponse.json({ success: true, orderId: order.id })
    } catch (chargeError) {
      logger.error('Culqi charge failed:', chargeError)

      // Revert stock and delete order
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
      await prisma.shopOrderItem.deleteMany({ where: { orderId: order.id } })
      await prisma.shopOrder.delete({ where: { id: order.id } })

      return NextResponse.json(
        { error: 'Error al procesar el pago. Intenta de nuevo.' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
