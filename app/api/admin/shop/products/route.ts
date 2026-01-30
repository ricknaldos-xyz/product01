import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { ProductCategory } from '@prisma/client'

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().optional(),
  description: z.string().min(1, 'La descripcion es requerida'),
  shortDesc: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().optional(),
  priceCents: z.number().int().min(0, 'El precio debe ser mayor o igual a 0'),
  comparePriceCents: z.number().int().min(0).optional(),
  costCents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  sku: z.string().optional(),
  images: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  attributes: z.any().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') as ProductCategory | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              orderItems: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Error al listar productos:', error)
    return NextResponse.json({ error: 'Error al listar productos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slug = data.slug || generateSlug(data.name)

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese slug' },
        { status: 409 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        category: data.category,
        brand: data.brand,
        model: data.model,
        priceCents: data.priceCents,
        comparePriceCents: data.comparePriceCents,
        costCents: data.costCents,
        stock: data.stock,
        sku: data.sku,
        images: data.images || [],
        thumbnailUrl: data.thumbnailUrl,
        attributes: data.attributes,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    logger.error('Error al crear producto:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
