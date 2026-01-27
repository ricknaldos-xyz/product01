'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { Calendar, MapPin, Users } from 'lucide-react'

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    description: string | null
    format: string
    maxPlayers: number
    status: string
    startDate: string
    city: string | null
    venue: string | null
    participantCount: number
    organizerName: string | null
  }
}

const statusLabels: Record<string, string> = {
  REGISTRATION: 'Inscripcion abierta',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

const statusColors: Record<string, string> = {
  REGISTRATION: 'text-green-600 bg-green-100',
  IN_PROGRESS: 'text-blue-600 bg-blue-100',
  COMPLETED: 'text-slate-500 bg-slate-100',
  CANCELLED: 'text-red-500 bg-red-100',
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <GlassCard intensity="light" padding="lg" hover="lift" asChild>
      <Link href={`/tournaments/${tournament.id}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{tournament.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[tournament.status]}`}
              >
                {statusLabels[tournament.status]}
              </span>
            </div>
          </div>

          {tournament.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tournament.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(tournament.startDate).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            {tournament.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {tournament.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {tournament.participantCount}/{tournament.maxPlayers} jugadores
            </span>
            <span>{tournament.format.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </Link>
    </GlassCard>
  )
}
