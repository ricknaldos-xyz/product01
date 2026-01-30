'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import AdminWorkshopForm from '@/components/admin/AdminWorkshopForm'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Building2, Edit, Power, Plus, X, Phone, MapPin } from 'lucide-react'

interface Workshop {
  id: string
  name: string
  address: string
  district: string
  city: string
  phone: string | null
  isActive: boolean
  isPartner: boolean
  operatingHours: Record<string, string> | null
  _count: { stringingOrders: number }
}

export default function AdminTalleresPage() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchWorkshops = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stringing/workshops')
      if (res.ok) {
        setWorkshops(await res.json())
      }
    } catch (error) {
      logger.error('Error al cargar talleres:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkshops()
  }, [fetchWorkshops])

  const handleCreate = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/stringing/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Taller creado correctamente')
        setShowForm(false)
        fetchWorkshops()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear taller')
      }
    } catch {
      toast.error('Error al crear taller')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingWorkshop) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/stringing/workshops/${editingWorkshop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Taller actualizado correctamente')
        setEditingWorkshop(null)
        fetchWorkshops()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar taller')
      }
    } catch {
      toast.error('Error al actualizar taller')
    } finally {
      setSaving(false)
    }
  }

  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null)

  const handleToggleActive = async (workshop: Workshop) => {
    try {
      if (workshop.isActive) {
        setConfirmDeactivateId(workshop.id)
        return
      } else {
        const res = await fetch(`/api/admin/stringing/workshops/${workshop.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        })
        if (res.ok) {
          toast.success('Taller activado')
          fetchWorkshops()
        }
      }
    } catch {
      toast.error('Error al cambiar estado del taller')
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!confirmDeactivateId) return
    setConfirmDeactivateId(null)
    try {
      const res = await fetch(`/api/admin/stringing/workshops/${confirmDeactivateId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Taller desactivado')
        fetchWorkshops()
      } else {
        toast.error('Error al desactivar taller')
      }
    } catch {
      toast.error('Error al cambiar estado del taller')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/encordado')}>
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
          <div>
            <h1 className="text-2xl font-bold">Talleres</h1>
            <p className="text-muted-foreground text-sm">
              Gestion de talleres de encordado ({workshops.length})
            </p>
          </div>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingWorkshop(null)
          }}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo taller
            </>
          )}
        </GlassButton>
      </div>

      {/* Create Form */}
      {showForm && !editingWorkshop && (
        <GlassCard intensity="medium">
          <h3 className="text-lg font-semibold mb-4">Nuevo taller</h3>
          <AdminWorkshopForm onSubmit={handleCreate} loading={saving} />
        </GlassCard>
      )}

      {/* Edit Form */}
      {editingWorkshop && (
        <GlassCard intensity="medium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Editar: {editingWorkshop.name}</h3>
            <GlassButton variant="ghost" size="sm" onClick={() => setEditingWorkshop(null)}>
              <X className="h-4 w-4" />
            </GlassButton>
          </div>
          <AdminWorkshopForm
            initialData={editingWorkshop}
            onSubmit={handleUpdate}
            loading={saving}
          />
        </GlassCard>
      )}

      {/* Workshops List */}
      <div className="space-y-4">
        {workshops.map((workshop) => (
          <GlassCard
            key={workshop.id}
            intensity="light"
            className={!workshop.isActive ? 'opacity-60' : ''}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{workshop.name}</h3>
                  {workshop.isPartner && (
                    <GlassBadge variant="primary">Partner</GlassBadge>
                  )}
                  <GlassBadge variant={workshop.isActive ? 'success' : 'destructive'}>
                    {workshop.isActive ? 'Activo' : 'Inactivo'}
                  </GlassBadge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {workshop.address}, {workshop.district}, {workshop.city}
                  </p>
                  {workshop.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {workshop.phone}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {workshop._count.stringingOrders} ordenes totales
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingWorkshop(workshop)
                    setShowForm(false)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </GlassButton>
                <GlassButton
                  variant={workshop.isActive ? 'destructive' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleActive(workshop)}
                >
                  <Power className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}

        {workshops.length === 0 && (
          <GlassCard intensity="light">
            <p className="text-center text-muted-foreground py-8">
              No hay talleres registrados. Crea el primero.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Deactivation confirmation dialog */}
      {confirmDeactivateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmDeactivateId(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirmar desactivacion</h3>
            <p className="text-muted-foreground text-sm mb-6">
              ¿Estas seguro de desactivar este taller?
            </p>
            <div className="flex justify-end gap-3">
              <GlassButton variant="ghost" onClick={() => setConfirmDeactivateId(null)}>
                Cancelar
              </GlassButton>
              <GlassButton variant="destructive" onClick={handleConfirmDeactivate}>
                Desactivar
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
