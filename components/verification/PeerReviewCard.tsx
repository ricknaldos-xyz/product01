'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { ThumbsUp, ThumbsDown, Send, Video, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PeerReviewCardProps {
  analysisId: string
  videoUrl?: string
  onReview: (approved: boolean, comment?: string) => void
}

export function PeerReviewCard({ analysisId, videoUrl, onReview }: PeerReviewCardProps) {
  const [decision, setDecision] = useState<boolean | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (decision === null) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/analyze/${analysisId}/peer-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: decision,
          comment: comment || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Revision enviada')
        onReview(decision, comment || undefined)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al enviar revision')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <div className="space-y-4">
        {/* Video preview */}
        {videoUrl ? (
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            />
          </div>
        ) : (
          <div className="rounded-xl bg-muted aspect-video flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Video no disponible</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {decision === null ? (
          <div className="flex gap-3">
            <GlassButton
              variant="outline"
              className="flex-1 text-green-600 hover:bg-green-50"
              onClick={() => setDecision(true)}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Legitimo
            </GlassButton>
            <GlassButton
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50"
              onClick={() => setDecision(false)}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Sospechoso
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {decision ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <ThumbsUp className="h-4 w-4" />
                  Marcado como legitimo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <ThumbsDown className="h-4 w-4" />
                  Marcado como sospechoso
                </span>
              )}
              <button
                onClick={() => setDecision(null)}
                className="text-xs text-muted-foreground underline ml-auto"
              >
                Cambiar
              </button>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional..."
              rows={2}
              className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            <GlassButton
              variant="solid"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar revision
            </GlassButton>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
