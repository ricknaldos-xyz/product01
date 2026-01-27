import { prisma } from '@/lib/prisma'
import { Severity } from '@prisma/client'
import { retrieveRelevantChunks } from '@/lib/rag/retriever'
import { getGeminiClient } from '@/lib/gemini/client'
import { enrichExercisesWithStructuredContent } from '@/lib/training/enrichment'
import { generateExerciseImages } from '@/lib/training/image-generator'
import { enrichExercisesWithVideos } from '@/lib/training/video-enrichment'
import { buildPlanGenerationPrompt } from '@/lib/training/prompts/plan-generation'

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

interface ExerciseBlueprint {
  name: string
  description: string
  instructions: string
  sets: number | null
  reps: number | null
  durationMins: number | null
  frequency: string
  videoUrl: string | null
  imageUrls: string[]
  issueIds: string[]
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

  // --- Phase A: Generate exercise pool via Gemini ---
  const exercisePool = await buildExercisePool(
    sortedIssues,
    analysis.technique.sport.slug,
    analysis.technique.sport.name,
    analysis.technique.slug,
    analysis.technique.name
  )

  // --- Phase B: Distribute exercises across all training days with progression ---
  const trainingDaysPerWeek = Math.min(6, Math.max(3, difficulty + 1))
  const exercisesPerDay = Math.max(2, Math.min(4, Math.ceil(exercisePool.length / trainingDaysPerWeek)))

  // Space training days evenly across the week
  const trainingDayOffsets: number[] = []
  for (let i = 0; i < trainingDaysPerWeek; i++) {
    trainingDayOffsets.push(Math.round((i * 7) / trainingDaysPerWeek))
  }

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
    issueIds: string[]
  }[] = []

  for (let week = 1; week <= durationWeeks; week++) {
    for (let dayIdx = 0; dayIdx < trainingDayOffsets.length; dayIdx++) {
      const absoluteDay = (week - 1) * 7 + trainingDayOffsets[dayIdx] + 1
      if (absoluteDay > durationDays) break

      // Filter exercises eligible for this day based on frequency
      const eligible = exercisePool.filter((bp) => {
        if (bp.frequency === 'daily') return true
        if (bp.frequency === '3x_week') {
          return dayIdx % 2 === 0 || dayIdx === trainingDaysPerWeek - 1
        }
        if (bp.frequency === '2x_week') {
          return dayIdx === 0 || dayIdx === Math.floor(trainingDaysPerWeek / 2)
        }
        return true
      })

      if (eligible.length === 0) continue

      // Rotate through eligible exercises, offset by dayIdx to vary each day
      const count = Math.min(exercisesPerDay, eligible.length)
      for (let e = 0; e < count; e++) {
        const poolIdx = (dayIdx + e) % eligible.length
        const blueprint = eligible[poolIdx]
        const { sets, reps, durationMins } = applyProgression(
          { sets: blueprint.sets, reps: blueprint.reps, durationMins: blueprint.durationMins },
          week
        )

        exercisesToCreate.push({
          trainingPlanId: plan.id,
          name: blueprint.name,
          description: blueprint.description,
          instructions: blueprint.instructions,
          dayNumber: absoluteDay,
          orderInDay: e + 1,
          sets,
          reps,
          durationMins,
          frequency: blueprint.frequency,
          videoUrl: blueprint.videoUrl,
          imageUrls: blueprint.imageUrls,
          issueIds: blueprint.issueIds,
        })
      }
    }
  }

  // Create exercises in batch
  const exercises = await Promise.all(
    exercisesToCreate.map((data) => {
      const { issueIds, ...exerciseData } = data
      return prisma.exercise.create({
        data: exerciseData,
      })
    })
  )

  // Enrich exercises with structured step-by-step content
  try {
    await enrichExercisesWithStructuredContent(
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        instructions: ex.instructions,
      })),
      analysis.technique.sport.name,
      analysis.technique.name
    )
  } catch (error) {
    console.warn('Exercise enrichment failed, falling back to basic instructions:', error)
  }

  // Generate exercise images
  try {
    await generateExerciseImages(
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
      })),
      analysis.technique.sport.name
    )
  } catch (error) {
    console.warn('Exercise image generation failed:', error)
  }

  // Enrich exercises with YouTube demonstration videos
  try {
    await enrichExercisesWithVideos(
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
      })),
      analysis.technique.sport.name
    )
  } catch (error) {
    console.warn('Video enrichment failed:', error)
  }

  // Create exercise-issue links
  const exerciseIssueLinks = exercisesToCreate.flatMap((data, index) =>
    data.issueIds.map((issueId) => ({
      exerciseId: exercises[index].id,
      issueId,
    }))
  )

  if (exerciseIssueLinks.length > 0) {
    await prisma.exerciseIssue.createMany({
      data: exerciseIssueLinks,
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

// --- Phase A: Build exercise pool using Gemini ---

async function buildExercisePool(
  issues: Array<{
    id: string
    title: string
    category: string
    severity: Severity
    description: string
    correction: string
    drills: string[]
  }>,
  sportSlug: string,
  sportName: string,
  techniqueSlug: string,
  techniqueName: string
): Promise<ExerciseBlueprint[]> {
  // 1. Gather RAG context as reference material
  const ragContext = await gatherRagContext(issues, sportSlug, techniqueSlug, techniqueName)

  // 2. Call Gemini to generate exercises
  const prompt = buildPlanGenerationPrompt(
    sportName,
    techniqueName,
    issues.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      severity: i.severity,
      description: i.description,
      correction: i.correction,
      drills: i.drills,
    })),
    ragContext
  )

  const validIssueIds = new Set(issues.map((i) => i.id))

  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    // Parse JSON (handle markdown code blocks)
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(jsonContent) as Array<{
      name: string
      description: string
      instructions: string
      targetIssueIds: string[]
      sets: number | null
      reps: number | null
      durationMins: number | null
      frequency: string
      category: string
    }>

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Gemini returned empty or invalid array')
    }

    const pool: ExerciseBlueprint[] = parsed.map((item) => ({
      name: (item.name || 'Ejercicio').substring(0, 60),
      description: item.description || '',
      instructions: item.instructions || item.description || '',
      sets: typeof item.sets === 'number' ? item.sets : 3,
      reps: typeof item.reps === 'number' ? item.reps : null,
      durationMins: typeof item.durationMins === 'number' ? item.durationMins : null,
      frequency: ['daily', '3x_week', '2x_week'].includes(item.frequency)
        ? item.frequency
        : 'daily',
      videoUrl: null,
      imageUrls: [],
      issueIds: (item.targetIssueIds || []).filter((id) => validIssueIds.has(id)),
    }))

    // Validate: ensure every issue has at least 1 exercise
    const coveredIssueIds = new Set(pool.flatMap((e) => e.issueIds))
    for (const issue of issues) {
      if (!coveredIssueIds.has(issue.id)) {
        pool.push(buildFallbackExercise(issue))
      }
    }

    console.log(`Gemini generated ${pool.length} exercises for ${issues.length} issues`)
    return pool
  } catch (error) {
    console.error('Gemini exercise generation failed, using fallback:', error)
    return buildFallbackPool(issues)
  }
}

async function gatherRagContext(
  issues: Array<{ title: string; category: string }>,
  sportSlug: string,
  techniqueSlug: string,
  techniqueName: string
): Promise<string> {
  const chunks: string[] = []

  for (const issue of issues) {
    try {
      const ragChunks = await retrieveRelevantChunks(
        `${issue.title} ${issue.category} ejercicio drill corrección ${techniqueName}`,
        {
          sportSlug,
          category: ['EXERCISE', 'TRAINING_PLAN'],
          technique: techniqueSlug,
          limit: 2,
          threshold: 0.35,
        }
      )

      for (const chunk of ragChunks) {
        chunks.push(
          `--- Referencia (relevancia: ${chunk.similarity.toFixed(2)}) ---\n${chunk.content.substring(0, 500)}`
        )
      }
    } catch {
      // RAG retrieval failed for this issue, continue
    }
  }

  // Deduplicate by content prefix
  const seen = new Set<string>()
  const unique = chunks.filter((c) => {
    const key = c.substring(0, 100)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.join('\n\n')
}

function buildFallbackExercise(issue: {
  id: string
  title: string
  description: string
  correction: string
  severity: Severity
}): ExerciseBlueprint {
  return {
    name: `Corrección: ${issue.title}`.substring(0, 60),
    description: issue.description,
    instructions: issue.correction,
    sets: 3,
    reps: 15,
    durationMins: null,
    frequency: calculateFrequency(issue.severity),
    videoUrl: null,
    imageUrls: [],
    issueIds: [issue.id],
  }
}

function buildFallbackPool(
  issues: Array<{
    id: string
    title: string
    description: string
    correction: string
    severity: Severity
    drills: string[]
  }>
): ExerciseBlueprint[] {
  const pool: ExerciseBlueprint[] = []

  for (const issue of issues) {
    // Use drills if available
    for (const drill of issue.drills.slice(0, 2)) {
      const drillName = drill.includes(':') ? drill.split(':')[0].trim() : drill
      const drillInstructions = drill.includes(':')
        ? drill.split(':').slice(1).join(':').trim()
        : issue.correction

      pool.push({
        name: drillName.substring(0, 60),
        description: `Ejercicio para mejorar: ${issue.title}`,
        instructions: drillInstructions,
        sets: 3,
        reps: 15,
        durationMins: null,
        frequency: calculateFrequency(issue.severity),
        videoUrl: null,
        imageUrls: [],
        issueIds: [issue.id],
      })
    }

    // Always add a correction exercise if no drills
    if (issue.drills.length === 0) {
      pool.push(buildFallbackExercise(issue))
    }
  }

  return pool
}

// --- Helpers ---

function applyProgression(
  base: { sets: number | null; reps: number | null; durationMins: number | null },
  week: number
): { sets: number | null; reps: number | null; durationMins: number | null } {
  const multiplier = 1 + (week - 1) * 0.15
  return {
    sets: base.sets ? Math.round(base.sets * multiplier) : null,
    reps: base.reps ? Math.round(base.reps * multiplier) : null,
    durationMins: base.durationMins ? Math.round(base.durationMins * multiplier) : null,
  }
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
