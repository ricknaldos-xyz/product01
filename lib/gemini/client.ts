import { GoogleGenerativeAI } from '@google/generative-ai'

let _genAI: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured')
    }
    _genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY.trim())
  }
  return _genAI
}
