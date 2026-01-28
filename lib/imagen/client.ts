const IMAGEN_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict'

interface ImagenResponse {
  predictions?: Array<{
    bytesBase64Encoded: string
    mimeType: string
  }>
  error?: {
    code: number
    message: string
  }
}

export async function generateExerciseImage(
  exerciseName: string,
  description: string,
  sportName: string
): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return null
  }

  const prompt = buildImagePrompt(exerciseName, description, sportName)

  try {
    const response = await fetch(`${IMAGEN_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          personGeneration: 'allow_adult',
        },
      }),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as ImagenResponse | null
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`
      // Don't spam logs for billing-related errors
      if (response.status === 400 || response.status === 403) {
        console.warn('Imagen API not available (billing required):', errorMsg)
      } else {
        console.error('Imagen API error:', errorMsg)
      }
      return null
    }

    const data = (await response.json()) as ImagenResponse

    if (data.error) {
      console.error('Imagen error:', data.error.message)
      return null
    }

    if (!data.predictions || data.predictions.length === 0) {
      return null
    }

    return Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64')
  } catch (error) {
    console.error('Imagen generation failed:', error)
    return null
  }
}

function buildImagePrompt(
  exerciseName: string,
  description: string,
  sportName: string
): string {
  return `Instructional sports training diagram showing the exercise "${exerciseName}" for ${sportName}. ${description}. Style: clean line drawing on white background, similar to a sports coaching manual. Show the athlete's body position with clear anatomical outlines, directional arrows indicating movement and force direction, dotted lines showing the motion path. Use a single accent color (blue) for arrows and highlights. No background scenery, no text, no watermarks. The figure should demonstrate proper biomechanical form with emphasis on the key body positions for this specific drill.`
}
