-- Migration: Add full-text search indexes
-- Enables efficient text search on songs table

-- Add tsvector column for full-text search
ALTER TABLE songs ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(author, '')), 'B')
    ) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_songs_search ON songs USING GIN (search_vector);

-- Create trigram extension for fuzzy search (LIKE queries)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON songs USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_songs_author_trgm ON songs USING GIN (author gin_trgm_ops);

-- Comments
COMMENT ON COLUMN songs.search_vector IS 'Generated tsvector for full-text search (title weighted A, author weighted B)';
COMMENT ON INDEX idx_songs_search IS 'GIN index for full-text search queries';
COMMENT ON INDEX idx_songs_title_trgm IS 'Trigram index for fuzzy title matching (LIKE/ILIKE)';
COMMENT ON INDEX idx_songs_author_trgm IS 'Trigram index for fuzzy author matching (LIKE/ILIKE)';

-- Example usage:
-- Full-text search: SELECT * FROM songs WHERE search_vector @@ to_tsquery('english', 'wonderwall');
-- Fuzzy search: SELECT * FROM songs WHERE title % 'wonderwall' ORDER BY similarity(title, 'wonderwall') DESC;
