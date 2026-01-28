import { prisma } from '@/lib/prisma'
import { getGeminiClient } from '@/lib/gemini/client'
import { buildExerciseEnrichmentPrompt } from './prompts/exercise-enrichment'
import type { StructuredExerciseData } from './types'

const BATCH_SIZE = 6

interface ExerciseInput {
  id: string
  name: string
  description: string
  instructions: string
}

export async function enrichExercisesWithStructuredContent(
  exercises: ExerciseInput[],
  sportName: string,
  techniqueName: string
): Promise<void> {
  // 1. Deduplicate by name — same exercise repeats across days
  const uniqueMap = new Map<string, ExerciseInput>()
  for (const ex of exercises) {
    if (!uniqueMap.has(ex.name)) {
      uniqueMap.set(ex.name, ex)
    }
  }
  const uniqueExercises = Array.from(uniqueMap.values())

  console.log(`Enriching ${uniqueExercises.length} unique exercises (from ${exercises.length} total)`)

  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // 2. Process in batches
  const enrichmentMap = new Map<string, StructuredExerciseData>()

  for (let i = 0; i < uniqueExercises.length; i += BATCH_SIZE) {
    const batch = uniqueExercises.slice(i, i + BATCH_SIZE)
    const prompt = buildExerciseEnrichmentPrompt(batch, sportName, techniqueName)

    const result = await model.generateContent(prompt)
    const content = result.response.text()

    // Parse JSON (handle markdown code blocks)
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }

    try {
      const parsed = JSON.parse(jsonContent) as Array<{
        exerciseIndex: number
        summary: string
        steps: Array<{
          stepNumber: number
          title: string
          instruction: string
          keyCue: string
          durationSeconds?: number
        }>
        keyPoints: string[]
        commonMistakes: string[]
        muscleGroups: string[]
        difficulty: string
        equipmentNeeded: string[]
      }>

      for (const item of parsed) {
        const exercise = batch[item.exerciseIndex]
        if (!exercise) continue

        const structured: StructuredExerciseData = {
          version: 2,
          summary: item.summary || '',
          steps: (item.steps || []).map((s, idx) => ({
            stepNumber: s.stepNumber || idx + 1,
            title: s.title || `Paso ${idx + 1}`,
            instruction: s.instruction || '',
            keyCue: s.keyCue || '',
            durationSeconds: s.durationSeconds,
          })),
          keyPoints: item.keyPoints || [],
          commonMistakes: item.commonMistakes || [],
          muscleGroups: item.muscleGroups || [],
          difficulty: (['principiante', 'intermedio', 'avanzado'].includes(item.difficulty)
            ? item.difficulty
            : 'intermedio') as StructuredExerciseData['difficulty'],
          equipmentNeeded: item.equipmentNeeded || [],
        }

        enrichmentMap.set(exercise.name, structured)
      }
    } catch (parseError) {
      console.error('Failed to parse enrichment batch:', parseError)
    }
  }

  // 3. Update all exercises in database
  const updates = exercises
    .filter((ex) => enrichmentMap.has(ex.name))
    .map((ex) => {
      const structured = enrichmentMap.get(ex.name)!
      return prisma.exercise.update({
        where: { id: ex.id },
        data: { instructions: JSON.stringify(structured) },
      })
    })

  if (updates.length > 0) {
    await Promise.all(updates)
    console.log(`Enriched ${updates.length} exercises with structured content`)
  }
}
