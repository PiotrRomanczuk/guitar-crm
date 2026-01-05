-- Create song status history table to track all status changes
CREATE TABLE song_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_song_status_history_student_id ON song_status_history(student_id);
CREATE INDEX idx_song_status_history_song_id ON song_status_history(song_id);
CREATE INDEX idx_song_status_history_changed_at ON song_status_history(changed_at DESC);

-- RLS policies
ALTER TABLE song_status_history ENABLE ROW LEVEL SECURITY;

-- Students can only see their own status history
CREATE POLICY "Students can view their own song status history" ON song_status_history
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own status changes
CREATE POLICY "Students can insert their own song status changes" ON song_status_history
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Teachers and admins can view all status history
CREATE POLICY "Teachers and admins can view all song status history" ON song_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_song_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO song_status_history (
      student_id,
      song_id,
      previous_status,
      new_status,
      notes
    ) VALUES (
      NEW.student_id,
      NEW.song_id,
      OLD.status,
      NEW.status,
      CASE 
        WHEN NEW.notes IS DISTINCT FROM OLD.notes THEN NEW.notes
        ELSE NULL
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on student_songs table
CREATE TRIGGER trigger_log_song_status_change
  AFTER UPDATE ON student_songs
  FOR EACH ROW
  EXECUTE FUNCTION log_song_status_change();

-- Add some helpful views
CREATE VIEW student_song_progress AS
SELECT 
  ss.student_id,
  ss.song_id,
  s.title as song_title,
  s.author as song_artist,
  s.level as song_level,
  ss.status as current_status,
  ss.updated_at as last_updated,
  COUNT(ssh.id) as total_status_changes,
  MIN(ssh.changed_at) as first_change_date,
  MAX(ssh.changed_at) as last_change_date
FROM student_songs ss
LEFT JOIN songs s ON s.id = ss.song_id
LEFT JOIN song_status_history ssh ON ssh.song_id = ss.song_id AND ssh.student_id = ss.student_id
GROUP BY ss.student_id, ss.song_id, s.title, s.author, s.level, ss.status, ss.updated_at;

-- RLS for the view
ALTER VIEW student_song_progress SET (security_invoker = on);