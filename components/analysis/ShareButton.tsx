'use client'

import { Share2 } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { toast } from 'sonner'

interface ShareButtonProps {
  techniqueName: string
  score: number | null
}

export function ShareButton({ techniqueName, score }: ShareButtonProps) {
  async function handleShare() {
    const text = `Mi analisis de ${techniqueName} en SportTek: ${score ? `${score.toFixed(1)}/10` : 'En proceso'}`
    const url = typeof window !== 'undefined' ? window.location.href : ''

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text, url })
      } catch {
        // User cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} - ${url}`)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  return (
    <GlassButton variant="ghost" size="icon" onClick={handleShare} title="Compartir">
      <Share2 className="h-4 w-4" />
    </GlassButton>
  )
}
