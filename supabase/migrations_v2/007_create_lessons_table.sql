-- Migration: Create lessons table
-- Complete lessons table with all columns

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    
    -- Lesson details
    lesson_teacher_number INTEGER NOT NULL,  -- Auto-set by trigger
    title TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status lesson_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    
    -- Google Calendar integration
    google_event_id TEXT UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Each teacher-student pair has unique lesson numbers
    CONSTRAINT lessons_teacher_student_number_unique UNIQUE (teacher_id, student_id, lesson_teacher_number)
);

-- Indexes
CREATE INDEX lessons_teacher_id_idx ON lessons(teacher_id);
CREATE INDEX lessons_student_id_idx ON lessons(student_id);
CREATE INDEX idx_lessons_google_event_id ON lessons(google_event_id);
