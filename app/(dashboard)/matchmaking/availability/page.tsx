'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { logger } from '@/lib/logger'
import { GlassInput } from '@/components/ui/glass-input'
import { Clock, Plus, Trash2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

type AvailabilityDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

interface Slot {
  day: AvailabilityDay
  startTime: string
  endTime: string
}

const DAYS: { key: AvailabilityDay; label: string }[] = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miercoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
  { key: 'SATURDAY', label: 'Sabado' },
  { key: 'SUNDAY', label: 'Domingo' },
]

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSlots, setNewSlots] = useState<Record<AvailabilityDay, { startTime: string; endTime: string }>>({
    MONDAY: { startTime: '', endTime: '' },
    TUESDAY: { startTime: '', endTime: '' },
    WEDNESDAY: { startTime: '', endTime: '' },
    THURSDAY: { startTime: '', endTime: '' },
    FRIDAY: { startTime: '', endTime: '' },
    SATURDAY: { startTime: '', endTime: '' },
    SUNDAY: { startTime: '', endTime: '' },
  })

  useEffect(() => {
    fetchAvailability()
  }, [])

  async function fetchAvailability() {
    try {
      const res = await fetch('/api/player/availability')
      if (res.ok) {
        const data = await res.json()
        setSlots(data)
      }
    } catch {
      logger.error('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  function addSlot(day: AvailabilityDay) {
    const newSlot = newSlots[day]
    if (!newSlot.startTime || !newSlot.endTime) {
      toast.error('Ingresa hora de inicio y fin')
      return
    }
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin')
      return
    }
    setSlots([...slots, { day, startTime: newSlot.startTime, endTime: newSlot.endTime }])
    setNewSlots({ ...newSlots, [day]: { startTime: '', endTime: '' } })
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index))
  }

  async function saveAvailability() {
    setSaving(true)
    try {
      const res = await fetch('/api/player/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      })

      if (res.ok) {
        const data = await res.json()
        setSlots(data)
        toast.success('Disponibilidad guardada')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar disponibilidad')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Disponibilidad Semanal</h1>
        </div>
        <GlassButton
          variant="solid"
          onClick={saveAvailability}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </GlassButton>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day.key)
          const newSlot = newSlots[day.key]

          return (
            <GlassCard key={day.key} intensity="light" padding="md">
              <div className="space-y-3">
                <h3 className="font-semibold text-base">{day.label}</h3>

                {/* Existing slots */}
                {daySlots.length > 0 && (
                  <div className="space-y-2">
                    {daySlots.map((slot, _) => {
                      const globalIndex = slots.indexOf(slot)
                      return (
                        <div
                          key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="font-medium tabular-nums">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSlot(globalIndex)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add slot form */}
                <div className="flex items-center gap-2">
                  <GlassInput
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlots({
                        ...newSlots,
                        [day.key]: { ...newSlot, startTime: e.target.value },
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground text-sm">a</span>
                  <GlassInput
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlots({
                        ...newSlots,
                        [day.key]: { ...newSlot, endTime: e.target.value },
                      })
                    }
                    className="w-32"
                  />
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => addSlot(day.key)}
                  >
                    <Plus className="h-4 w-4" />
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
