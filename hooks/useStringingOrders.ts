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

export function useStringingOrders() {
  return useQuery({
    queryKey: ['stringing-orders'],
    queryFn: () => fetchJson('/api/stringing/orders'),
  })
}

export function useStringingOrder(id: string | undefined | null) {
  return useQuery({
    queryKey: ['stringing-order', id],
    queryFn: () => fetchJson(`/api/stringing/orders/${id}`),
    enabled: !!id,
  })
}
