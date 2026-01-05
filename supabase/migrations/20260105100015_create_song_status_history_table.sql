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

-- Comments
COMMENT ON TABLE song_status_history IS 'Audit log tracking all song learning status changes per student';
COMMENT ON COLUMN song_status_history.id IS 'Unique history record identifier';
COMMENT ON COLUMN song_status_history.student_id IS 'Student whose song status changed';
COMMENT ON COLUMN song_status_history.song_id IS 'Song that had status change';
COMMENT ON COLUMN song_status_history.previous_status IS 'Status before the change (null for initial status)';
COMMENT ON COLUMN song_status_history.new_status IS 'New status after the change';
COMMENT ON COLUMN song_status_history.changed_at IS 'When the status change occurred';
COMMENT ON COLUMN song_status_history.notes IS 'Optional notes about the status change';
