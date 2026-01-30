'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, User, BarChart3, ClipboardList,
  Shield, CheckCircle, Save,
} from 'lucide-react'

interface PlayerProfile {
  id: string
  displayName: string | null
  country: string | null
  tier: string | null
}

interface CoachProfile {
  id: string
  headline: string | null
  isVerified: boolean
  _count?: { students: number }
}

interface UserDetail {
  id: string
  name: string | null
  email: string | null
  role: string
  accountType: string
  subscription: string
  createdAt: string
  lastLoginAt: string | null
  playerProfile: PlayerProfile | null
  coachProfile: CoachProfile | null
  _count: {
    analyses: number
    trainingPlans: number
  }
}

const ROLE_BADGE_VARIANT: Record<string, 'destructive' | 'primary' | 'default'> = {
  ADMIN: 'destructive',
  COACH: 'primary',
  USER: 'default',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editRole, setEditRole] = useState('')
  const [editSubscription, setEditSubscription] = useState('')

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data: UserDetail = await res.json()
        setUser(data)
        setEditRole(data.role)
        setEditSubscription(data.subscription)
      } else if (res.status === 404) {
        toast.error('Usuario no encontrado')
        router.push('/admin/users')
      }
    } catch (error) {
      logger.error('Error fetching user:', error)
      toast.error('Error al cargar usuario')
    } finally {
      setLoading(false)
    }
  }, [userId, router])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSave = async () => {
    if (!user) return

    const changes: Record<string, string> = {}
    if (editRole !== user.role) changes.role = editRole
    if (editSubscription !== user.subscription) changes.subscription = editSubscription

    if (Object.keys(changes).length === 0) {
      toast.info('No hay cambios para guardar')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })

      if (res.ok) {
        toast.success('Usuario actualizado correctamente')
        fetchUser()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al actualizar usuario')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = user && (editRole !== user.role || editSubscription !== user.subscription)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <User className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Usuario no encontrado</h3>
            <GlassButton variant="ghost" onClick={() => router.push('/admin/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a usuarios
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <GlassButton variant="ghost" onClick={() => router.push('/admin/users')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a usuarios
      </GlassButton>

      {/* User info card */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name || 'Sin nombre'}</h1>
              <GlassBadge
                variant={ROLE_BADGE_VARIANT[user.role] || 'default'}
                size="sm"
              >
                {user.role}
              </GlassBadge>
            </div>
            <p className="text-muted-foreground">{user.email || 'Sin email'}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
              <span>Creado: {formatDate(user.createdAt)}</span>
              <span>Ultimo acceso: {formatDate(user.lastLoginAt)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard intensity="light" padding="md">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{user._count.analyses}</p>
              <p className="text-xs text-muted-foreground">Analisis</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{user._count.trainingPlans}</p>
              <p className="text-xs text-muted-foreground">Planes de entrenamiento</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold">{user.accountType === 'PLAYER' ? 'Jugador' : 'Coach'}</p>
              <p className="text-xs text-muted-foreground">Tipo de cuenta</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <GlassBadge
                variant={user.subscription === 'ELITE' ? 'warning' : user.subscription === 'PRO' ? 'primary' : 'default'}
                size="sm"
              >
                {user.subscription}
              </GlassBadge>
              <p className="text-xs text-muted-foreground mt-1">Suscripcion</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Player profile */}
      {user.playerProfile && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="text-lg font-semibold mb-4">Perfil de Jugador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Nombre de display</p>
              <p className="font-medium mt-1">{user.playerProfile.displayName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pais</p>
              <p className="font-medium mt-1">{user.playerProfile.country || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Nivel</p>
              <p className="font-medium mt-1">{user.playerProfile.tier || '-'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Coach profile */}
      {user.coachProfile && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="text-lg font-semibold mb-4">Perfil de Coach</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Titular</p>
              <p className="font-medium mt-1">{user.coachProfile.headline || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Verificacion</p>
              <div className="mt-1">
                <GlassBadge
                  variant={user.coachProfile.isVerified ? 'success' : 'warning'}
                  size="sm"
                >
                  {user.coachProfile.isVerified ? 'Verificado' : 'Pendiente'}
                </GlassBadge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Estudiantes</p>
              <p className="font-medium mt-1">{user.coachProfile._count?.students ?? '-'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Edit section */}
      <GlassCard intensity="medium" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Editar Usuario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rol
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="glass-input w-full"
            >
              <option value="USER">Usuario</option>
              <option value="COACH">Coach</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suscripcion
            </label>
            <select
              value={editSubscription}
              onChange={(e) => setEditSubscription(e.target.value)}
              className="glass-input w-full"
            >
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
              <option value="ELITE">Elite</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <GlassButton
            variant="solid"
            size="lg"
            disabled={saving || !hasChanges}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
