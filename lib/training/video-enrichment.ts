import { prisma } from '@/lib/prisma'
import { searchExerciseVideo } from '@/lib/youtube/client'

interface ExerciseInput {
  id: string
  name: string
  description: string
}

const DELAY_MS = 200

export async function enrichExercisesWithVideos(
  exercises: ExerciseInput[],
  sportName: string
): Promise<void> {
  // Deduplicate by name
  const uniqueMap = new Map<string, ExerciseInput>()
  for (const ex of exercises) {
    if (!uniqueMap.has(ex.name)) {
      uniqueMap.set(ex.name, ex)
    }
  }
  const uniqueExercises = Array.from(uniqueMap.values())

  console.log(
    `Searching YouTube videos for ${uniqueExercises.length} unique exercises (from ${exercises.length} total)`
  )

  const videoMap = new Map<string, string>()

  for (const exercise of uniqueExercises) {
    try {
      const videoUrl = await searchExerciseVideo(exercise.name, sportName)
      if (videoUrl) {
        videoMap.set(exercise.name, videoUrl)
      }
    } catch (error) {
      console.warn(`YouTube search failed for "${exercise.name}":`, error)
    }

    // Rate limiting
    if (uniqueExercises.indexOf(exercise) < uniqueExercises.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }
  }

  // Update all exercises in the database
  const updates = exercises
    .filter((ex) => videoMap.has(ex.name))
    .map((ex) => {
      const videoUrl = videoMap.get(ex.name)!
      return prisma.exercise.update({
        where: { id: ex.id },
        data: { videoUrl },
      })
    })

  if (updates.length > 0) {
    await Promise.all(updates)
    console.log(`Updated ${updates.length} exercises with YouTube videos`)
  }
}
