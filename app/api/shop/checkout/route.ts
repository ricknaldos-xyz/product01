import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createShopCheckoutSession } from '@/lib/shop-stripe'

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Nombre requerido').max(100),
  shippingPhone: z.string().min(6, 'Telefono requerido').max(20),
  shippingAddress: z.string().min(5, 'Direccion requerida').max(300),
  shippingDistrict: z.string().min(2, 'Distrito requerido').max(50),
  shippingCity: z.string().max(50).default('Lima'),
  shippingNotes: z.string().max(500).optional(),
})

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

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

    // Validate stock for each item
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return NextResponse.json(
          { error: `El producto "${item.product.name}" ya no esta disponible` },
          { status: 400 }
        )
      }
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${item.product.name}"` },
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

    // Generate order number
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `ORD-${dateStr}-${random}`

    // Create order
    const order = await prisma.shopOrder.create({
      data: {
        userId: session.user.id,
        orderNumber,
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

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const checkoutSession = await createShopCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      lineItems: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      successUrl: `${baseUrl}/tienda/checkout/success?orderId=${order.id}`,
      cancelUrl: `${baseUrl}/tienda/carrito`,
      customerEmail: session.user.email!,
    })

    // Clear cart after order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
