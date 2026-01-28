-- Enable pgvector extension (Neon PostgreSQL supports this natively)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to document_chunks table
-- Uses 768 dimensions (Google Gemini gemini-embedding-001 with outputDimensionality=768)
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create HNSW index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
