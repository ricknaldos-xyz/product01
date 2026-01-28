/**
 * Generate embeddings for chunks that don't have them yet.
 * Handles rate limits gracefully - can be re-run to resume where it left off.
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 */
import { prisma } from '../lib/prisma'

const EMBEDDING_MODEL = 'gemini-embedding-001'
const OUTPUT_DIMENSIONS = 768
const DELAY_BETWEEN_CALLS_MS = 700  // ~85 RPM to stay within 100 RPM limit
const RETRY_DELAY_MS = 60_000  // 1 minute wait on rate limit
const MAX_RETRIES = 3

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callEmbedApi(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: OUTPUT_DIMENSIONS,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`[${response.status}] ${errorText}`)
  }

  const data = await response.json()
  return data.embedding.values
}

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY?.trim()
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY not set')
    process.exit(1)
  }

  // Find chunks without embeddings
  const chunksWithout = await prisma.$queryRaw<Array<{ id: string; content: string }>>`
    SELECT id, content FROM document_chunks WHERE embedding IS NULL ORDER BY "chunkIndex"
  `

  const totalChunks = await prisma.documentChunk.count()
  const withEmbeddings = totalChunks - chunksWithout.length

  console.log(`Total chunks: ${totalChunks}`)
  console.log(`With embeddings: ${withEmbeddings}`)
  console.log(`Without embeddings: ${chunksWithout.length}`)

  if (chunksWithout.length === 0) {
    console.log('\nAll chunks already have embeddings!')
    await prisma.$disconnect()
    return
  }

  console.log(`\nGenerating embeddings for ${chunksWithout.length} chunks...\n`)

  let processed = 0
  let failed = 0

  for (const chunk of chunksWithout) {
    let retries = 0
    let success = false

    while (retries < MAX_RETRIES && !success) {
      try {
        const embedding = await callEmbedApi(chunk.content, apiKey)
        const vectorStr = `[${embedding.join(',')}]`

        await prisma.$executeRawUnsafe(
          `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
          vectorStr,
          chunk.id
        )

        processed++
        success = true

        if (processed % 10 === 0) {
          console.log(`  Progress: ${processed}/${chunksWithout.length} (${Math.round(processed / chunksWithout.length * 100)}%)`)
        }

        await delay(DELAY_BETWEEN_CALLS_MS)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)

        if (msg.includes('429')) {
          if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            console.log(`\n  Quota exhausted after ${processed} embeddings.`)
            console.log(`  Re-run this script later to continue from where you left off.`)
            console.log(`  Remaining: ${chunksWithout.length - processed} chunks\n`)
            await prisma.$disconnect()
            process.exit(0)
          }
          retries++
          console.log(`  Rate limited, waiting ${RETRY_DELAY_MS / 1000}s (retry ${retries}/${MAX_RETRIES})...`)
          await delay(RETRY_DELAY_MS)
        } else {
          console.error(`  Failed chunk ${chunk.id}: ${msg.substring(0, 100)}`)
          failed++
          success = true // Skip this chunk
        }
      }
    }

    if (!success) {
      console.error(`  Gave up on chunk ${chunk.id} after ${MAX_RETRIES} retries`)
      failed++
    }
  }

  console.log(`\nDone! Processed: ${processed}, Failed: ${failed}`)
  console.log(`Total with embeddings now: ${withEmbeddings + processed}/${totalChunks}`)

  await prisma.$disconnect()
}

main().catch(console.error)
