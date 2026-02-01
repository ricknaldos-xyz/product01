import { prisma } from '@/lib/prisma'
import { FeedItemType, Prisma } from '@prisma/client'

/**
 * Create a feed item for a player's activity.
 */
export async function createFeedItem({
  userId,
  type,
  title,
  description,
  referenceId,
  referenceType,
  metadata,
  sportId,
}: {
  userId: string
  type: FeedItemType
  title: string
  description?: string
  referenceId?: string
  referenceType?: string
  metadata?: Record<string, unknown>
  sportId?: string
}): Promise<void> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!profile) return

  await prisma.feedItem.create({
    data: {
      profileId: profile.id,
      type,
      title,
      description,
      referenceId,
      referenceType,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      sportId,
    },
  })
}
