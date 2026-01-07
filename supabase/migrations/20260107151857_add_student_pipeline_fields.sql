-- Create enum type for student status
CREATE TYPE student_status AS ENUM ('lead', 'trial', 'active', 'inactive', 'churned');

-- Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_status student_status DEFAULT 'lead',
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS lead_source TEXT;

-- Create index for quick filtering
CREATE INDEX IF NOT EXISTS idx_profiles_student_status ON profiles(student_status);

-- Update existing students to 'active' status if they have lessons
UPDATE profiles
SET student_status = 'active',
    status_changed_at = NOW()
WHERE id IN (
  SELECT DISTINCT student_id 
  FROM lessons 
  WHERE student_id IS NOT NULL
);

-- Add comment explaining the enum values
COMMENT ON TYPE student_status IS 'Tracks student progress through the funnel: lead -> trial -> active -> inactive/churned';
COMMENT ON COLUMN profiles.student_status IS 'Current status of the student in the pipeline';
COMMENT ON COLUMN profiles.status_changed_at IS 'Timestamp when the student_status was last updated';
COMMENT ON COLUMN profiles.lead_source IS 'Optional: How did the student find us? (e.g., referral, google, facebook)';
