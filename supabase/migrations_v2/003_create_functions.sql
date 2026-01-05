-- Migration: Create all utility functions
-- Consolidated from multiple migrations

-- Function: update_updated_at_column
-- Automatically updates the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: set_lesson_numbers
-- Automatically sets the lesson_teacher_number for new lessons
CREATE OR REPLACE FUNCTION set_lesson_numbers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Find the next lesson_teacher_number for this teacher-student pair
    SELECT COALESCE(MAX(lesson_teacher_number), 0) + 1 INTO next_number
    FROM lessons
    WHERE teacher_id = NEW.teacher_id AND student_id = NEW.student_id;

    -- Set the lesson_teacher_number for the new lesson
    NEW.lesson_teacher_number := next_number;

    RETURN NEW;
END;
$$;

-- Function: has_role
-- Check if current user has a specific role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- Function: is_admin
-- Check if current user is an admin (uses user_roles to avoid RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Function: is_teacher
-- Check if current user is a teacher (uses profiles)
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_teacher FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function: is_student
-- Check if current user is a student (uses profiles)
CREATE OR REPLACE FUNCTION is_student()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_student FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function: has_active_lesson_assignments
-- Check if a song has active lesson assignments
CREATE OR REPLACE FUNCTION has_active_lesson_assignments(song_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM lesson_songs ls
        JOIN lessons l ON ls.lesson_id = l.id
        WHERE ls.song_id = song_uuid
        AND l.status IN ('SCHEDULED', 'IN_PROGRESS')
    );
END;
$$;

-- Function: soft_delete_song_with_cascade
-- Soft deletes a song and removes its lesson assignments
CREATE OR REPLACE FUNCTION soft_delete_song_with_cascade(song_uuid uuid, user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    song_record RECORD;
    lesson_assignments_count INTEGER;
    result JSON;
BEGIN
    -- Check if song exists and is not already deleted
    SELECT * INTO song_record FROM songs WHERE id = song_uuid AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Song not found or already deleted');
    END IF;

    -- Check for active lesson assignments
    IF has_active_lesson_assignments(song_uuid) THEN
        RETURN json_build_object('success', false, 'error', 'Cannot delete song with active lesson assignments');
    END IF;

    -- Count related records before deletion
    SELECT COUNT(*) INTO lesson_assignments_count FROM lesson_songs WHERE song_id = song_uuid;

    -- Soft delete the song
    UPDATE songs SET deleted_at = NOW() WHERE id = song_uuid;

    -- Cascade: Remove lesson song assignments (hard delete since they're junction records)
    DELETE FROM lesson_songs WHERE song_id = song_uuid;

    -- Return success with counts
    RETURN json_build_object(
        'success', true,
        'lesson_assignments_removed', lesson_assignments_count,
        'favorite_assignments_removed', 0
    );
END;
$$;

-- Function: sync_profile_roles
-- Syncs profile boolean flags to user_roles table
CREATE OR REPLACE FUNCTION sync_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle Admin
  IF NEW.is_admin = true THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM user_roles WHERE user_id = NEW.id AND role = 'admin';
  END IF;

  -- Handle Teacher
  IF NEW.is_teacher = true THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'teacher')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM user_roles WHERE user_id = NEW.id AND role = 'teacher';
  END IF;

  -- Handle Student
  IF NEW.is_student = true THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM user_roles WHERE user_id = NEW.id AND role = 'student';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
