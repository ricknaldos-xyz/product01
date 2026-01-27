'use client'

import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassButton } from '@/components/ui/glass-button'
import { formatPrice } from '@/lib/shop'
import { Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  category: string
  priceCents: number
  stock: number
  lowStockThreshold: number
  isActive: boolean
  thumbnailUrl: string | null
  _count: { orderItems: number; reviews: number }
}

interface AdminProductTableProps {
  products: Product[]
  onEdit: (id: string) => void
  onToggleActive: (id: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  RACKETS: 'Raquetas',
  STRINGS: 'Cuerdas',
  GRIPS: 'Grips',
  BAGS: 'Bolsos',
  SHOES: 'Zapatillas',
  APPAREL: 'Ropa',
  ACCESSORIES: 'Accesorios',
}

export default function AdminProductTable({ products, onEdit, onToggleActive }: AdminProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass text-left">
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-glass/50 hover:bg-glass/20">
              <td className="p-3">
                {product.thumbnailUrl ? (
                  <Image
                    src={product.thumbnailUrl}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </td>
              <td className="p-3">
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.slug}</p>
              </td>
              <td className="p-3">{CATEGORY_LABELS[product.category] || product.category}</td>
              <td className="p-3">{formatPrice(product.priceCents)}</td>
              <td className="p-3">
                <span
                  className={
                    product.stock === 0
                      ? 'text-destructive font-bold'
                      : product.stock <= product.lowStockThreshold
                        ? 'text-yellow-600 font-semibold'
                        : ''
                  }
                >
                  {product.stock}
                </span>
              </td>
              <td className="p-3">
                <GlassBadge variant={product.isActive ? 'success' : 'destructive'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </GlassBadge>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <GlassButton variant="ghost" size="sm" onClick={() => onEdit(product.id)}>
                    <Edit className="h-4 w-4" />
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => onToggleActive(product.id)}>
                    {product.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </GlassButton>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                No se encontraron productos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
