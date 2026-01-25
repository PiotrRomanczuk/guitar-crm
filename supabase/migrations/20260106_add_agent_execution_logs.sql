-- Add agent execution logging table for monitoring AI agent usage
-- This table tracks all agent executions for analytics and monitoring

CREATE TABLE IF NOT EXISTS agent_execution_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Agent information
  agent_id text NOT NULL,
  request_id text NOT NULL,
  
  -- User context
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Execution details
  successful boolean NOT NULL,
  execution_time integer NOT NULL, -- in milliseconds
  input_hash text NOT NULL,
  error_code text,
  
  -- Metadata
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_agent_id ON agent_execution_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_user_id ON agent_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_timestamp ON agent_execution_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_successful ON agent_execution_logs(successful);

-- Add RLS policy (Row Level Security)
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own execution logs
-- Policy: Users can only see their own execution logs
DROP POLICY IF EXISTS "Users can view their own agent execution logs" ON agent_execution_logs;
CREATE POLICY "Users can view their own agent execution logs" ON agent_execution_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Allow inserts for authenticated users
DROP POLICY IF EXISTS "Allow agent execution log inserts" ON agent_execution_logs;
CREATE POLICY "Allow agent execution log inserts" ON agent_execution_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can view all logs
DROP POLICY IF EXISTS "Admins can view all agent execution logs" ON agent_execution_logs;
CREATE POLICY "Admins can view all agent execution logs" ON agent_execution_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

COMMENT ON TABLE agent_execution_logs IS 'Tracks AI agent execution for monitoring and analytics';
COMMENT ON COLUMN agent_execution_logs.agent_id IS 'ID of the agent that was executed';
COMMENT ON COLUMN agent_execution_logs.request_id IS 'Unique request identifier';
COMMENT ON COLUMN agent_execution_logs.execution_time IS 'Time taken for agent execution in milliseconds';
COMMENT ON COLUMN agent_execution_logs.input_hash IS 'Hash of input data for deduplication analysis';
COMMENT ON COLUMN agent_execution_logs.error_code IS 'Error code if execution failed';

-- Grant appropriate permissions
GRANT SELECT, INSERT ON agent_execution_logs TO authenticated;
GRANT ALL ON agent_execution_logs TO service_role;