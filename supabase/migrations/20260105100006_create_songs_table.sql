-- Migration: Create songs table
-- Complete songs table with all columns consolidated from multiple migrations

CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core song information
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    short_title VARCHAR(50),
    
    -- Music attributes
    level difficulty_level NOT NULL,
    key music_key NOT NULL,
    capo_fret INTEGER CHECK (capo_fret IS NULL OR (capo_fret >= 0 AND capo_fret <= 20)),
    strumming_pattern TEXT,
    tempo INTEGER CHECK (tempo IS NULL OR (tempo >= 20 AND tempo <= 300)),
    time_signature INTEGER CHECK (time_signature IS NULL OR (time_signature >= 1 AND time_signature <= 16)),
    duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms > 0),
    release_year INTEGER CHECK (release_year IS NULL OR (release_year >= 1900 AND release_year <= 2100)),
    category TEXT,
    chords TEXT,
    
    -- External links
    ultimate_guitar_link TEXT,  -- Optional
    youtube_url TEXT,
    spotify_link_url TEXT,
    
    -- Media
    cover_image_url TEXT,
    gallery_images TEXT[],
    audio_files JSONB DEFAULT '{}'::jsonb,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX songs_title_idx ON songs(title);
CREATE INDEX songs_author_idx ON songs(author);
CREATE INDEX idx_songs_deleted_at ON songs(deleted_at);

-- Comments
COMMENT ON COLUMN songs.short_title IS 'Optional abbreviated title for display in compact views';
COMMENT ON COLUMN songs.capo_fret IS 'Capo position (0-20), null means no capo';
COMMENT ON COLUMN songs.strumming_pattern IS 'Strumming pattern description (e.g., D-DU-UDU)';
COMMENT ON COLUMN songs.category IS 'Song category or genre';
COMMENT ON COLUMN songs.tempo IS 'Song tempo in BPM';
COMMENT ON COLUMN songs.time_signature IS 'Time signature numerator (e.g., 4 for 4/4)';
COMMENT ON COLUMN songs.duration_ms IS 'Song duration in milliseconds';
COMMENT ON COLUMN songs.release_year IS 'Year the song was released';
COMMENT ON COLUMN songs.cover_image_url IS 'URL to song cover image';
COMMENT ON COLUMN songs.spotify_link_url IS 'Spotify track URL';
COMMENT ON COLUMN songs.audio_files IS 'JSONB object mapping audio type to URL';
