'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { logger } from '@/lib/logger'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ProductFilters } from '@/components/shop/ProductFilters'
import { SearchBar } from '@/components/shop/SearchBar'
import { CartBadge } from '@/components/shop/CartBadge'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string
  slug: string
  name: string
  brand: string
  priceCents: number
  comparePriceCents: number | null
  thumbnailUrl: string | null
  isFeatured: boolean
}

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [category, search, sort, page])

  useEffect(() => {
    fetchCartCount()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
      })
      if (category) params.set('category', category)
      if (search) params.set('search', search)

      const res = await fetch(`/api/shop/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        setTotalPages(data.totalPages)
      }
    } catch {
      logger.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCartCount() {
    try {
      const res = await fetch('/api/shop/cart')
      if (res.ok) {
        const data = await res.json()
        setCartCount(data.itemCount || 0)
      }
    } catch {
      // Not authenticated or error
    }
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSort(value)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Tienda</h1>
        </div>
        <CartBadge count={cartCount} />
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar productos..."
      />

      {/* Filters */}
      <ProductFilters
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        selectedSort={sort}
        onSortChange={handleSortChange}
      />

      {/* Product Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </GlassButton>
          <span className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </span>
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </GlassButton>
        </div>
      )}
    </div>
  )
}
