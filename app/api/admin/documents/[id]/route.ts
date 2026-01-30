import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// PATCH: Recover FAILED documents or trigger reprocessing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params

    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        status: true,
        _count: { select: { chunks: true } },
      },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // If FAILED but has chunks, just recover the status (no reprocessing needed)
    if (doc.status === 'FAILED' && doc._count.chunks > 0) {
      await prisma.document.update({
        where: { id },
        data: { status: 'COMPLETED', errorMessage: null },
      })
      return NextResponse.json({
        success: true,
        message: `Documento recuperado (${doc._count.chunks} chunks existentes)`,
      })
    }

    // For docs without chunks, trigger processing via dynamic import
    // (avoids bundling heavy processor dependencies in this function)
    if (doc.status === 'FAILED' || doc.status === 'UPLOADING') {
      const { processDocument } = await import('@/lib/rag/processor')
      await processDocument(id)
      return NextResponse.json({ success: true, message: 'Documento procesado correctamente' })
    }

    return NextResponse.json({
      success: true,
      message: 'Documento ya esta procesado',
    })
  } catch (error) {
    logger.error('Document process/recover error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar documento' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
        uploadedBy: { select: { name: true, email: true } },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    logger.error('Document get error:', error)
    return NextResponse.json({ error: 'Error al obtener documento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // Delete from blob storage if applicable
    if (document.fileUrl && !document.fileUrl.startsWith('/uploads/') && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { del } = await import('@vercel/blob')
        await del(document.fileUrl)
      } catch (e) {
        logger.error('Failed to delete blob:', e)
      }
    }

    // Delete document (chunks cascade)
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Document delete error:', error)
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 })
  }
}
