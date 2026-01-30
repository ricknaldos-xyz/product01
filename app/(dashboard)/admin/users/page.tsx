'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Users, Loader2, Search, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface UserRow {
  id: string
  name: string | null
  email: string | null
  role: string
  accountType: string
  subscription: string
  createdAt: string
  lastLoginAt: string | null
  _count: {
    analyses: number
    trainingPlans: number
  }
}

interface UsersResponse {
  users: UserRow[]
  total: number
  page: number
  totalPages: number
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
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchUsers = useCallback(async (
    currentPage: number,
    searchQuery: string,
    role: string,
    accountType: string,
    subscription: string,
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('limit', '20')
      if (searchQuery) params.set('search', searchQuery)
      if (role) params.set('role', role)
      if (accountType) params.set('accountType', accountType)
      if (subscription) params.set('subscription', subscription)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const json: UsersResponse = await res.json()
        setData(json)
      }
    } catch (error) {
      logger.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(page, search, roleFilter, accountTypeFilter, subscriptionFilter)
  }, [fetchUsers, page, roleFilter, accountTypeFilter, subscriptionFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchUsers(1, value, roleFilter, accountTypeFilter, subscriptionFilter)
    }, 400)
  }

  const handleFilterChange = (
    setter: (v: string) => void,
    value: string,
  ) => {
    setter(value)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Gestionar Usuarios</h1>
      </div>

      {/* Filters */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="glass-input w-full pl-10"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
            className="glass-input"
          >
            <option value="">Todos los roles</option>
            <option value="USER">Usuario</option>
            <option value="COACH">Coach</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Account type filter */}
          <select
            value={accountTypeFilter}
            onChange={(e) => handleFilterChange(setAccountTypeFilter, e.target.value)}
            className="glass-input"
          >
            <option value="">Tipo de cuenta</option>
            <option value="PLAYER">Jugador</option>
            <option value="COACH">Coach</option>
          </select>

          {/* Subscription filter */}
          <select
            value={subscriptionFilter}
            onChange={(e) => handleFilterChange(setSubscriptionFilter, e.target.value)}
            className="glass-input"
          >
            <option value="">Suscripcion</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="ELITE">Elite</option>
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.users.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No se encontraron usuarios</h3>
            <p className="text-muted-foreground text-sm">
              Intenta ajustar los filtros o la busqueda.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <GlassCard intensity="light" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Rol
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Tipo
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Suscripcion
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Ultimo acceso
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="border-b border-glass/50 last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          {user.name || 'Sin nombre'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <GlassBadge
                            variant={ROLE_BADGE_VARIANT[user.role] || 'default'}
                            size="sm"
                          >
                            {user.role}
                          </GlassBadge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.accountType === 'PLAYER' ? 'Jugador' : 'Coach'}
                        </td>
                        <td className="px-4 py-3">
                          <GlassBadge
                            variant={user.subscription === 'ELITE' ? 'warning' : user.subscription === 'PRO' ? 'primary' : 'default'}
                            size="sm"
                          >
                            {user.subscription}
                          </GlassBadge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(user.lastLoginAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/users/${user.id}`)
                            }}
                          >
                            Ver
                          </GlassButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {data.users.map((user) => (
              <GlassCard
                key={user.id}
                intensity="light"
                padding="lg"
                hover="lift"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{user.name || 'Sin nombre'}</h3>
                      <p className="text-sm text-muted-foreground">{user.email || '-'}</p>
                    </div>
                    <GlassBadge
                      variant={ROLE_BADGE_VARIANT[user.role] || 'default'}
                      size="sm"
                    >
                      {user.role}
                    </GlassBadge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <GlassBadge
                      variant={user.subscription === 'ELITE' ? 'warning' : user.subscription === 'PRO' ? 'primary' : 'default'}
                      size="sm"
                    >
                      {user.subscription}
                    </GlassBadge>
                    <span className="text-xs text-muted-foreground">
                      {user.accountType === 'PLAYER' ? 'Jugador' : 'Coach'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Ultimo acceso: {formatDate(user.lastLoginAt)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((data.page - 1) * 20) + 1}-{Math.min(data.page * 20, data.total)} de {data.total} usuarios
              </p>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </GlassButton>
                <span className="text-sm font-medium px-2">
                  {data.page} / {data.totalPages}
                </span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
