'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { logger } from '@/lib/logger'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Users, Loader2, MapPin, Crown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'

interface ClubMember {
  id: string
  role: string
  profile: {
    userId: string
    displayName: string | null
    avatarUrl: string | null
    skillTier: SkillTier
    user: { name: string | null; image: string | null }
  }
}

interface ClubDetail {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  isPublic: boolean
  maxMembers: number
  owner: {
    userId: string
    displayName: string | null
    user: { name: string | null }
  }
  members: ClubMember[]
  _count: { members: number }
}

export default function ClubDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function fetchClub() {
      try {
        const res = await fetch(`/api/clubs/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setClub(data)
          setIsMember(data.isMember ?? false)
        }
      } catch {
        logger.error('Failed to fetch club')
      } finally {
        setLoading(false)
      }
    }
    fetchClub()
  }, [slug])

  async function handleJoinLeave() {
    if (!club) return
    setJoining(true)
    try {
      const method = isMember ? 'DELETE' : 'POST'
      const res = await fetch(`/api/clubs/${slug}/join`, { method })
      if (res.ok) {
        setIsMember(!isMember)
        toast.success(isMember ? 'Saliste del club' : 'Te uniste al club')
        // Re-fetch club data
        const updated = await fetch(`/api/clubs/${slug}`)
        if (updated.ok) {
          const data = await updated.json()
          setClub(data)
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar la solicitud')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!club) {
    return (
      <GlassCard intensity="light" padding="xl">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Club no encontrado</p>
        </div>
      </GlassCard>
    )
  }

  const ownerName = club.owner.displayName || club.owner.user.name || 'Desconocido'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlassCard intensity="medium" padding="lg">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{club.name}</h1>
              {club.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {club.city}
                </p>
              )}
            </div>
            <GlassButton
              variant={isMember ? 'outline' : 'solid'}
              size="sm"
              onClick={handleJoinLeave}
              disabled={joining}
            >
              {joining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isMember ? (
                'Salir'
              ) : (
                'Unirse'
              )}
            </GlassButton>
          </div>

          {club.description && (
            <p className="text-sm text-muted-foreground">{club.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              {ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {club._count.members} / {club.maxMembers} miembros
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Miembros</h2>
        {club.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay miembros aun</p>
        ) : (
          <div className="space-y-3">
            {club.members.map((member) => {
              const name =
                member.profile.displayName || member.profile.user.name || 'Jugador'
              const avatar = member.profile.avatarUrl || member.profile.user.image

              return (
                <Link
                  key={member.id}
                  href={`/player/${member.profile.userId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="relative h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <Image src={avatar} alt="" fill className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{name}</span>
                    <TierBadge tier={member.profile.skillTier} size="sm" />
                    {member.role === 'owner' && (
                      <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
