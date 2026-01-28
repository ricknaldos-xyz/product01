import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server'

let _genAI: GoogleGenerativeAI | null = null
let _fileManager: GoogleAIFileManager | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured')
    }
    _genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY.trim())
  }
  return _genAI
}

function getFileManager(): GoogleAIFileManager {
  if (!_fileManager) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured')
    }
    _fileManager = new GoogleAIFileManager(process.env.GOOGLE_AI_API_KEY.trim())
  }
  return _fileManager
}

/**
 * Upload a file buffer to Gemini's File API and wait for it to become ACTIVE.
 * Returns { mimeType, fileUri } for use in generateContent() as a fileData part.
 */
export async function uploadToGemini(
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<{ mimeType: string; fileUri: string }> {
  const fileManager = getFileManager()

  const uploadResult = await fileManager.uploadFile(buffer, {
    mimeType,
    displayName,
  })

  let file = uploadResult.file

  // Poll until the file is ACTIVE (video processing can take time)
  while (file.state === FileState.PROCESSING) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const response = await fileManager.getFile(file.name)
    file = response
  }

  if (file.state === FileState.FAILED) {
    throw new Error(`Gemini file processing failed for: ${displayName}`)
  }

  return { mimeType: file.mimeType, fileUri: file.uri }
}

export const SPORTS_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
]
