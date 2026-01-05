-- Migration: Create song_status_history table
-- Tracks all status changes for songs per student

CREATE TABLE song_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_song_status_history_student_id ON song_status_history(student_id);
CREATE INDEX idx_song_status_history_song_id ON song_status_history(song_id);
CREATE INDEX idx_song_status_history_changed_at ON song_status_history(changed_at DESC);
