'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Circle, Loader2, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { parseExerciseInstructions } from '@/lib/training/parse-instructions'
import { ExerciseSteps } from './exercise-steps'
import { ExerciseDetails } from './exercise-details'

interface ExerciseItemProps {
  exercise: {
    id: string
    name: string
    description: string
    instructions: string | null
    imageUrls: string[]
    videoUrl: string | null
    sets: number | null
    reps: number | null
    durationMins: number | null
    frequency: string
    targetIssues: Array<{
      issue: { title: string }
    }>
    progressLogs: Array<{ id: string }>
  }
  trainingPlanId: string
}

const DIFFICULTY_COLORS = {
  principiante: 'bg-success/15 text-success border-success/30',
  intermedio: 'bg-warning/15 text-warning border-warning/30',
  avanzado: 'bg-destructive/15 text-destructive border-destructive/30',
} as const

const DIFFICULTY_LABELS = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
} as const

export function ExerciseItem({ exercise, trainingPlanId }: ExerciseItemProps) {
  const [isCompleted, setIsCompleted] = useState(exercise.progressLogs.length > 0)
  const [isExpanded, setIsExpanded] = useState(false)
  const { toggleExercise, isLoading } = useProgress(trainingPlanId)

  const structured = parseExerciseInstructions(exercise.instructions)
  const exerciseImage = exercise.imageUrls?.[0] || null

  function handleToggle() {
    const newCompleted = !isCompleted
    setIsCompleted(newCompleted)
    toggleExercise(exercise.id, newCompleted, {
      setsCompleted: exercise.sets || undefined,
      repsCompleted: exercise.reps || undefined,
      durationMins: exercise.durationMins || undefined,
    })
  }

  return (
    <div
      className={cn(
        'p-5 transition-all duration-[var(--duration-normal)]',
        isCompleted && 'bg-success/5'
      )}
    >
      <div className="flex items-start gap-4">
        <GlassButton
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
            isCompleted
              ? 'bg-success/20 text-success hover:bg-success/30'
              : 'glass-ultralight border-glass hover:glass-light'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </GlassButton>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
                {exercise.name}
              </h4>
              {structured ? (
                <p className="text-sm text-muted-foreground mt-1">{structured.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
              )}
            </div>

            {/* Expand button (only if structured data exists) */}
            {structured && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            {structured && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                  DIFFICULTY_COLORS[structured.difficulty]
                )}
              >
                {DIFFICULTY_LABELS[structured.difficulty]}
              </span>
            )}
            {exercise.sets && (
              <GlassBadge variant="default">
                {exercise.sets} series
              </GlassBadge>
            )}
            {exercise.reps && (
              <GlassBadge variant="default">
                {exercise.reps} repeticiones
              </GlassBadge>
            )}
            {exercise.durationMins && (
              <GlassBadge variant="default">
                {exercise.durationMins} minutos
              </GlassBadge>
            )}
            <GlassBadge variant="primary">
              {exercise.frequency === 'daily'
                ? 'Diario'
                : exercise.frequency === '3x_week'
                ? '3x semana'
                : '2x semana'}
            </GlassBadge>
          </div>

          {/* Exercise image */}
          {exerciseImage && (
            <div className="mt-3 rounded-xl overflow-hidden glass-ultralight border-glass">
              <Image
                src={exerciseImage}
                alt={exercise.name}
                width={400}
                height={400}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Expanded structured content */}
          <AnimatePresence>
            {isExpanded && structured && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-5 pb-1">
                  {/* Steps timeline */}
                  <div className="p-4 glass-ultralight border-glass rounded-xl">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      Pasos
                    </h5>
                    <ExerciseSteps steps={structured.steps} />
                  </div>

                  {/* YouTube video */}
                  {exercise.videoUrl && (
                    <div className="rounded-xl overflow-hidden border-glass">
                      <iframe
                        src={exercise.videoUrl}
                        title={`Video: ${exercise.name}`}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Details: key points, mistakes, equipment, muscles */}
                  <div className="p-4 glass-ultralight border-glass rounded-xl">
                    <ExerciseDetails data={structured} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fallback: plain text instructions for old plans */}
          {!structured && exercise.instructions && (
            <div className="mt-3 p-3 glass-ultralight border-glass rounded-xl">
              <p className="text-sm">{exercise.instructions}</p>
            </div>
          )}

          {exercise.targetIssues.length > 0 && (
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">
                Corrige:{' '}
                {exercise.targetIssues
                  .map((ti) => ti.issue.title)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
