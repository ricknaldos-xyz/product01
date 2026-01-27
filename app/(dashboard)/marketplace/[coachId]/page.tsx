'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import {
  GraduationCap,
  Star,
  MapPin,
  Loader2,
  Clock,
  BadgeCheck,
  Users,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

interface CoachDetail {
  id: string
  userId: string
  headline: string | null
  bio: string | null
  certifications: string[]
  yearsExperience: number | null
  specialties: string[]
  country: string | null
  city: string | null
  hourlyRate: number | null
  currency: string
  averageRating: number | null
  totalReviews: number
  verificationStatus: string
  isAvailable: boolean
  user: { name: string | null; image: string | null }
  reviews: { rating: number; comment: string | null; createdAt: string }[]
  _count: { students: number; reviews: number }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export default function CoachProfilePage() {
  const { coachId } = useParams<{ coachId: string }>()
  const [coach, setCoach] = useState<CoachDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchCoach() {
      try {
        const res = await fetch(`/api/marketplace/coaches/${coachId}`)
        if (res.ok) {
          const data = await res.json()
          setCoach(data)
        } else if (res.status === 404) {
          setNotFound(true)
        }
      } catch {
        console.error('Failed to fetch coach')
      } finally {
        setLoading(false)
      }
    }
    fetchCoach()
  }, [coachId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !coach) {
    return (
      <GlassCard intensity="light" padding="xl">
        <div className="text-center text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Entrenador no encontrado</p>
          <GlassButton variant="ghost" size="sm" className="mt-4" asChild>
            <Link href="/marketplace">Volver al marketplace</Link>
          </GlassButton>
        </div>
      </GlassCard>
    )
  }

  const name = coach.user.name || 'Entrenador'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {coach.user.image ? (
              <img src={coach.user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="h-10 w-10 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{name}</h1>
              {coach.verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verificado
                </span>
              )}
            </div>
            {coach.headline && (
              <p className="text-muted-foreground mt-1">{coach.headline}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {coach.averageRating && (
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(coach.averageRating)} />
                  <span className="ml-1">
                    {coach.averageRating.toFixed(1)} ({coach._count.reviews} resenas)
                  </span>
                </div>
              )}
              {coach.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {coach.city}
                </span>
              )}
              {coach.yearsExperience && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {coach.yearsExperience} anos de experiencia
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {coach._count.students} alumnos
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Rate + Contact */}
      <div className="grid gap-4 md:grid-cols-2">
        {coach.hourlyRate && (
          <GlassCard intensity="light" padding="lg">
            <p className="text-sm text-muted-foreground">Tarifa por hora</p>
            <p className="text-3xl font-bold mt-1">
              S/ {coach.hourlyRate}
              <span className="text-sm font-normal text-muted-foreground"> /hora</span>
            </p>
          </GlassCard>
        )}
        <GlassCard intensity="light" padding="lg" className="flex items-center">
          <GlassButton variant="solid" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </GlassButton>
        </GlassCard>
      </div>

      {/* Bio */}
      {coach.bio && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-2">Acerca de</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{coach.bio}</p>
        </GlassCard>
      )}

      {/* Specialties */}
      {coach.specialties.length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-3">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {coach.specialties.map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Certifications */}
      {coach.certifications.length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-3">Certificaciones</h2>
          <div className="flex flex-wrap gap-2">
            {coach.certifications.map((c, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Resenas ({coach._count.reviews})
        </h2>
        {coach.reviews.length === 0 ? (
          <GlassCard intensity="light" padding="lg">
            <p className="text-center text-sm text-muted-foreground">
              Sin resenas todavia
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {coach.reviews.map((review, i) => (
              <GlassCard key={i} intensity="light" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('es-PE')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
