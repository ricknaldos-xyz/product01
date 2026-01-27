'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { Loader2, MapPin, Phone } from 'lucide-react'

interface Workshop {
  id: string
  name: string
  address: string
  district: string
  phone: string | null
}

interface WorkshopSelectorProps {
  selectedId: string
  onSelect: (id: string) => void
}

export function WorkshopSelector({ selectedId, onSelect }: WorkshopSelectorProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        const res = await fetch('/api/stringing/workshops')
        if (res.ok) {
          const data = await res.json()
          setWorkshops(data)
        }
      } catch {
        console.error('Error fetching workshops')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkshops()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (workshops.length === 0) {
    return (
      <GlassCard intensity="light" padding="lg">
        <p className="text-center text-muted-foreground">
          No hay talleres disponibles en este momento.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Seleccionar Taller *</label>
      {workshops.map((workshop) => {
        const isSelected = selectedId === workshop.id

        return (
          <GlassCard
            key={workshop.id}
            intensity={isSelected ? 'medium' : 'light'}
            padding="md"
            hover="lift"
            className={`cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-primary border-primary/30' : ''
            }`}
            onClick={() => onSelect(workshop.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'border-primary' : 'border-muted-foreground/30'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{workshop.name}</h4>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{workshop.address}, {workshop.district}</span>
                </div>
                {workshop.phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{workshop.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
