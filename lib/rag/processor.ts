import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { parsePdf } from './pdf-parser'
import { chunkPages } from './chunker'
import { generateEmbeddings } from './embeddings'

const EMBED_BATCH_SIZE = 20
const INSERT_BATCH_SIZE = 50

export async function processDocument(documentId: string): Promise<void> {
  // 1. Fetch document record
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    throw new Error(`Document ${documentId} not found`)
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'PROCESSING' },
  })

  try {
    // 2. Download PDF
    let pdfBuffer: Buffer

    if (document.fileUrl.startsWith('/uploads/')) {
      // Local file
      const { readFile } = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'public', document.fileUrl)
      pdfBuffer = await readFile(filePath)
    } else {
      // Remote URL (Vercel Blob)
      const response = await fetch(document.fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      pdfBuffer = Buffer.from(arrayBuffer)
    }

    // 3. Extract text
    const parsed = await parsePdf(pdfBuffer)

    // Update page count
    await prisma.document.update({
      where: { id: documentId },
      data: { pageCount: parsed.totalPages },
    })

    // 4. Chunk the text
    const chunks = chunkPages(parsed.pages)

    if (chunks.length === 0) {
      throw new Error('No text could be extracted from the PDF')
    }

    logger.info(`Document ${documentId}: ${parsed.totalPages} pages, ${chunks.length} chunks`)

    // 5. Generate embeddings in batches
    const allEmbeddings: number[][] = []
    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE)
      const embeddings = await generateEmbeddings(batch.map((c) => c.content))
      allEmbeddings.push(...embeddings)
      logger.debug(`Embedded ${Math.min(i + EMBED_BATCH_SIZE, chunks.length)}/${chunks.length} chunks`)
    }

    // 6. Delete any existing chunks (in case of reprocessing)
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    })

    // 7. Insert chunks with embeddings in batches via raw SQL
    for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
      const batchEnd = Math.min(i + INSERT_BATCH_SIZE, chunks.length)
      const batchChunks = chunks.slice(i, batchEnd)
      const batchEmbeddings = allEmbeddings.slice(i, batchEnd)

      // Build batch insert with raw SQL for the vector column
      for (let j = 0; j < batchChunks.length; j++) {
        const chunk = batchChunks[j]
        const embedding = batchEmbeddings[j]
        const vectorStr = `[${embedding.join(',')}]`

        await prisma.$executeRawUnsafe(
          `INSERT INTO document_chunks (
            id, "documentId", content, "chunkIndex", "pageStart", "pageEnd",
            "sportSlug", category, technique, "tokenCount", embedding, "createdAt"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5,
            $6, $7::"ChunkCategory", $8, $9, $10::vector, NOW()
          )`,
          documentId,
          chunk.content,
          chunk.chunkIndex,
          chunk.pageStart,
          chunk.pageEnd,
          document.sportSlug,
          chunk.category,
          chunk.technique,
          chunk.tokenCount,
          vectorStr
        )
      }
    }

    // 8. Mark as completed
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    })

    logger.info(`Document ${documentId} processed successfully: ${chunks.length} chunks stored`)
  } catch (error) {
    logger.error(`Document ${documentId} processing failed:`, error)

    const rawMessage = error instanceof Error ? error.message : 'Error desconocido'
    // Store a clean, user-friendly error message (max 300 chars)
    const errorMessage = rawMessage.length > 300
      ? rawMessage.substring(0, 297) + '...'
      : rawMessage

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    })

    throw error
  }
}
