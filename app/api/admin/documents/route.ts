import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MAX_PDF_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const sportSlug = formData.get('sportSlug') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 })
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: 'Archivo muy grande. Máximo: 100MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const uniqueName = `${timestamp}-${random}.pdf`

    let fileUrl: string

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const blob = await put(`documents/${uniqueName}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      fileUrl = blob.url
    } else {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      const filePath = path.join(uploadDir, uniqueName)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/documents/${uniqueName}`
    }

    const document = await prisma.document.create({
      data: {
        filename: uniqueName,
        originalName: file.name,
        fileUrl,
        fileSize: file.size,
        sportSlug: sportSlug || null,
        status: 'UPLOADING',
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    logger.error('Document upload error:', error)
    return NextResponse.json({ error: 'Error al subir documento' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const include = {
      _count: { select: { chunks: true } },
      uploadedBy: { select: { name: true, email: true } },
    }

    if (!paginated) {
      const documents = await prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
        include,
        take: 200,
      })
      return NextResponse.json(documents)
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.document.count(),
    ])

    return NextResponse.json({
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Document list error:', error)
    return NextResponse.json({ error: 'Error al listar documentos' }, { status: 500 })
  }
}
