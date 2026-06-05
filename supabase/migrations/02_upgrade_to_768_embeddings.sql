-- Migration: Switch embedding model from all-MiniLM-L6-v2 (384-dim)
-- to Gemini text-embedding-004 (768-dim)

-- Drop the old index (required before altering the column type)
DROP INDEX IF EXISTS document_chunks_embedding_idx;

-- Drop the old RPC function (it has the old vector dimension in its signature)
DROP FUNCTION IF EXISTS match_document_chunks(vector(384), float, int, text);

-- Drop existing data — embeddings are incompatible between models
-- If you want to keep the table structure but clear old data:
TRUNCATE TABLE document_chunks;

-- Alter the embedding column to 768 dimensions
ALTER TABLE document_chunks
  ALTER COLUMN embedding TYPE vector(768);

-- Re-create the HNSW index for the new 768-dim vectors
-- (HNSW is preferred over ivfflat for smaller datasets and faster build times)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Re-create the RPC function with the new 768-dim signature
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  target_roadmap_id text
)
RETURNS TABLE (
  id uuid,
  roadmap_id text,
  chunk_index integer,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.roadmap_id,
    document_chunks.chunk_index,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE document_chunks.roadmap_id = target_roadmap_id
    AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;
