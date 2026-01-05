-- Migration: Create assignments table
-- Teacher-assigned work/practice for students

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Assignment details
    title TEXT NOT NULL,
    description TEXT,
    status assignment_status NOT NULL DEFAULT 'not_started',
    due_date TIMESTAMPTZ,
    
    -- Relationships
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comment
COMMENT ON TABLE assignments IS 'Teacher-assigned work/practice for students in the Guitar CRM system';
