-- Migration: Create assignment_history table
-- Tracks all changes to assignments (status, due date, content, etc.)

CREATE TABLE assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL, -- 'created', 'status_changed', 'updated', 'deleted'
    previous_data JSONB,
    new_data JSONB NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_assignment_history_assignment_id ON assignment_history(assignment_id);
CREATE INDEX idx_assignment_history_changed_by ON assignment_history(changed_by);
CREATE INDEX idx_assignment_history_changed_at ON assignment_history(changed_at DESC);
CREATE INDEX idx_assignment_history_change_type ON assignment_history(change_type);

-- Comments
COMMENT ON TABLE assignment_history IS 'Audit log tracking all changes to assignments';
COMMENT ON COLUMN assignment_history.id IS 'Unique history record identifier';
COMMENT ON COLUMN assignment_history.assignment_id IS 'Assignment that was changed';
COMMENT ON COLUMN assignment_history.changed_by IS 'User who made the change';
COMMENT ON COLUMN assignment_history.change_type IS 'Type of change: created, status_changed, updated, deleted';
COMMENT ON COLUMN assignment_history.previous_data IS 'Previous assignment data (null for creation)';
COMMENT ON COLUMN assignment_history.new_data IS 'New assignment data after change';
COMMENT ON COLUMN assignment_history.changed_at IS 'When the change occurred';
COMMENT ON COLUMN assignment_history.notes IS 'Optional notes about the change';

-- Enable RLS
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read history
CREATE POLICY "Users can view assignment history" ON assignment_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Only allow system/admin to insert (will be done via triggers)
CREATE POLICY "Only system can insert assignment history" ON assignment_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
