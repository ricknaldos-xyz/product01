'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ProcessingPoller({ analysisId }: { analysisId: string }) {
  const router = useRouter()
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/${analysisId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status !== 'PROCESSING') {
            router.refresh()
          }
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [analysisId, router])
  return null
}
