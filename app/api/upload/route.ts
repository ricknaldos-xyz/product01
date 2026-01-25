import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
]

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporciono archivo' },
        { status: 400 }
      )
    }

    // Validate file type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)

    if (!isVideo && !isImage) {
      return NextResponse.json(
        {
          error: `Tipo de archivo no soportado: ${file.type}. Videos: MP4, MOV, WebM, AVI. Imagenes: JPEG, PNG, WebP.`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Archivo muy grande. Maximo: ${isVideo ? '100MB' : '10MB'}`,
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const uniqueName = `${timestamp}-${random}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(`analyses/${session.user.id}/${uniqueName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: isVideo ? 'VIDEO' : 'IMAGE',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }
}
