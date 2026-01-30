import { logger } from '@/lib/logger'

const EMBEDDING_MODEL = 'gemini-embedding-001'
const OUTPUT_DIMENSIONS = 768  // Match pgvector column: vector(768)
const BATCH_SIZE = 5  // Small batches to avoid rate limits
const DELAY_MS = 1500  // 1.5s delay between batches (fits within 100 RPM)
const MAX_RETRIES = 3

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getApiKey(): string {
  const key = process.env.GOOGLE_AI_API_KEY?.trim()
  if (!key) throw new Error('GOOGLE_AI_API_KEY is not configured')
  return key
}

async function callEmbedApi(text: string, retryCount = 0): Promise<number[]> {
  const apiKey = getApiKey()
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
    // Retry on 429 (rate limit) with exponential backoff
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const backoffMs = Math.pow(2, retryCount + 1) * 5000 // 10s, 20s, 40s
      logger.warn(`Embedding rate limited (429), retrying in ${backoffMs / 1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      await delay(backoffMs)
      return callEmbedApi(text, retryCount + 1)
    }

    if (response.status === 429) {
      throw new Error('Cuota de la API de embeddings agotada. Intenta de nuevo en unos minutos.')
    }

    const errorText = await response.text()
    throw new Error(`Error al generar embeddings (${response.status}): ${errorText.substring(0, 200)}`)
  }

  const data = await response.json()
  return data.embedding.values
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return callEmbedApi(text)
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    // Process sequentially within batch to control rate
    for (const text of batch) {
      const embedding = await callEmbedApi(text)
      results.push(embedding)
    }

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < texts.length) {
      await delay(DELAY_MS)
    }
  }

  return results
}
