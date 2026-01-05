-- Migration: Create practice_sessions table
-- Tracks student practice sessions

CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX practice_sessions_student_id_idx ON practice_sessions(student_id);
CREATE INDEX practice_sessions_created_at_idx ON practice_sessions(created_at DESC);
