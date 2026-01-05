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
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT assignments_teacher_not_student CHECK (teacher_id != student_id)
);

-- Indexes
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_student_id ON assignments(student_id);
CREATE INDEX idx_assignments_deleted_at ON assignments(deleted_at);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- Comments
COMMENT ON TABLE assignments IS 'Teacher-assigned work/practice for students in the Guitar CRM system';
COMMENT ON COLUMN assignments.deleted_at IS 'Soft delete timestamp, NULL means active';
