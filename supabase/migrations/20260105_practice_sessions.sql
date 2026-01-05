-- Create practice sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Students can only see their own practice sessions
CREATE POLICY "Students can view own practice sessions" ON practice_sessions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own practice sessions" ON practice_sessions
  FOR UPDATE USING (student_id = auth.uid());

-- Admins and teachers can see all practice sessions
CREATE POLICY "Admins can view all practice sessions" ON practice_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_teacher = true)
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS practice_sessions_student_id_idx ON practice_sessions(student_id);
CREATE INDEX IF NOT EXISTS practice_sessions_created_at_idx ON practice_sessions(created_at DESC);