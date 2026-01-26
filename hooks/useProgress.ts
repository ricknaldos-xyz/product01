'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ProgressData {
  trainingPlanId: string
  exerciseId: string
  date: string
  completed: boolean
  setsCompleted?: number
  repsCompleted?: number
  durationMins?: number
  difficulty?: number
  notes?: string
}

async function createProgress(data: ProgressData) {
  const response = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al guardar progreso')
  }

  return response.json()
}

export function useProgress(trainingPlanId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProgress,
    onSuccess: () => {
      // Invalidate training plan queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['trainingPlan', trainingPlanId] })
      toast.success('Progreso guardado')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const toggleExercise = (
    exerciseId: string,
    completed: boolean,
    options?: {
      setsCompleted?: number
      repsCompleted?: number
      durationMins?: number
      difficulty?: number
      notes?: string
    }
  ) => {
    const today = new Date().toISOString().split('T')[0]

    mutation.mutate({
      trainingPlanId,
      exerciseId,
      date: today,
      completed,
      ...options,
    })
  }

  return {
    toggleExercise,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  }
}
