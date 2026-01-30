import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from './embeddings'
import type { ChunkCategory } from '@prisma/client'

export interface RetrievalOptions {
  sportSlug?: string
  category?: ChunkCategory | ChunkCategory[]
  technique?: string
  limit?: number
  threshold?: number
}

export interface RetrievedChunk {
  id: string
  content: string
  category: string
  technique: string | null
  sportSlug: string | null
  similarity: number
  pageStart: number | null
  documentFilename: string
}

export async function retrieveRelevantChunks(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const {
    sportSlug,
    category,
    technique,
    limit = 5,
    threshold = 0.3,
  } = options

  let queryEmbedding: number[]
  try {
    queryEmbedding = await generateEmbedding(query)
  } catch (error) {
    logger.error('Failed to generate query embedding:', error)
    return []
  }

  const vectorStr = `[${queryEmbedding.join(',')}]`

  // Build WHERE conditions dynamically
  const conditions: string[] = []
  const params: unknown[] = [vectorStr, limit]
  let paramIdx = 3 // $1 = vector, $2 = limit

  if (sportSlug) {
    conditions.push(`(dc."sportSlug" = $${paramIdx} OR dc."sportSlug" IS NULL)`)
    params.push(sportSlug)
    paramIdx++
  }

  if (category) {
    const categories = Array.isArray(category) ? category : [category]
    const placeholders = categories.map((_, i) => `$${paramIdx + i}::"ChunkCategory"`).join(', ')
    conditions.push(`dc.category IN (${placeholders})`)
    params.push(...categories)
    paramIdx += categories.length
  }

  if (technique) {
    conditions.push(`(dc.technique = $${paramIdx} OR dc.technique IS NULL)`)
    params.push(technique)
    paramIdx++
  }

  // Only include chunks that have embeddings
  conditions.push('dc.embedding IS NOT NULL')

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : 'WHERE dc.embedding IS NOT NULL'

  // Add threshold as a parameterized value to prevent SQL injection
  const thresholdParamIdx = paramIdx
  params.push(threshold)
  paramIdx++

  try {
    const results = await prisma.$queryRawUnsafe<RetrievedChunk[]>(`
      SELECT
        dc.id,
        dc.content,
        dc.category,
        dc.technique,
        dc."sportSlug" AS "sportSlug",
        dc."pageStart" AS "pageStart",
        d."originalName" AS "documentFilename",
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON dc."documentId" = d.id
      ${whereClause}
      AND 1 - (dc.embedding <=> $1::vector) > $${thresholdParamIdx}
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $2
    `, ...params)

    return results
  } catch (error) {
    logger.error('RAG retrieval failed (pgvector may not be set up):', error)
    return []
  }
}
