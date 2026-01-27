'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { CheckCircle, Circle, ChevronRight, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingChecklistProps {
  analysisCount: number
  trainingPlanCount: number
}

export function OnboardingChecklist({
  analysisCount,
  trainingPlanCount,
}: OnboardingChecklistProps) {
  const { steps, completeStep } = useOnboardingStore()
  const [mounted, setMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-complete steps based on actual user data
  useEffect(() => {
    if (analysisCount > 0) {
      completeStep('first-analysis')
      completeStep('review-results')
    }
    if (trainingPlanCount > 0) {
      completeStep('training-plan')
    }
  }, [analysisCount, trainingPlanCount, completeStep])

  if (!mounted) {
    return null
  }

  const completedCount = steps.filter((s) => s.completed).length
  const allCompleted = completedCount === steps.length
  const progress = (completedCount / steps.length) * 100

  // Don't show if dismissed or all steps completed
  if (isDismissed || allCompleted) {
    return null
  }

  return (
    <GlassCard intensity="light" padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="glass-primary px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="glass-light border-glass rounded-full p-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Primeros pasos</h3>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 glass-ultralight border-glass rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-glass-border-light">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-4 px-5 py-3 transition-all duration-[var(--duration-normal)]',
              step.completed ? 'glass-ultralight' : 'hover:glass-ultralight'
            )}
          >
            {step.completed ? (
              <div className="bg-success/20 rounded-full p-0.5">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              </div>
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium text-sm',
                  step.completed && 'text-muted-foreground line-through'
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
            {!step.completed && step.href && (
              <GlassButton variant="ghost" size="sm" asChild>
                <Link href={step.href}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </GlassButton>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
