'use client'

import { Check } from 'lucide-react'

interface StringingStatusTrackerProps {
  status: string
  deliveryMode: string
  timestamps: {
    confirmedAt: string | null
    receivedAt: string | null
    completedAt: string | null
    deliveredAt: string | null
  }
}

interface TimelineStep {
  key: string
  label: string
  timestampKey?: keyof StringingStatusTrackerProps['timestamps']
}

const HOME_STEPS: TimelineStep[] = [
  { key: 'CONFIRMED', label: 'Confirmado', timestampKey: 'confirmedAt' },
  { key: 'PICKUP_SCHEDULED', label: 'Recojo programado' },
  { key: 'RECEIVED', label: 'Recibido en taller', timestampKey: 'receivedAt' },
  { key: 'IN_PROGRESS', label: 'En proceso' },
  { key: 'COMPLETED', label: 'Completado', timestampKey: 'completedAt' },
  { key: 'IN_TRANSIT', label: 'En camino' },
  { key: 'DELIVERED', label: 'Entregado', timestampKey: 'deliveredAt' },
]

const WORKSHOP_STEPS: TimelineStep[] = [
  { key: 'CONFIRMED', label: 'Confirmado', timestampKey: 'confirmedAt' },
  { key: 'RECEIVED', label: 'Recibido en taller', timestampKey: 'receivedAt' },
  { key: 'IN_PROGRESS', label: 'En proceso' },
  { key: 'COMPLETED', label: 'Completado', timestampKey: 'completedAt' },
  { key: 'READY_FOR_PICKUP', label: 'Listo para recoger' },
  { key: 'DELIVERED', label: 'Entregado', timestampKey: 'deliveredAt' },
]

function getStepStatus(
  stepIndex: number,
  activeIndex: number
): 'completed' | 'active' | 'future' {
  if (stepIndex < activeIndex) return 'completed'
  if (stepIndex === activeIndex) return 'active'
  return 'future'
}

export function StringingStatusTracker({
  status,
  deliveryMode,
  timestamps,
}: StringingStatusTrackerProps) {
  const steps = deliveryMode === 'HOME_PICKUP_DELIVERY' ? HOME_STEPS : WORKSHOP_STEPS
  const activeIndex = steps.findIndex((step) => step.key === status)

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index, activeIndex === -1 ? 0 : activeIndex)
        const timestamp = step.timestampKey ? timestamps[step.timestampKey] : null

        return (
          <div key={step.key} className="flex gap-3">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  stepStatus === 'completed'
                    ? 'bg-green-500 text-white'
                    : stepStatus === 'active'
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    stepStatus === 'completed' ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>

            {/* Label + timestamp */}
            <div className="pb-6">
              <p
                className={`text-sm font-medium ${
                  stepStatus === 'future' ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(timestamp).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
