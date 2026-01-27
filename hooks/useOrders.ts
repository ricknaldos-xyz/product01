'use client'

import { useQuery } from '@tanstack/react-query'

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || 'Error desconocido')
  }
  return res.json()
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchJson('/api/shop/orders'),
  })
}

export function useOrder(id: string | undefined | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchJson(`/api/shop/orders/${id}`),
    enabled: !!id,
  })
}
