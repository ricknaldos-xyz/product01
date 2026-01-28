import { NextResponse } from 'next/server'
import { getGeminiClient, SPORTS_SAFETY_SETTINGS } from '@/lib/gemini/client'

// Models to test in order of preference (based on account availability)
const MODELS_TO_TEST = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
]

// Simple diagnostic endpoint to test Gemini connectivity
export async function GET() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || ''
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 6) + '...',
    apiKeyValid: apiKey.startsWith('AIza') && apiKey.length >= 39,
  }

  const modelResults: Record<string, { status: string; error?: string }> = {}

  try {
    const genAI = getGeminiClient()
    diagnostics.clientCreated = true

    // Test each model
    for (const modelName of MODELS_TO_TEST) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          safetySettings: SPORTS_SAFETY_SETTINGS,
        })

        const result = await model.generateContent('Responde solo con: OK')
        const text = result.response.text()

        modelResults[modelName] = { status: 'OK' }

        // If this is the first working model, mark it as recommended
        if (!diagnostics.recommendedModel) {
          diagnostics.recommendedModel = modelName
          diagnostics.geminiResponse = text.substring(0, 100)
        }
      } catch (modelError) {
        const errorMsg = modelError instanceof Error ? modelError.message : String(modelError)
        modelResults[modelName] = {
          status: 'ERROR',
          error: errorMsg.substring(0, 200)
        }
      }
    }

    diagnostics.modelResults = modelResults

    if (diagnostics.recommendedModel) {
      diagnostics.status = 'OK'
      diagnostics.message = `Usar modelo: ${diagnostics.recommendedModel}`
    } else {
      diagnostics.status = 'ALL_MODELS_FAILED'
      diagnostics.message = 'Ningun modelo funciona'
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    diagnostics.status = 'ERROR'
    diagnostics.errorMessage = errorMsg
    diagnostics.modelResults = modelResults

    return NextResponse.json(diagnostics, { status: 500 })
  }
}
