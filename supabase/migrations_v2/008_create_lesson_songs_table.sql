-- Migration: Create lesson_songs junction table
-- Links songs to lessons with status tracking

CREATE TABLE lesson_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    status lesson_song_status NOT NULL DEFAULT 'to_learn',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Each song can only be added once per lesson
    CONSTRAINT lesson_songs_lesson_song_unique UNIQUE (lesson_id, song_id)
);

-- Indexes
CREATE INDEX lesson_songs_lesson_id_idx ON lesson_songs(lesson_id);
CREATE INDEX lesson_songs_song_id_idx ON lesson_songs(song_id);
