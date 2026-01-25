import { prisma } from '@/lib/prisma'
import { Severity } from '@prisma/client'

interface GeneratePlanOptions {
  analysisId: string
  userId: string
  durationWeeks?: number
}

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

export async function generateTrainingPlan({
  analysisId,
  userId,
  durationWeeks = 4,
}: GeneratePlanOptions) {
  // Get analysis with issues
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      issues: true,
      technique: {
        include: { sport: true },
      },
      trainingPlan: true,
    },
  })

  if (!analysis) {
    throw new Error('Analisis no encontrado')
  }

  if (analysis.userId !== userId) {
    throw new Error('No autorizado')
  }

  if (analysis.trainingPlan) {
    throw new Error('Ya existe un plan de entrenamiento para este analisis')
  }

  if (analysis.issues.length === 0) {
    throw new Error('No hay problemas detectados para crear un plan')
  }

  // Sort issues by severity
  const sortedIssues = [...analysis.issues].sort(
    (a, b) => SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity]
  )

  // Get relevant exercise templates
  const exerciseTemplates = await prisma.exerciseTemplate.findMany({
    where: {
      isActive: true,
      OR: [
        { sportSlugs: { has: analysis.technique.sport.slug } },
        { sportSlugs: { isEmpty: true } },
      ],
    },
  })

  // Calculate plan parameters
  const durationDays = durationWeeks * 7
  const difficulty = calculateDifficulty(sortedIssues)

  // Create the plan
  const plan = await prisma.trainingPlan.create({
    data: {
      userId,
      analysisId,
      title: `Plan de mejora: ${analysis.technique.name}`,
      description: `Plan personalizado de ${durationWeeks} semanas basado en tu analisis. Enfoque principal: ${
        analysis.priorityFocus || sortedIssues[0]?.title
      }`,
      durationDays,
      difficulty,
      status: 'ACTIVE',
    },
  })

  // Generate exercises for each day
  const exercisesPerDay = Math.max(2, Math.ceil(sortedIssues.length / 3))
  const exercisesToCreate: {
    trainingPlanId: string
    name: string
    description: string
    instructions: string
    dayNumber: number
    orderInDay: number
    sets: number | null
    reps: number | null
    durationMins: number | null
    frequency: string
    videoUrl: string | null
    imageUrls: string[]
    issueId?: string
  }[] = []

  let dayNumber = 1
  let orderInDay = 1

  for (const issue of sortedIssues) {
    // Find matching templates based on category and drills
    const relevantTemplates = exerciseTemplates.filter(
      (t) =>
        t.targetAreas.some(
          (area) =>
            issue.category.toLowerCase().includes(area.toLowerCase()) ||
            issue.drills.some((drill) =>
              drill.toLowerCase().includes(t.name.toLowerCase())
            )
        ) || t.category === 'drill'
    )

    // Use templates if found, otherwise create from issue drills
    const templates = relevantTemplates.slice(0, 2)

    if (templates.length > 0) {
      for (const template of templates) {
        exercisesToCreate.push({
          trainingPlanId: plan.id,
          name: template.name,
          description: `${template.description}\n\nPara corregir: ${issue.title}`,
          instructions: template.instructions,
          dayNumber: ((dayNumber - 1) % durationDays) + 1,
          orderInDay,
          sets: template.defaultSets,
          reps: template.defaultReps,
          durationMins: template.defaultDurationMins,
          frequency: calculateFrequency(issue.severity),
          videoUrl: template.videoUrl,
          imageUrls: template.imageUrls,
          issueId: issue.id,
        })

        orderInDay++
        if (orderInDay > exercisesPerDay) {
          orderInDay = 1
          dayNumber++
        }
      }
    } else {
      // Create exercises from issue drills
      for (const drill of issue.drills.slice(0, 2)) {
        exercisesToCreate.push({
          trainingPlanId: plan.id,
          name: drill,
          description: `Ejercicio para mejorar: ${issue.title}`,
          instructions: issue.correction,
          dayNumber: ((dayNumber - 1) % durationDays) + 1,
          orderInDay,
          sets: 3,
          reps: 15,
          durationMins: null,
          frequency: calculateFrequency(issue.severity),
          videoUrl: null,
          imageUrls: [],
          issueId: issue.id,
        })

        orderInDay++
        if (orderInDay > exercisesPerDay) {
          orderInDay = 1
          dayNumber++
        }
      }
    }
  }

  // Create exercises in batch
  const exercises = await Promise.all(
    exercisesToCreate.map((data) => {
      const { issueId, ...exerciseData } = data
      return prisma.exercise.create({
        data: exerciseData,
      })
    })
  )

  // Create exercise-issue links
  const exerciseIssueLinks = exercisesToCreate
    .map((data, index) => ({
      exerciseId: exercises[index].id,
      issueId: data.issueId,
    }))
    .filter((link) => link.issueId)

  if (exerciseIssueLinks.length > 0) {
    await prisma.exerciseIssue.createMany({
      data: exerciseIssueLinks as { exerciseId: string; issueId: string }[],
    })
  }

  // Return complete plan
  return prisma.trainingPlan.findUnique({
    where: { id: plan.id },
    include: {
      exercises: {
        include: {
          targetIssues: {
            include: { issue: true },
          },
        },
        orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
      },
      analysis: {
        include: {
          technique: true,
        },
      },
    },
  })
}

function calculateDifficulty(issues: { severity: Severity }[]): number {
  if (issues.length === 0) return 1

  const avgSeverity =
    issues.reduce((sum, i) => sum + SEVERITY_WEIGHTS[i.severity], 0) /
    issues.length

  return Math.min(5, Math.max(1, Math.round(avgSeverity)))
}

function calculateFrequency(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'daily'
    case 'MEDIUM':
      return '3x_week'
    case 'LOW':
      return '2x_week'
  }
}
