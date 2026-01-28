import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Note: For large files (>4MB), use /api/upload/token with client-side upload
// This route is kept for backward compatibility with small files

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

    let fileUrl: string

    // Check if Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob
      const { put } = await import('@vercel/blob')
      const blob = await put(`analyses/${session.user.id}/${uniqueName}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      fileUrl = blob.url
    } else {
      // Use local file storage for development
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.user.id)

      // Create directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Write file to local storage
      const filePath = path.join(uploadDir, uniqueName)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      // Return local URL
      fileUrl = `/uploads/${session.user.id}/${uniqueName}`
    }

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: isVideo ? 'VIDEO' : 'IMAGE',
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', errorMsg, error)
    return NextResponse.json(
      { error: `Error al subir archivo: ${errorMsg.substring(0, 100)}` },
      { status: 500 }
    )
  }
}
