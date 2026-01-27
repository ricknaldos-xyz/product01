'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { Users, Loader2, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  isPublic: boolean
  _count: { members: number }
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch('/api/clubs')
        if (res.ok) {
          const data = await res.json()
          setClubs(data.clubs ?? data)
        }
      } catch {
        console.error('Failed to fetch clubs')
      } finally {
        setLoading(false)
      }
    }
    fetchClubs()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Clubs</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : clubs.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay clubs disponibles</p>
            <p className="text-sm mt-1">Se el primero en crear un club</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Link key={club.id} href={`/community/clubs/${club.slug}`}>
              <GlassCard intensity="light" padding="md" hover="lift" className="h-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold truncate">{club.name}</h2>
                    {club.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <Globe className="h-3 w-3" />
                        Publico
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" />
                        Privado
                      </span>
                    )}
                  </div>

                  {club.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    {club.city && <span>{club.city}</span>}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {club._count.members} miembros
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
