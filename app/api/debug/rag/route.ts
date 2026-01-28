import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { retrieveRelevantChunks } from '@/lib/rag/retriever'

// Diagnostic endpoint to check RAG system status
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  }

  try {
    // 1. Check documents
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        originalName: true,
        status: true,
        pageCount: true,
        sportSlug: true,
        _count: {
          select: { chunks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    diagnostics.documents = {
      total: documents.length,
      byStatus: {
        COMPLETED: documents.filter(d => d.status === 'COMPLETED').length,
        PROCESSING: documents.filter(d => d.status === 'PROCESSING').length,
        FAILED: documents.filter(d => d.status === 'FAILED').length,
        UPLOADING: documents.filter(d => d.status === 'UPLOADING').length,
      },
      list: documents.map(d => ({
        name: d.originalName,
        status: d.status,
        pages: d.pageCount,
        chunks: d._count.chunks,
        sport: d.sportSlug,
      }))
    }

    // 2. Check total chunks
    const totalChunks = await prisma.documentChunk.count()
    diagnostics.chunks = {
      total: totalChunks
    }

    // 3. Check chunks by category
    const chunksByCategory = await prisma.documentChunk.groupBy({
      by: ['category'],
      _count: true
    })
    diagnostics.chunks = {
      ...diagnostics.chunks as object,
      byCategory: Object.fromEntries(
        chunksByCategory.map(c => [c.category, c._count])
      )
    }

    // 4. Check chunks by technique
    const chunksByTechnique = await prisma.documentChunk.groupBy({
      by: ['technique'],
      _count: true
    })
    diagnostics.chunks = {
      ...diagnostics.chunks as object,
      byTechnique: Object.fromEntries(
        chunksByTechnique.map(c => [c.technique || 'none', c._count])
      )
    }

    // 5. Test vector search (pgvector)
    try {
      const testQuery = 'revés a una mano tenis técnica'
      const testResults = await retrieveRelevantChunks(testQuery, {
        sportSlug: 'tennis',
        limit: 3,
        threshold: 0.3
      })

      diagnostics.vectorSearch = {
        status: 'OK',
        query: testQuery,
        resultsFound: testResults.length,
        topResults: testResults.map(r => ({
          similarity: r.similarity.toFixed(3),
          category: r.category,
          technique: r.technique,
          contentPreview: r.content.substring(0, 150) + '...',
          source: r.documentFilename
        }))
      }
    } catch (vectorError) {
      const errorMsg = vectorError instanceof Error ? vectorError.message : String(vectorError)
      diagnostics.vectorSearch = {
        status: 'ERROR',
        error: errorMsg,
        hint: errorMsg.includes('embedding')
          ? 'Los documentos pueden no tener embeddings generados'
          : errorMsg.includes('vector')
          ? 'pgvector puede no estar habilitado en la base de datos'
          : 'Error desconocido en búsqueda vectorial'
      }
    }

    // 6. Overall status
    const hasProcessedDocs = documents.some(d => d.status === 'COMPLETED')
    const hasChunks = totalChunks > 0
    const vectorWorks = (diagnostics.vectorSearch as { status: string })?.status === 'OK'

    diagnostics.overallStatus = {
      ragReady: hasProcessedDocs && hasChunks && vectorWorks,
      issues: [
        ...(!hasProcessedDocs ? ['No hay documentos procesados (COMPLETED)'] : []),
        ...(!hasChunks ? ['No hay chunks en la base de datos'] : []),
        ...(!vectorWorks ? ['La búsqueda vectorial no funciona'] : []),
      ]
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    diagnostics.status = 'ERROR'
    diagnostics.error = errorMsg

    return NextResponse.json(diagnostics, { status: 500 })
  }
}
