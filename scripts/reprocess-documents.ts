import { prisma } from '../lib/prisma'
import { processDocument } from '../lib/rag/processor'

async function main() {
  console.log('🔄 Starting document reprocessing...\n')

  const documents = await prisma.document.findMany({
    select: { id: true, originalName: true, status: true }
  })

  console.log(`Found ${documents.length} documents to reprocess\n`)

  for (const doc of documents) {
    console.log(`Processing: ${doc.originalName}...`)
    try {
      await processDocument(doc.id)
      console.log(`  ✓ Done\n`)
    } catch (error) {
      console.error(`  ✗ Failed:`, error instanceof Error ? error.message : error, '\n')
    }
  }

  // Verify embeddings
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM document_chunks WHERE embedding IS NOT NULL
  `
  console.log(`\nEmbeddings generados: ${result[0].count}`)

  await prisma.$disconnect()
}

main().catch(console.error)
