'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductAttributes } from '@/components/shop/ProductAttributes'
import { ProductReviews } from '@/components/shop/ProductReviews'
import { PriceDisplay } from '@/components/shop/PriceDisplay'
import { StarRating } from '@/components/shop/StarRating'
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductDetail {
  id: string
  slug: string
  name: string
  description: string
  shortDesc: string | null
  category: string
  brand: string
  model: string | null
  priceCents: number
  comparePriceCents: number | null
  stock: number
  images: string[]
  thumbnailUrl: string | null
  attributes: Record<string, string | number> | null
  isFeatured: boolean
  averageRating: number
  _count: { reviews: number }
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  async function fetchProduct() {
    setLoading(true)
    try {
      const res = await fetch(`/api/shop/products/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      } else {
        router.push('/tienda')
      }
    } catch {
      console.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  async function addToCart() {
    if (!product) return
    setAddingToCart(true)
    try {
      const res = await fetch('/api/shop/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })

      if (res.ok) {
        toast.success('Producto agregado al carrito')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al agregar al carrito')
      }
    } catch {
      toast.error('Error al agregar al carrito')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Producto no encontrado
      </div>
    )
  }

  const galleryImages = product.images.length > 0
    ? product.images
    : product.thumbnailUrl
    ? [product.thumbnailUrl]
    : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/tienda"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la tienda
      </Link>

      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <ProductGallery images={galleryImages} productName={product.name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
            {product.model && (
              <p className="text-sm text-muted-foreground mt-1">
                Modelo: {product.model}
              </p>
            )}
          </div>

          {/* Rating */}
          {product._count.reviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(product.averageRating)} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {product.averageRating.toFixed(1)} ({product._count.reviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <PriceDisplay
            priceCents={product.priceCents}
            comparePriceCents={product.comparePriceCents}
            className="text-xl"
          />

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-sm text-success font-medium">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">
                Agotado
              </span>
            )}
          </div>

          {/* Shipping info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Envio a Lima: S/ 15.00</span>
          </div>

          {/* Description */}
          {product.shortDesc && (
            <p className="text-sm text-muted-foreground">{product.shortDesc}</p>
          )}

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </GlassButton>
                <span className="w-10 text-center font-medium tabular-nums">
                  {quantity}
                </span>
                <GlassButton
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10 || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </GlassButton>
              </div>
              <GlassButton
                variant="solid"
                size="lg"
                className="flex-1"
                onClick={addToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Agregar al carrito
              </GlassButton>
            </div>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <GlassBadge variant="primary">Producto destacado</GlassBadge>
          )}
        </div>
      </div>

      {/* Full description */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-3">Descripcion</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {product.description}
        </p>
      </GlassCard>

      {/* Attributes */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="text-lg font-semibold mb-3">Especificaciones</h2>
          <ProductAttributes attributes={product.attributes as Record<string, string | number>} />
        </GlassCard>
      )}

      {/* Reviews */}
      <GlassCard intensity="light" padding="lg">
        <ProductReviews productSlug={product.slug} productId={product.id} />
      </GlassCard>
    </div>
  )
}
