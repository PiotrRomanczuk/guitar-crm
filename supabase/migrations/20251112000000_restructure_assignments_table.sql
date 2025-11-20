-- Migration: Restructure assignments table for teacher-student assignments
-- Convert from generic task_management structure to specific assignment structure
-- Changes:
--   - Replace user_id with teacher_id and student_id (both reference profiles)
--   - Remove priority field (not needed for assignments)
--   - Simplify status enum to match AssignmentSchema
--   - Add lesson_id for linking assignments to specific lessons (optional)

-- Step 1: Drop existing policies (will recreate with new structure)
DROP POLICY IF EXISTS select_assignments_user_or_admin ON assignments;
DROP POLICY IF EXISTS insert_assignments_user_or_admin ON assignments;
DROP POLICY IF EXISTS update_assignments_user_or_admin ON assignments;
DROP POLICY IF EXISTS delete_assignments_admin_or_teacher ON assignments;

-- Step 2: Create new status enum
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM (
        'not_started',
        'in_progress',
        'completed',
        'overdue',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2.5: Update status column to use new enum
-- First drop the default value which uses the old enum
ALTER TABLE assignments ALTER COLUMN status DROP DEFAULT;

-- Convert old uppercase values to new lowercase values
ALTER TABLE assignments
  ALTER COLUMN status TYPE assignment_status
  USING CASE
    WHEN status::text = 'OPEN' THEN 'not_started'::assignment_status
    WHEN status::text = 'IN_PROGRESS' THEN 'in_progress'::assignment_status
    WHEN status::text = 'COMPLETED' THEN 'completed'::assignment_status
    WHEN status::text = 'CANCELLED' THEN 'cancelled'::assignment_status
    ELSE 'not_started'::assignment_status
  END;

-- Set new default value
ALTER TABLE assignments ALTER COLUMN status SET DEFAULT 'not_started'::assignment_status;

-- Step 3: Add new columns (teacher_id, student_id, lesson_id)
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL;

-- Step 4: Migrate data from user_id to student_id (assume existing assignments are for students)
UPDATE assignments
SET student_id = user_id
WHERE student_id IS NULL AND user_id IS NOT NULL;

-- Step 5: Set teacher_id from lessons table where possible
-- For assignments linked to lessons, use the lesson's teacher
UPDATE assignments a
SET teacher_id = l.teacher_id
FROM lessons l
WHERE a.lesson_id = l.id
  AND a.teacher_id IS NULL;

-- Step 6: For assignments without lessons, try to infer teacher from student's lessons
UPDATE assignments a
SET teacher_id = (
  SELECT l.teacher_id
  FROM lessons l
  WHERE l.student_id = a.student_id
  ORDER BY l.created_at DESC
  LIMIT 1
)
WHERE a.teacher_id IS NULL AND a.student_id IS NOT NULL;

-- Step 7: Drop old user_id column
ALTER TABLE assignments
  DROP COLUMN IF EXISTS user_id;

-- Step 8: Make teacher_id and student_id NOT NULL (after migration)
ALTER TABLE assignments
  ALTER COLUMN teacher_id SET NOT NULL,
  ALTER COLUMN student_id SET NOT NULL;

-- Step 9: Drop priority column (not needed for assignments)
ALTER TABLE assignments
  DROP COLUMN IF EXISTS priority;

-- Step 10: Drop old indexes
DROP INDEX IF EXISTS assignments_user_id_idx;
DROP INDEX IF EXISTS assignments_priority_idx;
DROP INDEX IF EXISTS assignments_status_idx;

-- Step 11: Create new indexes
CREATE INDEX IF NOT EXISTS assignments_teacher_id_idx ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS assignments_student_id_idx ON assignments(student_id);
CREATE INDEX IF NOT EXISTS assignments_lesson_id_idx ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON assignments(due_date);
CREATE INDEX IF NOT EXISTS assignments_teacher_student_idx ON assignments(teacher_id, student_id);

-- Step 12: Add composite unique constraint to prevent duplicate assignments
-- Same teacher + student + title + due_date = duplicate
CREATE UNIQUE INDEX IF NOT EXISTS assignments_teacher_student_title_date_unique 
  ON assignments(teacher_id, student_id, title, due_date)
  WHERE due_date IS NOT NULL;

-- Step 13: Recreate RLS policies with new structure
-- Students can view their own assignments
-- Teachers can view assignments they created
-- Admins can view all assignments
CREATE POLICY select_assignments_by_role ON assignments
  FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Teachers can create assignments for their students
-- Admins can create any assignment
CREATE POLICY insert_assignments_teacher_or_admin ON assignments
  FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Teachers can update their own assignments
-- Students can update status only on their assignments
-- Admins can update any assignment
CREATE POLICY update_assignments_by_role ON assignments
  FOR UPDATE
  USING (
    auth.uid() = teacher_id OR
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only teachers who created the assignment or admins can delete
CREATE POLICY delete_assignments_teacher_or_admin ON assignments
  FOR DELETE
  USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Step 14: Update table comment
COMMENT ON TABLE assignments IS 'Teacher-assigned work/practice for students, linked to lessons and songs';
COMMENT ON COLUMN assignments.teacher_id IS 'Teacher who created the assignment';
COMMENT ON COLUMN assignments.student_id IS 'Student who must complete the assignment';
COMMENT ON COLUMN assignments.lesson_id IS 'Optional: lesson this assignment is associated with';
COMMENT ON COLUMN assignments.due_date IS 'Deadline for completing the assignment';

