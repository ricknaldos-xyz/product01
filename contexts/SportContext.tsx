'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

interface SportInfo {
  id: string
  slug: string
  name: string
  icon: string | null
}

interface SportContextValue {
  activeSport: SportInfo | null
  setActiveSport: (sport: SportInfo) => void
  userSports: SportInfo[]
  isLoading: boolean
}

const SportContext = createContext<SportContextValue>({
  activeSport: null,
  setActiveSport: () => {},
  userSports: [],
  isLoading: true,
})

const STORAGE_KEY = 'activeSportSlug'

export function SportProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [userSports, setUserSports] = useState<SportInfo[]>([])
  const [activeSport, setActiveSportState] = useState<SportInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user sports when session is available
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchSports() {
      try {
        const res = await fetch('/api/player/sports')
        if (!res.ok) throw new Error('Failed to fetch sports')
        const data: SportInfo[] = await res.json()

        if (cancelled) return

        setUserSports(data)

        // Restore active sport from localStorage
        const savedSlug = localStorage.getItem(STORAGE_KEY)
        const saved = data.find((s) => s.slug === savedSlug)
        setActiveSportState(saved ?? data[0] ?? null)
      } catch (error) {
        logger.error('[SportContext] Failed to fetch sports:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSports()
    return () => { cancelled = true }
  }, [session?.user])

  const setActiveSport = useCallback((sport: SportInfo) => {
    setActiveSportState(sport)
    localStorage.setItem(STORAGE_KEY, sport.slug)
  }, [])

  return (
    <SportContext.Provider value={{ activeSport, setActiveSport, userSports, isLoading }}>
      {children}
    </SportContext.Provider>
  )
}

export function useSport() {
  return useContext(SportContext)
}
