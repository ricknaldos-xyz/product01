'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Star, MapPin, GraduationCap, Users, BadgeCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CoachCardProps {
  coach: {
    id: string
    userId: string
    headline: string | null
    specialties: string[]
    yearsExperience: number | null
    city: string | null
    hourlyRate: number | null
    currency: string
    averageRating: number | null
    totalReviews: number
    verificationStatus: string
    userName: string | null
    userImage: string | null
    studentCount: number
  }
}

export function CoachCard({ coach }: CoachCardProps) {
  const name = coach.userName || 'Entrenador'

  return (
    <GlassCard intensity="light" padding="lg" hover="lift" asChild>
      <Link href={`/marketplace/${coach.id}`}>
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {coach.userImage ? (
              <img
                src={coach.userImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <GraduationCap className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{name}</p>
              {coach.verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verificado
                </span>
              )}
            </div>
            {coach.headline && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {coach.headline}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {coach.averageRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {coach.averageRating.toFixed(1)} ({coach.totalReviews})
                </span>
              )}
              {coach.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {coach.city}
                </span>
              )}
              {coach.yearsExperience && (
                <span>{coach.yearsExperience} anos exp.</span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {coach.studentCount} alumnos
              </span>
            </div>
            {coach.hourlyRate && (
              <p className="text-sm font-semibold mt-2">
                S/ {coach.hourlyRate}/hora
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
        </div>
      </Link>
    </GlassCard>
  )
}
