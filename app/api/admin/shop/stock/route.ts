import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        thumbnailUrl: true,
        category: true,
      },
      orderBy: { stock: 'asc' },
    })

    const outOfStock = products.filter((p) => p.stock === 0)
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
    )
    const healthy = products.filter((p) => p.stock > p.lowStockThreshold)

    return NextResponse.json({
      outOfStock,
      lowStock,
      healthy,
      totals: {
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        healthy: healthy.length,
        total: products.length,
      },
    })
  } catch (error) {
    logger.error('Error al obtener inventario:', error)
    return NextResponse.json({ error: 'Error al obtener inventario' }, { status: 500 })
  }
}
