import { NextResponse } from 'next/server'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS } from '@/lib/gemini/client'

// Simple diagnostic endpoint to test Gemini connectivity
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY,
    apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length || 0,
  }

  try {
    const genAI = getGeminiClient()
    diagnostics.clientCreated = true

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: SPORTS_SAFETY_SETTINGS,
    })
    diagnostics.modelCreated = true

    // Simple text-only test (no video)
    const result = await model.generateContent('Responde solo con: OK')
    const text = result.response.text()

    diagnostics.geminiResponse = text.substring(0, 100)
    diagnostics.status = 'OK'
    diagnostics.message = 'Gemini funciona correctamente'

    return NextResponse.json(diagnostics)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    diagnostics.status = 'ERROR'
    diagnostics.errorMessage = errorMsg
    diagnostics.errorType = errorMsg.includes('429')
      ? 'RATE_LIMIT'
      : errorMsg.includes('API_KEY') || errorMsg.includes('key')
      ? 'API_KEY_INVALID'
      : 'UNKNOWN'

    return NextResponse.json(diagnostics, { status: 500 })
  }
}
