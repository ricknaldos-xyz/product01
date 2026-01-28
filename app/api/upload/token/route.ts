import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

// This route handles client-side uploads to Vercel Blob
// It generates signed tokens that allow direct upload from the browser

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type from pathname
        const ext = pathname.split('.').pop()?.toLowerCase()
        const allowedExts = ['mp4', 'mov', 'webm', 'avi', 'jpg', 'jpeg', 'png', 'webp']

        if (!ext || !allowedExts.includes(ext)) {
          throw new Error('Tipo de archivo no permitido')
        }

        return {
          allowedContentTypes: [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',
            'image/jpeg',
            'image/png',
            'image/webp',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after upload completes
        console.log('Upload completed:', blob.url)
        const payload = JSON.parse(tokenPayload || '{}')
        console.log('User ID:', payload.userId)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Upload token error:', errorMsg)
    return NextResponse.json(
      { error: errorMsg },
      { status: 400 }
    )
  }
}
