import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
})

// POST - Add item to cart
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
    const parsed = addItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { productId, quantity } = parsed.data

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isActive: true },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Producto no disponible' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Stock insuficiente' },
        { status: 400 }
      )
    }

    // Get or create cart
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    })

    // Check existing item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > 10) {
        return NextResponse.json(
          { error: 'Maximo 10 unidades por producto' },
          { status: 400 }
        )
      }
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: 'Stock insuficiente' },
          { status: 400 }
        )
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

    const activeItems = updatedCart!.items.filter((item) => item.product.isActive)
    const subtotalCents = activeItems.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0
    )
    const shippingCents = activeItems.length > 0 ? 1500 : 0

    return NextResponse.json({
      id: updatedCart!.id,
      items: activeItems,
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      itemCount: activeItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
