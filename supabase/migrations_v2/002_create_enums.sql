-- Migration: Create all enum types
-- Consolidated from multiple migrations

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- Difficulty levels for songs
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Musical keys (major and minor)
CREATE TYPE music_key AS ENUM (
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
);

-- Lesson status
CREATE TYPE lesson_status AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED'
);

-- Status for songs within lessons
CREATE TYPE lesson_song_status AS ENUM (
    'to_learn',
    'started',
    'remembered',
    'with_author',
    'mastered'
);

-- Assignment status (simplified from old task_status)
CREATE TYPE assignment_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'overdue',
    'cancelled'
);

-- NOTE: Legacy enums (task_priority, task_status) have been removed as they were unused.
-- They were leftovers from the old task_management table before it was renamed to assignments.
