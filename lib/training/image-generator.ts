import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { generateExerciseImage } from '@/lib/imagen/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface ExerciseInput {
  id: string
  name: string
  description: string
}

export async function generateExerciseImages(
  exercises: ExerciseInput[],
  sportName: string
): Promise<void> {
  // Deduplicate by name (same exercise appears on multiple days)
  const uniqueMap = new Map<string, ExerciseInput>()
  for (const ex of exercises) {
    if (!uniqueMap.has(ex.name)) {
      uniqueMap.set(ex.name, ex)
    }
  }
  const uniqueExercises = Array.from(uniqueMap.values())

  logger.info(
    `Generating images for ${uniqueExercises.length} unique exercises (from ${exercises.length} total)`
  )

  // Generate images for each unique exercise
  const imageMap = new Map<string, string>()

  for (const exercise of uniqueExercises) {
    try {
      const imageBuffer = await generateExerciseImage(
        exercise.name,
        exercise.description,
        sportName
      )

      if (!imageBuffer) continue

      const imageUrl = await storeImage(imageBuffer, exercise.id)
      if (imageUrl) {
        imageMap.set(exercise.name, imageUrl)
        logger.debug(`Generated image for: ${exercise.name}`)
      }
    } catch (error) {
      logger.warn(`Image generation failed for "${exercise.name}":`, error)
    }
  }

  // Update all exercises in the database
  const updates = exercises
    .filter((ex) => imageMap.has(ex.name))
    .map((ex) => {
      const imageUrl = imageMap.get(ex.name)!
      return prisma.exercise.update({
        where: { id: ex.id },
        data: { imageUrls: [imageUrl] },
      })
    })

  if (updates.length > 0) {
    await Promise.all(updates)
    logger.info(`Updated ${updates.length} exercises with images`)
  }
}

async function storeImage(
  buffer: Buffer,
  exerciseId: string
): Promise<string | null> {
  const filename = `exercise-${exerciseId}-${Date.now()}.png`

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const blob = await put(`exercises/${filename}`, buffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'image/png',
      })
      return blob.url
    }

    // Local storage fallback
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'generated')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    return `/uploads/generated/${filename}`
  } catch (error) {
    logger.error('Failed to store image:', error)
    return null
  }
}
