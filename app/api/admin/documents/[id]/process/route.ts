import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { processDocument } from '@/lib/rag/processor'

export const maxDuration = 300 // 5 minutes for large PDFs

export async function POST(
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

    // Process in the same request (within 5-minute limit)
    await processDocument(id)

    return NextResponse.json({ success: true, message: 'Documento procesado correctamente' })
  } catch (error) {
    console.error('Document processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar documento' },
      { status: 500 }
    )
  }
}
