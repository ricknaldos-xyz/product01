'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Loader2, Building2, Plus, MapPin, Phone, ClipboardList } from 'lucide-react'

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

export default function ProviderWorkshopsPage() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkshops = useCallback(async () => {
    try {
      const res = await fetch('/api/provider/workshops')
      if (res.ok) {
        const data = await res.json()
        setWorkshops(data.workshops || [])
      } else {
        toast.error('Error al cargar talleres')
      }
    } catch {
      toast.error('Error al cargar talleres')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkshops()
  }, [fetchWorkshops])

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
        <div>
          <h1 className="text-2xl font-bold">Mis talleres</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona tus talleres de encordado ({workshops.length})
          </p>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => router.push('/provider/workshops/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear taller
        </GlassButton>
      </div>

      <div className="space-y-4">
        {workshops.map((workshop) => (
          <GlassCard
            key={workshop.id}
            intensity="light"
            className={`cursor-pointer transition-all hover:scale-[1.01] ${!workshop.isActive ? 'opacity-60' : ''}`}
            onClick={() => router.push(`/provider/workshops/${workshop.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{workshop.name}</h3>
                  <GlassBadge variant={workshop.isActive ? 'success' : 'destructive'}>
                    {workshop.isActive ? 'Activo' : 'Inactivo'}
                  </GlassBadge>
                  {workshop.isPartner && (
                    <GlassBadge variant="primary">Partner</GlassBadge>
                  )}
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
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    {workshop._count.stringingOrders} ordenes totales
                  </p>
                </div>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/provider/workshops/${workshop.id}/orders`)
                }}
              >
                Ver pedidos
              </GlassButton>
            </div>
          </GlassCard>
        ))}

        {workshops.length === 0 && (
          <GlassCard intensity="light">
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes talleres registrados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer taller para empezar a recibir pedidos de encordado.
              </p>
              <GlassButton
                variant="primary"
                onClick={() => router.push('/provider/workshops/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear taller
              </GlassButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
