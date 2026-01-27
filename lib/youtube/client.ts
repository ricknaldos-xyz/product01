const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

interface YouTubeSearchResponse {
  items?: Array<{
    id: {
      videoId: string
    }
    snippet: {
      title: string
    }
  }>
  error?: {
    code: number
    message: string
  }
}

export async function searchExerciseVideo(
  exerciseName: string,
  sportName: string
): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return null
  }

  const query = `${exerciseName} ${sportName} ejercicio tutorial`

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '1',
    videoEmbeddable: 'true',
    relevanceLanguage: 'es',
    key: apiKey,
  })

  try {
    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`)

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as YouTubeSearchResponse | null
      const errorMsg = data?.error?.message || `HTTP ${response.status}`
      if (response.status === 403) {
        console.warn('YouTube API not enabled or quota exceeded:', errorMsg)
      } else {
        console.error('YouTube API error:', errorMsg)
      }
      return null
    }

    const data = (await response.json()) as YouTubeSearchResponse

    if (!data.items || data.items.length === 0) {
      return null
    }

    const videoId = data.items[0].id.videoId
    return `https://www.youtube.com/embed/${videoId}`
  } catch (error) {
    console.error('YouTube search failed:', error)
    return null
  }
}
