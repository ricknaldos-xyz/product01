'use client'

import { useQuery } from '@tanstack/react-query'

interface ProductFilters {
  category?: string
  brand?: string
  search?: string
  sort?: string
  page?: number
  limit?: number
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || 'Error desconocido')
  }
  return res.json()
}

export function useProducts(filters?: ProductFilters) {
  const params = new URLSearchParams()
  if (filters?.category) params.set('category', filters.category)
  if (filters?.brand) params.set('brand', filters.brand)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.sort) params.set('sort', filters.sort)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))

  const queryString = params.toString()
  const url = `/api/shop/products${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchJson(url),
  })
}

export function useProduct(slug: string | undefined | null) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchJson(`/api/shop/products/${slug}`),
    enabled: !!slug,
  })
}
