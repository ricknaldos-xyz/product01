import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductCategory } from '@prisma/client'

// GET - Public product listing with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as ProductCategory | null
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' }
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    let orderBy: Record<string, string>
    switch (sort) {
      case 'price_asc':
        orderBy = { priceCents: 'asc' }
        break
      case 'price_desc':
        orderBy = { priceCents: 'desc' }
        break
      case 'featured':
        orderBy = { isFeatured: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          model: true,
          category: true,
          priceCents: true,
          comparePriceCents: true,
          thumbnailUrl: true,
          isFeatured: true,
          stock: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
