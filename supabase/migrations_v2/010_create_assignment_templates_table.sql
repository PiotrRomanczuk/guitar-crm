-- Migration: Create assignment_templates table
-- Reusable assignment templates for teachers

CREATE TABLE assignment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE assignment_templates IS 'Reusable assignment templates that teachers can apply to students';
COMMENT ON COLUMN assignment_templates.id IS 'Unique template identifier';
COMMENT ON COLUMN assignment_templates.title IS 'Template title shown in selection lists';
COMMENT ON COLUMN assignment_templates.description IS 'Default description applied to assignments created from this template';
COMMENT ON COLUMN assignment_templates.teacher_id IS 'Teacher who owns this template';
