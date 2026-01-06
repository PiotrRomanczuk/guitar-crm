-- Migration: Create lesson_history table
-- Tracks all changes to lessons (status, time, student, etc.)

CREATE TABLE lesson_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL, -- 'created', 'rescheduled', 'status_changed', 'updated', 'cancelled', 'completed'
    previous_data JSONB,
    new_data JSONB NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lesson_history_lesson_id ON lesson_history(lesson_id);
CREATE INDEX idx_lesson_history_changed_by ON lesson_history(changed_by);
CREATE INDEX idx_lesson_history_changed_at ON lesson_history(changed_at DESC);
CREATE INDEX idx_lesson_history_change_type ON lesson_history(change_type);

-- Comments
COMMENT ON TABLE lesson_history IS 'Audit log tracking all changes to lessons';
COMMENT ON COLUMN lesson_history.id IS 'Unique history record identifier';
COMMENT ON COLUMN lesson_history.lesson_id IS 'Lesson that was changed';
COMMENT ON COLUMN lesson_history.changed_by IS 'User who made the change';
COMMENT ON COLUMN lesson_history.change_type IS 'Type of change: created, rescheduled, status_changed, updated, cancelled, completed';
COMMENT ON COLUMN lesson_history.previous_data IS 'Previous lesson data (null for creation)';
COMMENT ON COLUMN lesson_history.new_data IS 'New lesson data after change';
COMMENT ON COLUMN lesson_history.changed_at IS 'When the change occurred';
COMMENT ON COLUMN lesson_history.notes IS 'Optional notes about the change';

-- Enable RLS
ALTER TABLE lesson_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read history
CREATE POLICY "Users can view lesson history" ON lesson_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Only allow system/admin to insert (will be done via triggers)
CREATE POLICY "Only system can insert lesson history" ON lesson_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
