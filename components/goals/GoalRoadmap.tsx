'use client'

import Link from 'next/link'
import { CheckCircle, Video, Dumbbell, Circle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'

interface RoadmapStep {
  order: number
  title: string
  description: string
  type: 'analysis' | 'training'
  completed: boolean
  linkedId: string | null
}

interface GoalRoadmapProps {
  roadmap: {
    steps: RoadmapStep[]
  }
  goalId: string
}

function getLinkedAnalysisId(steps: RoadmapStep[], currentIndex: number): string | null {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (steps[i].type === 'analysis' && steps[i].linkedId) {
      return steps[i].linkedId
    }
  }
  return null
}

export function GoalRoadmap({ roadmap, goalId }: GoalRoadmapProps) {
  const steps = [...roadmap.steps].sort((a, b) => a.order - b.order)
  const currentStepIndex = steps.findIndex((s) => !s.completed)

  return (
    <GlassCard intensity="light" padding="lg">
      <h2 className="font-semibold text-lg mb-6">Hoja de ruta</h2>

      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = step.completed
          const isCurrent = index === currentStepIndex
          const isFuture = !isCompleted && !isCurrent
          const isLast = index === steps.length - 1

          const TypeIcon = step.type === 'analysis' ? Video : Dumbbell

          return (
            <div key={step.order} className="relative flex gap-4">
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-green-500 bg-green-500/20',
                    isCurrent && 'border-primary bg-primary/20 animate-pulse',
                    isFuture && 'border-muted-foreground/30 bg-muted/30'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isCurrent ? 'text-primary' : 'text-muted-foreground/50'
                      )}
                    >
                      {step.order}
                    </span>
                  )}
                </div>

                {/* Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[24px]',
                      isCompleted ? 'bg-green-500/50' : 'bg-muted-foreground/15'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <div className="flex items-center gap-2 mb-1">
                  <TypeIcon
                    className={cn(
                      'h-4 w-4',
                      isCompleted && 'text-green-500',
                      isCurrent && 'text-primary',
                      isFuture && 'text-muted-foreground/40'
                    )}
                  />
                  <h3
                    className={cn(
                      'font-medium text-sm',
                      isFuture && 'text-muted-foreground/50'
                    )}
                  >
                    {step.title}
                  </h3>
                </div>

                <p
                  className={cn(
                    'text-sm mb-2',
                    isFuture
                      ? 'text-muted-foreground/40'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.description}
                </p>

                {/* Action button for current step */}
                {isCurrent && (
                  <div className="mt-2">
                    {step.type === 'analysis' ? (
                      <GlassButton variant="primary" size="sm" asChild>
                        <Link href="/analyze">
                          <Video className="h-4 w-4 mr-2" />
                          Grabar Video
                        </Link>
                      </GlassButton>
                    ) : (
                      <GlassButton variant="primary" size="sm" asChild>
                        <Link
                          href={`/training/generate${
                            getLinkedAnalysisId(steps, index)
                              ? `?analysisId=${getLinkedAnalysisId(steps, index)}`
                              : ''
                          }`}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Generar Plan
                        </Link>
                      </GlassButton>
                    )}
                  </div>
                )}

                {/* Link to resource if completed and has linkedId */}
                {step.linkedId && isCompleted && (
                  <Link
                    href={
                      step.type === 'analysis'
                        ? `/analyses/${step.linkedId}`
                        : `/training/${step.linkedId}`
                    }
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver {step.type === 'analysis' ? 'analisis' : 'plan'}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
