-- Create user_history table to track changes to user profiles
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'role_changed', 'status_changed')),
  previous_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to view user history
CREATE POLICY "Allow authenticated users to view user history"
  ON user_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow admins to manually insert user history records
CREATE POLICY "Allow admins to insert user history"
  ON user_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_changed_by ON user_history(changed_by);
CREATE INDEX idx_user_history_changed_at ON user_history(changed_at DESC);
CREATE INDEX idx_user_history_change_type ON user_history(change_type);

-- Add comment
COMMENT ON TABLE user_history IS 'Tracks all changes to user profiles including creation, updates, role changes, and deletions';
