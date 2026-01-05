-- Migration: Create practice_sessions table
-- Tracks student practice sessions

CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 480),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX practice_sessions_student_id_idx ON practice_sessions(student_id);
CREATE INDEX practice_sessions_created_at_idx ON practice_sessions(created_at DESC);
CREATE INDEX practice_sessions_song_id_idx ON practice_sessions(song_id);

-- Comments
COMMENT ON TABLE practice_sessions IS 'Tracks student practice sessions for songs';
COMMENT ON COLUMN practice_sessions.duration_minutes IS 'Practice duration in minutes (1-480)';
