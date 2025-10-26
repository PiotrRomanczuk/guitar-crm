-- Migration: Fix profiles table auth integration
-- Author: AI Assistant
-- Date: 2025-10-26
-- Purpose: Add foreign key constraint to auth.users and create trigger for automatic profile creation
-- Step 1: Add foreign key constraint if it doesn't exist
-- This ensures data integrity between profiles and auth.users
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    pg_constraint
  WHERE
    conname = 'profiles_user_id_fkey'
) THEN
ALTER TABLE
  public.profiles
ADD
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
END $ $;
-- Step 2: Create function to handle new user profile creation
-- This function runs when a new user signs up via Supabase Auth
CREATE
OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $ $ BEGIN -- Insert new profile with default values
INSERT INTO
  public.profiles (
    user_id,
    email,
    firstName,
    lastName,
    username,
    isAdmin,
    isTeacher,
    isStudent,
    canEdit,
    isActive,
    isTest,
    created_at,
    updated_at
  )
VALUES
  (
    NEW.id,
    -- Link to auth.users.id
    NEW.email,
    -- Copy email from auth
    NEW.raw_user_meta_data ->> 'first_name',
    -- Get from signup metadata
    NEW.raw_user_meta_data ->> 'last_name',
    -- Get from signup metadata
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    -- Generate username
    false,
    -- Default not admin
    false,
    -- Default not teacher
    true,
    -- Default is student
    false,
    -- Default cannot edit
    true,
    -- Default is active
    false,
    -- Default not test user
    NOW(),
    -- Set creation timestamp
    NOW() -- Set update timestamp
  );
RETURN NEW;
END;
$ $;
-- Step 3: Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
  ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Step 4: Add helpful comment
  COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile in public.profiles when a new user signs up via Supabase Auth';
-- Note: Cannot add comment to auth.users trigger as we don't own that table