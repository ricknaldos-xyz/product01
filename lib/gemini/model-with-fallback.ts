import { logger } from '@/lib/logger'
import type { GoogleGenerativeAI, GenerateContentResult, SafetySetting, Part } from '@google/generative-ai'

// Models in order of preference (most powerful first)
// Note: Google API requires "-preview" suffix for gemini-3 models
const MODELS_PRIORITY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
]

/**
 * Attempts to generate content using models in priority order.
 * Falls back to next model if current one fails (503 overloaded, 429 rate limit, etc.)
 */
export async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  content: Part[],
  safetySettings?: SafetySetting[]
): Promise<{ result: GenerateContentResult; modelUsed: string }> {
  let lastError: Error | null = null

  for (const modelName of MODELS_PRIORITY) {
    try {
      logger.debug(`[gemini] Trying ${modelName}...`)
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: { temperature: 0 },
      })

      const result = await model.generateContent(content)
      logger.info(`[gemini] Success with ${modelName}`)
      return { result, modelUsed: modelName }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.warn(`[gemini] ${modelName} failed: ${errorMsg.substring(0, 100)}`)
      lastError = error as Error

      // If it's a 404 (model not found) or 503 (overloaded), try next model
      // If it's a different error (like safety block), might want to stop
      const shouldRetry = errorMsg.includes('503') ||
                          errorMsg.includes('404') ||
                          errorMsg.includes('429') ||
                          errorMsg.includes('overloaded')

      if (!shouldRetry) {
        // For other errors (like safety blocks), don't retry with different model
        throw error
      }
    }
  }

  throw lastError || new Error('All models failed')
}
