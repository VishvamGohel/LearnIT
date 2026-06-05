-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store document chunks and their embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid primary key default gen_random_uuid(),
  roadmap_id text not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2 model
);

-- Create an index on the embedding column for faster similarity searches
-- This uses ivfflat, but HNSW is also an option if supported by your pgvector version
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a function that we can call via Supabase RPC to match embeddings
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(384),
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
