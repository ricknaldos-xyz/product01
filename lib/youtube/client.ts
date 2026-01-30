import { logger } from '@/lib/logger'

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

// Trusted tennis coaching channel names (matched case-insensitively against channelTitle)
// Using names instead of channel IDs because IDs can change and are hard to verify
const TRUSTED_CHANNEL_NAMES = [
  'essential tennis',
  'top tennis training',
  'intuitive tennis',
  'tennis with masha',
  'meike babel',
  'mytennishq',
  'tennis spin',
  'tenis tips',
  'feel tennis',
  'tennis evolution',
  'tomavitanza',
  'tennis gate',
  'patrick mouratoglou',
  'functional tennis',
  'tennis tv',
]

interface YouTubeSearchResponse {
  items?: Array<{
    id: {
      videoId: string
    }
    snippet: {
      title: string
      channelId: string
      channelTitle: string
    }
  }>
  error?: {
    code: number
    message: string
  }
}

function isTrustedChannel(channelTitle: string): boolean {
  const normalized = channelTitle.toLowerCase().trim()
  return TRUSTED_CHANNEL_NAMES.some(
    (name) => normalized.includes(name) || name.includes(normalized)
  )
}

export async function searchExerciseVideo(
  exerciseName: string,
  sportName: string
): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return null
  }

  // Bilingual query — "drill" works better than "ejercicio" for finding quality content
  const query = `${exerciseName} ${sportName} drill tutorial`

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '8',
      videoEmbeddable: 'true',
      key: apiKey,
    })

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`)

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as YouTubeSearchResponse | null
      const errorMsg = data?.error?.message || `HTTP ${response.status}`
      if (response.status === 403) {
        logger.warn('YouTube API not enabled or quota exceeded:', errorMsg)
      } else {
        logger.error('YouTube API error:', errorMsg)
      }
      return null
    }

    const data = (await response.json()) as YouTubeSearchResponse

    if (!data.items || data.items.length === 0) {
      return null
    }

    // Prioritize results from trusted coaching channels (matched by name)
    const trustedResult = data.items.find((item) =>
      isTrustedChannel(item.snippet.channelTitle)
    )

    const bestResult = trustedResult || data.items[0]
    return `https://www.youtube.com/embed/${bestResult.id.videoId}`
  } catch (error) {
    logger.error('YouTube search failed:', error)
    return null
  }
}
