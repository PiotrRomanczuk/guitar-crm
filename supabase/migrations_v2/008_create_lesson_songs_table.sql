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

-- Comments
COMMENT ON TABLE lesson_songs IS 'Junction table linking songs to lessons with learning status tracking';
COMMENT ON COLUMN lesson_songs.id IS 'Unique lesson-song link identifier';
COMMENT ON COLUMN lesson_songs.lesson_id IS 'Reference to the lesson';
COMMENT ON COLUMN lesson_songs.song_id IS 'Reference to the song being learned';
COMMENT ON COLUMN lesson_songs.status IS 'Learning status: to_learn, learning, or learned';
COMMENT ON COLUMN lesson_songs.notes IS 'Teacher notes about the song for this lesson';
