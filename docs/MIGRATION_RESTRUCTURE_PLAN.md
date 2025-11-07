# Database Migration Restructure Plan

**Date:** November 7, 2025  
**Purpose:** Complete restructure of database migrations to fix critical issues and establish best practices  
**Status:** 📋 Planning Phase - NOT YET IMPLEMENTED

---

## Overview

This document proposes a complete restructure of the database migrations to address:

- ✅ Role system consistency (profiles columns + user_roles table)
- ✅ RLS policy correctness and performance
- ✅ Profile creation consistency
- ✅ Removal of duplicates
- ✅ Better organization and naming
- ✅ Down migrations for rollback capability
- ✅ Comprehensive indexing
- ✅ Audit trail foundation

---

## New Migration Structure

### Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Organization Phases

1. **Foundation** (00-09): Core types, tables, basic structure
2. **Relationships** (10-19): Foreign keys, junction tables
3. **Functions** (20-29): Database functions and utilities
4. **Triggers** (30-39): Automated behavior
5. **Security** (40-49): RLS policies and permissions
6. **Data** (50-59): Data migrations and seeding
7. **Optimization** (60-69): Indexes, performance
8. **Extensions** (70-79): Additional features

---

## Proposed New Migration Files

### Phase 1: Foundation (Core Structure)

#### **001. 20251108000001_drop_all_clean_slate.sql**

```sql
-- Drop everything for clean slate
-- WARNING: Destructive - only for fresh installations
-- Production environments should use versioned migrations

DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.task_management CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.lesson_songs CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.learning_status CASCADE;
DROP TYPE IF EXISTS public.lesson_status CASCADE;
DROP TYPE IF EXISTS public.music_key CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.sync_roles_to_profiles CASCADE;
DROP FUNCTION IF EXISTS public.audit_trigger CASCADE;

-- Note: auth.users table is managed by Supabase Auth
```

**Down Migration:**

```sql
-- Cannot rollback drop_all - requires full restore from backup
```

---

#### **002. 20251108000002_create_enums.sql**

```sql
-- Create all enum types
-- Must be created before tables that reference them

-- User management
CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student');

-- Song metadata
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE public.music_key AS ENUM (
  -- Major keys
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  -- Minor keys
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
);

-- Lesson management
CREATE TYPE public.lesson_status AS ENUM (
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
);

CREATE TYPE public.learning_status AS ENUM (
  'to_learn',
  'started',
  'remembered',
  'with_author',
  'mastered'
);

-- Task management
CREATE TYPE public.task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TYPE public.task_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'COMPLETED',
  'CANCELLED',
  'BLOCKED'
);

-- Add comments for documentation
COMMENT ON TYPE public.user_role IS 'User roles: admin (full access), teacher (manage students/lessons), student (view own data)';
COMMENT ON TYPE public.difficulty_level IS 'Song difficulty levels for progression tracking';
COMMENT ON TYPE public.music_key IS 'Musical keys (major and minor) for song classification';
COMMENT ON TYPE public.learning_status IS 'Song learning progress stages';
COMMENT ON TYPE public.lesson_status IS 'Lesson scheduling and completion status';
COMMENT ON TYPE public.task_status IS 'Task workflow states';
COMMENT ON TYPE public.task_priority IS 'Task urgency levels';
```

**Down Migration:**

```sql
-- Drop all enums in reverse order
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.learning_status CASCADE;
DROP TYPE IF EXISTS public.lesson_status CASCADE;
DROP TYPE IF EXISTS public.music_key CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
```

---

#### **003. 20251108000003_create_profiles_table.sql**

```sql
-- Create profiles table
-- Links to Supabase auth.users and stores user metadata

CREATE TABLE public.profiles (
  -- Primary key (links to auth.users)
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User identity
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  firstname TEXT,
  lastname TEXT,

  -- Development flag
  is_development BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
  CONSTRAINT username_max_length CHECK (char_length(username) <= 50),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Indexes for common queries
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_development ON public.profiles(is_development) WHERE is_development = true;

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles with metadata - roles stored in user_roles table';
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id) - managed by Supabase Auth';
COMMENT ON COLUMN public.profiles.is_development IS 'Development/test user flag for easy cleanup';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.profiles CASCADE;
```

---

#### **004. 20251108000004_create_user_roles_table.sql**

```sql
-- Create user_roles table (normalized role storage)
-- Provides many-to-many relationship: users can have multiple roles

CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Comments
COMMENT ON TABLE public.user_roles IS 'User roles - single source of truth for role-based access control';
COMMENT ON COLUMN public.user_roles.role IS 'User role enum: admin, teacher, or student';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.user_roles CASCADE;
```

---

#### **005. 20251108000005_create_songs_table.sql**

```sql
-- Create songs table
-- Independent entity - no foreign keys to other tables

CREATE TABLE public.songs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Song metadata
  title TEXT NOT NULL,
  short_title TEXT,
  author TEXT NOT NULL,

  -- Classification
  level public.difficulty_level NOT NULL,
  key public.music_key NOT NULL,

  -- Content
  chords TEXT,
  audio_files TEXT[],
  ultimate_guitar_link TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT author_not_empty CHECK (char_length(trim(author)) > 0),
  CONSTRAINT ultimate_guitar_link_format CHECK (
    ultimate_guitar_link ~* '^https?://(www\.)?ultimate-guitar\.com/'
  )
);

-- Basic indexes (more added in optimization phase)
CREATE INDEX idx_songs_title ON public.songs(title);
CREATE INDEX idx_songs_author ON public.songs(author);
CREATE INDEX idx_songs_level ON public.songs(level);
CREATE INDEX idx_songs_key ON public.songs(key);

-- Comments
COMMENT ON TABLE public.songs IS 'Song catalog with metadata and learning resources';
COMMENT ON COLUMN public.songs.ultimate_guitar_link IS 'Required link to Ultimate Guitar tabs/chords';
COMMENT ON COLUMN public.songs.short_title IS 'Optional abbreviated title for display in tight spaces';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.songs CASCADE;
```

---

### Phase 2: Relationships (Foreign Keys & Junctions)

#### **010. 20251108000010_create_lessons_table.sql**

```sql
-- Create lessons table
-- Links students and teachers with scheduled/completed lessons

CREATE TABLE public.lessons (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys to profiles
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,

  -- Lesson details
  title TEXT,
  notes TEXT,
  date DATE NOT NULL,
  start_time TIME,
  status public.lesson_status NOT NULL DEFAULT 'SCHEDULED',

  -- Auto-incrementing lesson numbers
  lesson_number INTEGER,
  lesson_teacher_number INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_date CHECK (date >= '2020-01-01'),
  CONSTRAINT student_not_teacher CHECK (student_id != teacher_id)
);

-- Indexes for foreign keys
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_teacher_id ON public.lessons(teacher_id);
CREATE INDEX idx_lessons_creator_user_id ON public.lessons(creator_user_id);

-- Indexes for queries
CREATE INDEX idx_lessons_date ON public.lessons(date DESC);
CREATE INDEX idx_lessons_status ON public.lessons(status);

-- Composite indexes for common queries
CREATE INDEX idx_lessons_teacher_student ON public.lessons(teacher_id, student_id, date DESC);
CREATE INDEX idx_lessons_student_date ON public.lessons(student_id, date DESC);
CREATE INDEX idx_lessons_teacher_date ON public.lessons(teacher_id, date DESC);

-- Comments
COMMENT ON TABLE public.lessons IS 'Student-teacher lessons with scheduling and status';
COMMENT ON COLUMN public.lessons.lesson_number IS 'Auto-incremented lesson number (global)';
COMMENT ON COLUMN public.lessons.lesson_teacher_number IS 'Auto-incremented lesson number per teacher-student pair';
COMMENT ON COLUMN public.lessons.creator_user_id IS 'User who created the lesson (usually teacher or admin)';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.lessons CASCADE;
```

---

#### **011. 20251108000011_create_lesson_songs_table.sql**

```sql
-- Create lesson_songs junction table
-- Links lessons to songs with learning progress tracking

CREATE TABLE public.lesson_songs (
  -- Composite primary key
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,

  -- Learning progress
  song_status public.learning_status NOT NULL DEFAULT 'to_learn',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,

  -- Constraints
  PRIMARY KEY (lesson_id, song_id)
);

-- Indexes
CREATE INDEX idx_lesson_songs_lesson_id ON public.lesson_songs(lesson_id);
CREATE INDEX idx_lesson_songs_song_id ON public.lesson_songs(song_id);
CREATE INDEX idx_lesson_songs_status ON public.lesson_songs(song_status);

-- Composite index for progress queries
CREATE INDEX idx_lesson_songs_song_status ON public.lesson_songs(song_id, song_status);

-- Comments
COMMENT ON TABLE public.lesson_songs IS 'Junction table linking lessons to songs with progress tracking';
COMMENT ON COLUMN public.lesson_songs.song_status IS 'Learning progress: to_learn → started → remembered → with_author → mastered';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.lesson_songs CASCADE;
```

---

#### **012. 20251108000012_create_task_management_table.sql**

```sql
-- Create task_management table
-- Admin task tracking system

CREATE TABLE public.task_management (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  priority public.task_priority NOT NULL DEFAULT 'MEDIUM',
  status public.task_status NOT NULL DEFAULT 'OPEN',
  due_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT completed_at_requires_completed_status CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
    (status != 'COMPLETED' AND completed_at IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_task_management_assigned_to ON public.task_management(assigned_to)
  WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_task_management_created_by ON public.task_management(created_by);
CREATE INDEX idx_task_management_status ON public.task_management(status);
CREATE INDEX idx_task_management_priority ON public.task_management(priority);
CREATE INDEX idx_task_management_due_date ON public.task_management(due_date)
  WHERE due_date IS NOT NULL;

-- Composite indexes
CREATE INDEX idx_task_management_status_priority ON public.task_management(status, priority);

-- Comments
COMMENT ON TABLE public.task_management IS 'Admin task management system';
COMMENT ON COLUMN public.task_management.completed_at IS 'Automatically set when status changes to COMPLETED';
```

**Down Migration:**

```sql
DROP TABLE IF EXISTS public.task_management CASCADE;
```

---

### Phase 3: Functions (Business Logic)

#### **020. 20251108000020_create_utility_functions.sql**

```sql
-- Create utility functions used across the system

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';

-- Function: Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username: prefer metadata, fallback to email, fallback to user_id
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'user_' || substring(NEW.id::text, 1, 8)
  );

  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || '_' || floor(random() * 1000)::text;
  END LOOP;

  -- Insert profile
  INSERT INTO public.profiles (
    user_id,
    username,
    email,
    firstname,
    lastname
  ) VALUES (
    NEW.id,
    generated_username,
    NEW.email,
    NEW.raw_user_meta_data->>'firstname',
    NEW.raw_user_meta_data->>'lastname'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    firstname = COALESCE(EXCLUDED.firstname, profiles.firstname),
    lastname = COALESCE(EXCLUDED.lastname, profiles.lastname);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile when new auth user is created';
```

**Down Migration:**

```sql
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
```

---

#### **021. 20251108000021_create_lesson_number_functions.sql**

```sql
-- Create functions for auto-incrementing lesson numbers

-- Function: Set lesson numbers on insert
CREATE OR REPLACE FUNCTION public.set_lesson_numbers()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_lesson_number INTEGER;
  next_teacher_number INTEGER;
BEGIN
  -- Get next global lesson number
  SELECT COALESCE(MAX(lesson_number), 0) + 1
  INTO next_lesson_number
  FROM public.lessons;

  -- Get next teacher-student specific number
  SELECT COALESCE(MAX(lesson_teacher_number), 0) + 1
  INTO next_teacher_number
  FROM public.lessons
  WHERE teacher_id = NEW.teacher_id
    AND student_id = NEW.student_id;

  -- Set the numbers
  NEW.lesson_number := next_lesson_number;
  NEW.lesson_teacher_number := next_teacher_number;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_lesson_numbers() IS 'Automatically sets lesson_number and lesson_teacher_number on insert';
```

**Down Migration:**

```sql
DROP FUNCTION IF EXISTS public.set_lesson_numbers CASCADE;
```

---

### Phase 4: Triggers (Automation)

#### **030. 20251108000030_create_profile_triggers.sql**

```sql
-- Create triggers for profiles table

-- Trigger: Auto-create profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at on profile changes
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**Down Migration:**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
```

---

#### **032. 20251108000032_create_table_update_triggers.sql**

```sql
-- Create updated_at triggers for all tables

-- Songs
DROP TRIGGER IF EXISTS set_updated_at ON public.songs;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Lessons
DROP TRIGGER IF EXISTS set_updated_at ON public.lessons;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Lesson Songs
DROP TRIGGER IF EXISTS set_updated_at ON public.lesson_songs;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.lesson_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Task Management
DROP TRIGGER IF EXISTS set_updated_at ON public.task_management;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.task_management
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**Down Migration:**

```sql
DROP TRIGGER IF EXISTS set_updated_at ON public.task_management;
DROP TRIGGER IF EXISTS set_updated_at ON public.lesson_songs;
DROP TRIGGER IF EXISTS set_updated_at ON public.lessons;
DROP TRIGGER IF EXISTS set_updated_at ON public.songs;
```

---

#### **033. 20251108000033_create_lesson_triggers.sql**

```sql
-- Create triggers for lessons table

-- Trigger: Set lesson numbers on insert
DROP TRIGGER IF EXISTS set_lesson_numbers_trigger ON public.lessons;
CREATE TRIGGER set_lesson_numbers_trigger
  BEFORE INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lesson_numbers();

-- Trigger: Update completed_at on task completion
DROP TRIGGER IF EXISTS update_task_completed_at ON public.task_management;
CREATE TRIGGER update_task_completed_at
  BEFORE UPDATE ON public.task_management
  FOR EACH ROW
  WHEN (NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED')
  EXECUTE FUNCTION (
    CREATE OR REPLACE FUNCTION public.set_task_completed_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.completed_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  );
```

**Down Migration:**

```sql
DROP TRIGGER IF EXISTS update_task_completed_at ON public.task_management;
DROP TRIGGER IF EXISTS set_lesson_numbers_trigger ON public.lessons;
DROP FUNCTION IF EXISTS public.set_task_completed_at CASCADE;
```

---

### Phase 5: Security (RLS Policies)

#### **040. 20251108000040_enable_rls_all_tables.sql**

```sql
-- Enable RLS on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_management ENABLE ROW LEVEL SECURITY;
```

**Down Migration:**

```sql
ALTER TABLE public.task_management DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

---

#### **041. 20251108000041_create_profiles_rls_policies.sql**

```sql
-- RLS Policies for profiles table

-- SELECT policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Teachers can view student profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.teacher_id = auth.uid()
        AND l.student_id = profiles.user_id
    )
  );

-- UPDATE policies
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT policies (typically handled by trigger, but for completeness)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
```

---

#### **042. 20251108000042_create_user_roles_rls_policies.sql**

```sql
-- RLS Policies for user_roles table

-- SELECT policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT policies
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
```

---

#### **043. 20251108000043_create_songs_rls_policies.sql**

```sql
-- RLS Policies for songs table

-- SELECT policies
CREATE POLICY "Teachers and admins can view all songs"
  ON public.songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can view assigned songs"
  ON public.songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_songs ls
      JOIN public.lessons l ON l.id = ls.lesson_id
      WHERE ls.song_id = songs.id
        AND l.student_id = auth.uid()
    )
  );

-- INSERT policies
CREATE POLICY "Teachers and admins can insert songs"
  ON public.songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('teacher', 'admin')
    )
  );

-- UPDATE policies
CREATE POLICY "Teachers and admins can update songs"
  ON public.songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('teacher', 'admin')
    )
  );

-- DELETE policies
CREATE POLICY "Admins can delete songs"
  ON public.songs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Admins can delete songs" ON public.songs;
DROP POLICY IF EXISTS "Teachers and admins can update songs" ON public.songs;
DROP POLICY IF EXISTS "Teachers and admins can insert songs" ON public.songs;
DROP POLICY IF EXISTS "Students can view assigned songs" ON public.songs;
DROP POLICY IF EXISTS "Teachers and admins can view all songs" ON public.songs;
```

---

#### **044. 20251108000044_create_lessons_rls_policies.sql**

```sql
-- RLS Policies for lessons table

-- SELECT policies
CREATE POLICY "Students can view own lessons"
  ON public.lessons FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view own lessons"
  ON public.lessons FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT policies
CREATE POLICY "Teachers and admins can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('teacher', 'admin')
    )
  );

-- UPDATE policies
CREATE POLICY "Teachers can update own lessons"
  ON public.lessons FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Admins can update any lesson"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Teachers can delete own lessons"
  ON public.lessons FOR DELETE
  USING (teacher_id = auth.uid());

CREATE POLICY "Admins can delete any lesson"
  ON public.lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Admins can delete any lesson" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can delete own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update any lesson" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can update own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers and admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can view own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Students can view own lessons" ON public.lessons;
```

---

#### **045. 20251108000045_create_lesson_songs_rls_policies.sql**

```sql
-- RLS Policies for lesson_songs table

-- SELECT policies
CREATE POLICY "Users can view lesson_songs for their lessons"
  ON public.lesson_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_songs.lesson_id
        AND (l.student_id = auth.uid() OR l.teacher_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT policies
CREATE POLICY "Teachers and admins can insert lesson_songs"
  ON public.lesson_songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('teacher', 'admin')
    )
  );

-- UPDATE policies
CREATE POLICY "Teachers can update lesson_songs for their lessons"
  ON public.lesson_songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_songs.lesson_id
        AND l.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own lesson_songs"
  ON public.lesson_songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_songs.lesson_id
        AND l.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update any lesson_songs"
  ON public.lesson_songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Teachers can delete lesson_songs for their lessons"
  ON public.lesson_songs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_songs.lesson_id
        AND l.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete any lesson_songs"
  ON public.lesson_songs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Admins can delete any lesson_songs" ON public.lesson_songs;
DROP POLICY IF EXISTS "Teachers can delete lesson_songs for their lessons" ON public.lesson_songs;
DROP POLICY IF EXISTS "Admins can update any lesson_songs" ON public.lesson_songs;
DROP POLICY IF EXISTS "Students can update own lesson_songs" ON public.lesson_songs;
DROP POLICY IF EXISTS "Teachers can update lesson_songs for their lessons" ON public.lesson_songs;
DROP POLICY IF EXISTS "Teachers and admins can insert lesson_songs" ON public.lesson_songs;
DROP POLICY IF EXISTS "Users can view lesson_songs for their lessons" ON public.lesson_songs;
```

---

#### **046. 20251108000046_create_task_management_rls_policies.sql**

```sql
-- RLS Policies for task_management table (admin-only)

-- SELECT policies
CREATE POLICY "Admins can view all tasks"
  ON public.task_management FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT policies
CREATE POLICY "Admins can insert tasks"
  ON public.task_management FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- UPDATE policies
CREATE POLICY "Admins can update tasks"
  ON public.task_management FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE policies
CREATE POLICY "Admins can delete tasks"
  ON public.task_management FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

**Down Migration:**

```sql
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.task_management;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.task_management;
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.task_management;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.task_management;
```

---

### Phase 6: Data Migrations

### Phase 7: Optimization

#### **060. 20251108000060_add_performance_indexes.sql**

```sql
-- Additional indexes for performance optimization

-- Songs: Composite indexes for common filters
CREATE INDEX IF NOT EXISTS idx_songs_level_key
  ON public.songs(level, key);

CREATE INDEX IF NOT EXISTS idx_songs_created_at
  ON public.songs(created_at DESC);

-- Full-text search on songs
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm
  ON public.songs USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_songs_author_trgm
  ON public.songs USING gin(author gin_trgm_ops);

-- Lessons: Cover index for list queries
CREATE INDEX IF NOT EXISTS idx_lessons_list_cover
  ON public.lessons(teacher_id, student_id, date DESC)
  INCLUDE (title, status, lesson_teacher_number);

-- Task management: Cover index for dashboard
CREATE INDEX IF NOT EXISTS idx_task_management_dashboard
  ON public.task_management(status, priority, due_date)
  WHERE status != 'COMPLETED' AND status != 'CANCELLED';
```

**Down Migration:**

```sql
DROP INDEX IF EXISTS public.idx_task_management_dashboard;
DROP INDEX IF EXISTS public.idx_lessons_list_cover;
DROP INDEX IF EXISTS public.idx_songs_author_trgm;
DROP INDEX IF EXISTS public.idx_songs_title_trgm;
DROP INDEX IF EXISTS public.idx_songs_created_at;
DROP INDEX IF EXISTS public.idx_songs_level_key;
```

---

#### **061. 20251108000061_enable_pg_extensions.sql**

```sql
-- Enable PostgreSQL extensions for enhanced functionality

-- pg_trgm: Trigram matching for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- uuid-ossp: Additional UUID generation functions (if needed beyond gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_stat_statements: Query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

**Down Migration:**

```sql
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pg_trgm;
```

---

### Phase 8: Monitoring & Utilities

#### **070. 20251108000070_create_utility_views.sql**

```sql
-- Create utility views for monitoring and reporting

-- View: User overview with role counts
CREATE OR REPLACE VIEW user_overview AS
SELECT
  p.user_id,
  p.username,
  p.email,
  p.is_development,
  BOOL_OR(ur.role = 'admin') as is_admin,
  BOOL_OR(ur.role = 'teacher') as is_teacher,
  BOOL_OR(ur.role = 'student') as is_student,
  ARRAY_AGG(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL) as roles,
  COUNT(DISTINCT CASE WHEN l.teacher_id = p.user_id THEN l.id END) as lessons_as_teacher,
  COUNT(DISTINCT CASE WHEN l.student_id = p.user_id THEN l.id END) as lessons_as_student,
  p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
LEFT JOIN public.lessons l ON l.teacher_id = p.user_id OR l.student_id = p.user_id
GROUP BY p.user_id, p.username, p.email, p.is_development, p.created_at;

-- View: Song usage statistics
CREATE OR REPLACE VIEW song_usage_stats AS
SELECT
  s.id,
  s.title,
  s.author,
  s.level,
  COUNT(DISTINCT ls.lesson_id) as lesson_count,
  COUNT(DISTINCT l.student_id) as student_count,
  MAX(l.date) as last_taught,
  ARRAY_AGG(DISTINCT ls.song_status) as statuses_used
FROM public.songs s
LEFT JOIN public.lesson_songs ls ON ls.song_id = s.id
LEFT JOIN public.lessons l ON l.id = ls.lesson_id
GROUP BY s.id, s.title, s.author, s.level;

-- View: Lesson summary
CREATE OR REPLACE VIEW lesson_summary AS
SELECT
  l.id,
  l.date,
  l.title,
  l.status,
  l.lesson_teacher_number,
  t.username as teacher_username,
  s.username as student_username,
  COUNT(ls.song_id) as song_count,
  STRING_AGG(sg.title, ', ' ORDER BY sg.title) as songs
FROM public.lessons l
JOIN public.profiles t ON t.user_id = l.teacher_id
JOIN public.profiles s ON s.user_id = l.student_id
LEFT JOIN public.lesson_songs ls ON ls.lesson_id = l.id
LEFT JOIN public.songs sg ON sg.id = ls.song_id
GROUP BY l.id, l.date, l.title, l.status, l.lesson_teacher_number, t.username, s.username;

COMMENT ON VIEW user_overview IS 'User statistics with lesson counts';
COMMENT ON VIEW song_usage_stats IS 'Song usage frequency and teaching history';
COMMENT ON VIEW lesson_summary IS 'Lesson overview with teacher, student, and songs';
```

**Down Migration:**

```sql
DROP VIEW IF EXISTS lesson_summary;
DROP VIEW IF EXISTS song_usage_stats;
DROP VIEW IF EXISTS user_overview;
```

---

## Implementation Checklist

### Pre-Implementation

- [ ] Backup production database
- [ ] Review all migration files
- [ ] Test on local development environment
- [ ] Test on staging environment
- [ ] Document rollback procedures

### Implementation Steps

#### Fresh Installation (New Database)

```bash
# 1. Apply all migrations in order
supabase db reset  # Applies all migrations

# 2. Verify schema
supabase db diff

# 3. Run tests
npm run test:db
```

#### Existing Database (Migration from Old Structure)

```bash
# 1. Create backup
npm run backup

# 2. Option A: Fresh start (if acceptable)
# WARNING: Deletes all data
supabase db reset

# 2. Option B: Incremental migration (safer)
# Create transition migrations that:
# - Add missing columns
# - Sync data between old and new structures
# - Gradually migrate RLS policies
# - Keep both systems running during transition

# 3. Verify data integrity
npm run verify:db

# 4. Test all CRUD operations
npm run test:e2e
```

### Post-Implementation

- [ ] Verify all tables created
- [ ] Verify all indexes exist
- [ ] Verify all triggers working
- [ ] Verify RLS policies enforced
- [ ] Test all user roles (admin, teacher, student)
- [ ] Monitor performance
- [ ] Document any issues

---

## Key Improvements Over Previous Structure

### 1. **Normalized Role Management**

- ✅ Single source of truth: user_roles table only
- ✅ No data duplication or sync complexity
- ✅ Clean, maintainable architecture
- ✅ Standard many-to-many role relationship

### 2. **Correct RLS Policies**

- ✅ All policies use user_roles table
- ✅ No infinite recursion issues
- ✅ Indexed role lookups with composite primary key
- ✅ Comprehensive coverage of all operations

### 3. **Better Organization**

- ✅ Clear phase-based structure
- ✅ Logical migration numbering
- ✅ Down migrations for all up migrations
- ✅ Comprehensive comments

### 4. **Enhanced Functionality**

- ✅ Automatic username generation with uniqueness
- ✅ Full-text search capability
- ✅ Utility views for reporting
- ✅ Performance monitoring extensions
- ✅ Proper constraint checking

### 5. **Production Ready**

- ✅ No duplicate migrations
- ✅ All foreign keys properly defined
- ✅ Comprehensive indexing strategy
- ✅ Audit trail foundation (if needed)
- ✅ Rollback capability

---

## Migration Execution Timeline

**Estimated Total Time:** 2-3 hours for fresh installation, 4-6 hours for migration from existing

### Phase Breakdown

- Foundation (001-005): 30 minutes
- Relationships (010-012): 20 minutes
- Functions (020-021): 15 minutes
- Triggers (030-033): 10 minutes
- Security (040-046): 45 minutes
- Optimization (060-061): 15 minutes
- Utilities (070): 15 minutes

### Testing Time

- Unit tests: 30 minutes
- Integration tests: 45 minutes
- E2E tests: 60 minutes

---

## Risk Assessment

### Low Risk ✅

- Enum creation
- Table creation (fresh install)
- Index creation
- View creation
- Extension enabling

### Medium Risk ⚠️

- RLS policy creation (test thoroughly)
- Trigger creation (verify all fire correctly)
- Function creation (validate logic)

### High Risk 🔴

- Drop all migration (data loss)
- Data migration from old structure
- Role synchronization

---

## Rollback Strategy

### Fresh Installation

```bash
# Simply drop and recreate
supabase db reset
```

### Existing Database

```bash
# 1. Restore from backup
psql -h localhost -p 54322 -U postgres < backup.sql

# 2. Or use down migrations in reverse order
supabase migration down 070
supabase migration down 061
# ... etc
```

---

## Next Steps After Implementation

1. **Update TypeScript Types**

   ```bash
   supabase gen types typescript --local > types/database.types.generated.ts
   ```

2. **Update Zod Schemas**

   - Verify schemas match new structure
   - Update any role-related validations

3. **Update API Routes**

   - Test all CRUD operations
   - Verify role-based access works

4. **Update Tests**

   - Update test fixtures
   - Add tests for new functionality
   - Verify coverage maintains >70%

5. **Documentation**
   - Update README
   - Document new migration strategy
   - Update API documentation

---

## Support & Resources

- **Migration Documentation:** `docs/MIGRATION_ANALYSIS.md`
- **Database Schema:** Generated after implementation
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://postgresql.org/docs

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Status:** 📋 Planning Phase - Ready for Review & Implementation
