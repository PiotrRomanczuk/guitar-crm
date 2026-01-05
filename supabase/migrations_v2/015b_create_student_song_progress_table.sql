-- Migration: Create student_song_progress table
-- Tracks overall progress of students on songs across all lessons
-- This provides a consolidated view of song mastery independent of individual lessons

CREATE TABLE student_song_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_status lesson_song_status NOT NULL DEFAULT 'to_learn',
    started_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,
    
    -- Practice metrics
    total_practice_time_minutes INTEGER DEFAULT 0 CHECK (total_practice_time_minutes >= 0),
    practice_session_count INTEGER DEFAULT 0 CHECK (practice_session_count >= 0),
    last_practiced_at TIMESTAMPTZ,
    
    -- Teacher notes and feedback
    teacher_notes TEXT,
    student_notes TEXT,
    
    -- Difficulty rating by student (1-5)
    difficulty_rating INTEGER CHECK (difficulty_rating IS NULL OR (difficulty_rating >= 1 AND difficulty_rating <= 5)),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Each student can only have one progress record per song
    CONSTRAINT student_song_progress_unique UNIQUE (student_id, song_id)
);

-- Indexes
CREATE INDEX idx_student_song_progress_student_id ON student_song_progress(student_id);
CREATE INDEX idx_student_song_progress_song_id ON student_song_progress(song_id);
CREATE INDEX idx_student_song_progress_status ON student_song_progress(current_status);
CREATE INDEX idx_student_song_progress_last_practiced ON student_song_progress(last_practiced_at DESC);

-- Comments
COMMENT ON TABLE student_song_progress IS 'Tracks overall student progress on songs across all lessons and practice sessions';
COMMENT ON COLUMN student_song_progress.current_status IS 'Current mastery level of the song';
COMMENT ON COLUMN student_song_progress.started_at IS 'When the student first started learning this song';
COMMENT ON COLUMN student_song_progress.mastered_at IS 'When the student achieved mastered status';
COMMENT ON COLUMN student_song_progress.total_practice_time_minutes IS 'Cumulative practice time from all practice sessions';
COMMENT ON COLUMN student_song_progress.practice_session_count IS 'Number of practice sessions for this song';
COMMENT ON COLUMN student_song_progress.difficulty_rating IS 'Student self-reported difficulty (1=easy, 5=very hard)';
