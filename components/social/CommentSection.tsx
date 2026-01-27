'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'

interface CommentAuthor {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  user: { name: string | null; image: string | null }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: CommentAuthor
}

interface CommentSectionProps {
  targetId: string
  targetType: string
}

export function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/social/comments/${targetType}/${targetId}`)
        if (res.ok) {
          const data = await res.json()
          setComments(data.comments)
        }
      } catch {
        console.error('Failed to fetch comments')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [targetId, targetType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType, content: newComment.trim() }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments((prev) => [comment, ...prev])
        setNewComment('')
        toast.success('Comentario publicado')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al publicar comentario')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard intensity="light" padding="md">
      <h3 className="text-sm font-semibold mb-4">Comentarios</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay comentarios aun. Se el primero en comentar.
        </p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((comment) => {
            const name =
              comment.author.displayName || comment.author.user.name || 'Jugador'
            const avatar = comment.author.avatarUrl || comment.author.user.image

            return (
              <div key={comment.id} className="flex items-start gap-3">
                <Link
                  href={`/player/${comment.author.userId}`}
                  className="flex-shrink-0"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/player/${comment.author.userId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {name}
                    </Link>
                    <TierBadge tier={comment.author.skillTier} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-2 border-t border-glass">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={1000}
          rows={2}
          className="flex-1 resize-none rounded-lg bg-white/5 border border-glass px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <GlassButton
          type="submit"
          variant="solid"
          size="icon"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </GlassButton>
      </form>
    </GlassCard>
  )
}
