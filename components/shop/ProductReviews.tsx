'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { StarRating } from './StarRating'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isVerifiedPurchase: boolean
  createdAt: string
  user: { name: string | null; image: string | null }
}

interface ProductReviewsProps {
  productSlug: string
  productId: string
}

export function ProductReviews({ productSlug, productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productSlug])

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/shop/products/${productSlug}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
      }
    } catch {
      console.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  async function submitReview() {
    if (rating === 0) {
      toast.error('Selecciona una calificacion')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/shop/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title: title || undefined, comment: comment || undefined }),
      })

      if (res.ok) {
        const data = await res.json()
        setReviews((prev) => [data.review, ...prev])
        setShowForm(false)
        setRating(0)
        setTitle('')
        setComment('')
        toast.success('Review publicada')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al publicar review')
      }
    } catch {
      toast.error('Error al publicar review')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(averageRating)} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} de 5
              </span>
            </div>
          )}
        </div>
        <GlassButton
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          Escribir review
        </GlassButton>
      </div>

      {/* Review form */}
      {showForm && (
        <GlassCard intensity="light" padding="lg">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Calificacion</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Titulo (opcional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input w-full"
                placeholder="Resumen de tu opinion"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Comentario (opcional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="glass-input w-full min-h-[80px]"
                placeholder="Comparte tu experiencia con este producto"
                maxLength={1000}
              />
            </div>
            <div className="flex gap-2">
              <GlassButton
                variant="solid"
                onClick={submitReview}
                disabled={submitting || rating === 0}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Publicar review
              </GlassButton>
              <GlassButton variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aun no hay reviews para este producto. Se el primero en opinar.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <GlassCard key={review.id} intensity="ultralight" padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {review.user.name || 'Usuario'}
                    </span>
                    {review.isVerifiedPurchase && (
                      <GlassBadge variant="success" size="sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Compra verificada
                      </GlassBadge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('es-PE')}
                  </span>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                {review.title && (
                  <p className="font-medium text-sm">{review.title}</p>
                )}
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
