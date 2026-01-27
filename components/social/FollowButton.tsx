'use client'

import { useState } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  profileId: string
  initialFollowing?: boolean
}

export function FollowButton({ profileId, initialFollowing = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const method = following ? 'DELETE' : 'POST'
      const res = await fetch(`/api/social/follow/${profileId}`, { method })

      if (res.ok) {
        setFollowing(!following)
        toast.success(following ? 'Dejaste de seguir' : 'Ahora sigues a este jugador')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar la solicitud')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassButton
      variant={following ? 'outline' : 'solid'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        'Siguiendo'
      ) : (
        'Seguir'
      )}
    </GlassButton>
  )
}
