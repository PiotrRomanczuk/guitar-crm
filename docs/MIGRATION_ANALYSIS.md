# Database Migration Analysis & Recommendations

**Analysis Date:** November 7, 2025  
**Total Migrations:** 16 files  
**Migration Period:** January 1, 2025 - November 7, 2025

---

## Migration Summary

### Phase 1: Foundation (January 1, 2025)

#### 1. **20250101000001_drop_all.sql** - Clean Slate

- Drops all existing tables, types, functions, and triggers
- Ensures fresh start with no legacy dependencies
- ⚠️ **Destructive migration** - Cannot be rolled back

#### 2. **20250101000002_create_enums.sql** - Type System

Creates 7 custom enum types:

- `difficulty_level`: beginner | intermediate | advanced
- `music_key`: 32 musical keys (major and minor)
- `lesson_status`: SCHEDULED | COMPLETED | CANCELLED | RESCHEDULED
- `learning_status`: to_learn | started | remembered | with_author | mastered
- `task_priority`: LOW | MEDIUM | HIGH | URGENT
- `task_status`: OPEN | IN_PROGRESS | PENDING_REVIEW | COMPLETED | CANCELLED | BLOCKED
- `user_role`: admin | teacher | student

#### 3. **20250101000003_create_songs_table.sql** - Songs Entity

- Core song catalog table
- Fields: id, title, author, level, key, chords, audio_files, ultimate_guitar_link, short_title
- No foreign keys (independent entity)
- Single index on `title` for searches

#### 4. **20250101000004_create_profiles_table.sql** - User Profiles

- Links to `auth.users` via foreign key
- Fields: user_id (PK), username, email, firstname, lastname
- **CRITICAL:** Comments indicate role columns (isAdmin, isTeacher, isStudent) were removed
- Indexes on username and email

#### 5. **20250101000005_create_user_roles_table.sql** - Role System

- Separate table for user roles (many-to-many)
- Composite primary key (user_id, role)
- References profiles table
- Indexes on user_id and role for fast lookups

#### 6. **20250101000006_create_lessons_table.sql** - Lessons Entity

- Foreign keys to profiles: student_id, teacher_id, creator_user_id
- Fields: title, notes, date, start_time, status
- Auto-increment fields: lesson_number, lesson_teacher_number
- Comprehensive indexing including composite index for teacher-student queries

#### 7. **20250101000007_create_lesson_songs_table.sql** - Junction Table

- Links lessons and songs (many-to-many)
- Composite PK (lesson_id, song_id)
- song_status tracks learning progress
- Legacy fields: teacher_id, student_id (nullable, may be redundant)
- Partial indexes on nullable foreign keys

#### 8. **20250101000008_create_functions.sql** - Utility Functions

Two core functions:

- `update_updated_at_column()`: Timestamp trigger function
- `handle_new_user()`: Auto-creates profile when auth user created

#### 9. **20250101000008_create_task_management_table.sql** - Tasks Entity

- Admin task management system
- Foreign keys: assigned_to (nullable), created_by
- Fields: title, description, priority, status, due_date
- Comprehensive indexing including partial index on due_date

#### 10. **20250101000009_create_functions.sql** - DUPLICATE

- **⚠️ ISSUE:** Exact duplicate of migration 000008
- Recreates same functions unnecessarily

#### 11. **20250101000010_create_triggers.sql** - Automation

- Trigger on auth.users: `on_auth_user_created`
- Triggers on all tables: `set_updated_at`
- Applied to: profiles, songs, lessons, lesson_songs, task_management

#### 12. **20250101000011_enable_rls_policies.sql** - Security Layer

Comprehensive RLS implementation:

**Profiles:**

- Users view/update own profile
- Complex admin/teacher policies (references removed role columns)

**Songs:**

- Teachers/admins: full CRUD
- Students: view only assigned songs

**Lessons:**

- Students/teachers: view own lessons
- Teachers: create/update/delete own lessons
- Admins: full access

**Lesson_songs:**

- Students: view and update own
- Teachers/admins: full CRUD

**Task_management:**

- Admin-only access

**⚠️ CRITICAL ISSUES:**

- Many policies reference `p.isAdmin`, `p.isTeacher` columns that don't exist
- Should use `user_roles` table instead
- Comments in policies acknowledge this but queries remain broken

### Phase 2: Fixes (November 2025)

#### 13. **20251101150000_profiles_auto_create.sql** - Profile Creation Fix

- Recreates `handle_new_user()` function
- Simplified version: only inserts email and user_id
- Uses `ON CONFLICT DO NOTHING` for safety
- **⚠️ INCONSISTENCY:** Conflicts with earlier migration that includes username, firstname, lastname

#### 14. **20251102120000_add_is_development_column.sql** - Development Flag

- Adds `isDevelopment` boolean to profiles
- Index on column
- Used to identify test users

#### 15. **20251102214734_fix_profiles_rls_recursion.sql** - RLS Fix

- Addresses infinite recursion in RLS policies
- Drops problematic admin/teacher policies
- Keeps only user-own-profile policies
- **Solution:** Delegates admin checks to application layer with service role key
- **⚠️ INCOMPLETE:** Doesn't update all the broken policies in other tables

#### 16. **20251107120000_create_user_roles_from_profiles.sql** - Data Migration

- Creates sync function to copy roles from profiles to user_roles
- Expects isAdmin, isTeacher, isStudent columns to exist
- **⚠️ CRITICAL BUG:** These columns don't exist in profiles table!
- Function will fail when executed

---

## Critical Issues

### 🔴 HIGH PRIORITY

1. **Role System Mismatch**

   - Migrations removed role columns from profiles (migration 004)
   - RLS policies still reference these columns (migration 011)
   - Sync function expects these columns (migration 016)
   - **Impact:** Most RLS policies broken, sync function will fail

2. **Duplicate Migration**

   - Migration 000008 and 000009 create identical functions
   - **Impact:** Wasted migration, potential confusion

3. **Inconsistent Profile Creation**

   - Migration 000008: Creates profiles with username, firstname, lastname
   - Migration 013: Only creates email and user_id
   - **Impact:** Data inconsistency, missing required username field

4. **Incomplete RLS Fix**
   - Migration 015 fixes profiles table only
   - Other tables (songs, lessons, lesson_songs, task_management) still broken
   - **Impact:** Most operations will fail with RLS recursion or missing column errors

### 🟡 MEDIUM PRIORITY

5. **Redundant Foreign Keys**

   - lesson_songs has teacher_id and student_id
   - These can be derived from lessons table
   - **Impact:** Data duplication, potential inconsistency

6. **Missing Username Column Management**

   - Profiles table has UNIQUE constraint on username
   - No clear strategy for generating usernames
   - Migration 013 removed username from auto-creation
   - **Impact:** Potential constraint violations

7. **No Migration Rollback Strategy**
   - Drop-all migration cannot be undone
   - No down migrations provided
   - **Impact:** Difficult to recover from issues

### 🟢 LOW PRIORITY

8. **Limited Indexing**

   - Songs table has only title index (no author, level, key)
   - Could improve query performance
   - **Impact:** Minor performance issue

9. **No Soft Deletes**
   - All deletes are hard deletes (ON DELETE CASCADE)
   - No audit trail
   - **Impact:** Data loss risk

---

## Recommendations

### Immediate Actions (Critical Path)

#### 1. **Fix Role System - Create New Migration**

```sql
-- Migration: 20251107140000_fix_role_system.sql

-- Step 1: Add role columns back to profiles temporarily
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS isAdmin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS isTeacher BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS isStudent BOOLEAN DEFAULT FALSE;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_isAdmin ON public.profiles(isAdmin) WHERE isAdmin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_isTeacher ON public.profiles(isTeacher) WHERE isTeacher = true;
CREATE INDEX IF NOT EXISTS idx_profiles_isStudent ON public.profiles(isStudent) WHERE isStudent = true;

-- Step 3: Sync from user_roles to profiles (reverse direction)
UPDATE public.profiles p
SET isAdmin = true
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.user_id AND ur.role = 'admin'
);

UPDATE public.profiles p
SET isTeacher = true
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.user_id AND ur.role = 'teacher'
);

UPDATE public.profiles p
SET isStudent = true
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.user_id AND ur.role = 'student'
);

-- Step 4: Create trigger to keep in sync
CREATE OR REPLACE FUNCTION public.sync_roles_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET
      isAdmin = CASE WHEN NEW.role = 'admin' THEN true ELSE isAdmin END,
      isTeacher = CASE WHEN NEW.role = 'teacher' THEN true ELSE isTeacher END,
      isStudent = CASE WHEN NEW.role = 'student' THEN true ELSE isStudent END
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET
      isAdmin = CASE WHEN OLD.role = 'admin' THEN false ELSE isAdmin END,
      isTeacher = CASE WHEN OLD.role = 'teacher' THEN false ELSE isTeacher END,
      isStudent = CASE WHEN OLD.role = 'student' THEN false ELSE isStudent END
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_roles_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_roles_to_profiles();
```

**Rationale:** Keep both systems. Profiles columns for RLS performance, user_roles for normalized data model.

#### 2. **Fix Profile Creation - Update Migration**

```sql
-- Migration: 20251107141000_fix_profile_creation.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, firstname, lastname)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.email,  -- Fallback to email if no username
      'user_' || substring(NEW.id::text, 1, 8)
    ),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. **Optimize RLS Policies - New Migration**

Replace recursive policies with optimized versions using role columns:

```sql
-- Migration: 20251107142000_optimize_rls_policies.sql

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers and admins can view all songs" ON public.songs;
-- ... (drop all policies)

-- Recreate with optimized checks

-- PROFILES
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.isAdmin = true
  )
);

-- SONGS
CREATE POLICY "Teachers and admins can view all songs"
ON public.songs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (p.isTeacher = true OR p.isAdmin = true)
  )
);

-- ... (continue for all tables)
```

#### 4. **Remove Duplicate Migration**

Add comment to migration 000009:

```sql
-- Migration: 20251107143000_remove_duplicate_functions.sql
-- Note: Migration 000009 was a duplicate of 000008
-- Functions already exist, nothing to do here
-- Keeping this migration for historical record
```

### Medium-Term Improvements

#### 5. **Clean Up lesson_songs Table**

```sql
-- Migration: 20251107150000_cleanup_lesson_songs.sql

-- Remove redundant foreign keys
ALTER TABLE public.lesson_songs
  DROP COLUMN IF EXISTS teacher_id,
  DROP COLUMN IF EXISTS student_id;

-- Drop related indexes
DROP INDEX IF EXISTS idx_lesson_songs_teacher_id;
DROP INDEX IF EXISTS idx_lesson_songs_student_id;

-- Create views for backward compatibility if needed
CREATE OR REPLACE VIEW lesson_songs_with_users AS
SELECT
  ls.*,
  l.teacher_id,
  l.student_id
FROM public.lesson_songs ls
JOIN public.lessons l ON l.id = ls.lesson_id;
```

#### 6. **Add Better Indexing**

```sql
-- Migration: 20251107151000_add_comprehensive_indexes.sql

-- Songs table
CREATE INDEX IF NOT EXISTS idx_songs_author ON public.songs(author);
CREATE INDEX IF NOT EXISTS idx_songs_level ON public.songs(level);
CREATE INDEX IF NOT EXISTS idx_songs_key ON public.songs(key);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON public.songs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_songs_level_key ON public.songs(level, key);

-- Lessons - add composite for date range queries
CREATE INDEX IF NOT EXISTS idx_lessons_student_date ON public.lessons(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_date ON public.lessons(teacher_id, date DESC);
```

#### 7. **Add Audit Trail System**

```sql
-- Migration: 20251107152000_add_audit_trail.sql

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Long-Term Improvements

#### 8. **Migration Versioning Strategy**

- Create down migrations for each up migration
- Add migration metadata table
- Implement rollback procedures
- Document migration dependencies

#### 9. **Performance Monitoring**

```sql
-- Add query statistics view
CREATE OR REPLACE VIEW query_performance AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 10. **Soft Delete Implementation**

- Add `deleted_at` timestamp to all tables
- Create views excluding deleted records
- Update RLS policies to filter deleted records
- Implement cleanup job for old deleted records

---

## Migration Execution Plan

### Phase 1: Critical Fixes (Do First)

1. Run migration 20251107140000 (fix role system)
2. Run migration 20251107141000 (fix profile creation)
3. Run migration 20251107142000 (optimize RLS policies)
4. **Test thoroughly** - verify all CRUD operations work

### Phase 2: Cleanup (After Phase 1 tested)

5. Run migration 20251107143000 (document duplicate)
6. Run migration 20251107150000 (cleanup lesson_songs)

### Phase 3: Optimization (Optional, performance improvement)

7. Run migration 20251107151000 (add indexes)
8. Run migration 20251107152000 (add audit trail)

### Testing Checklist

- ✅ Users can view/edit own profile
- ✅ Admins can view all profiles
- ✅ Teachers can create/view/edit songs
- ✅ Students can view assigned songs only
- ✅ Teachers can create lessons
- ✅ Students can view their lessons
- ✅ Admins can manage tasks
- ✅ No RLS recursion errors
- ✅ No missing column errors

---

## Architecture Assessment

### Strengths

✅ Clear separation of concerns (enums → tables → functions → triggers → RLS)  
✅ Comprehensive indexing strategy  
✅ Proper use of foreign key constraints  
✅ RLS security layer for data protection  
✅ Normalized data model (user_roles table)  
✅ Automatic timestamp management  
✅ Automatic profile creation on signup

### Weaknesses

❌ Inconsistent role management (dual systems not in sync)  
❌ Broken RLS policies referencing non-existent columns  
❌ Duplicate migrations  
❌ No migration rollback capability  
❌ No audit trail  
❌ Hard deletes only (data loss risk)  
❌ Incomplete migration documentation

### Overall Grade: C+ (Solid foundation, critical bugs prevent production use)

**Recommendation:** Fix critical issues (role system, RLS policies) before proceeding with new features. The architecture is sound, but implementation has broken dependencies that will cause runtime failures.
