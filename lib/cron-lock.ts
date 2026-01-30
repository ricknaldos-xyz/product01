import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const LOCK_TTL_MS = 5 * 60 * 1000 // 5 minutes max lock time

export async function acquireCronLock(jobName: string): Promise<boolean> {
  try {
    const now = new Date()

    // Delete expired locks first
    await prisma.cronLock.deleteMany({
      where: { expiresAt: { lt: now } },
    })

    // Try to create lock (will fail if already exists due to @id uniqueness)
    await prisma.cronLock.create({
      data: {
        id: jobName,
        lockedAt: now,
        expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
      },
    })

    return true
  } catch (error) {
    // Unique constraint violation = lock already held
    logger.debug(`[cron] Lock already held for ${jobName}`)
    return false
  }
}

export async function releaseCronLock(jobName: string): Promise<void> {
  try {
    await prisma.cronLock.delete({ where: { id: jobName } })
  } catch {
    // Lock may have expired and been cleaned up
  }
}
