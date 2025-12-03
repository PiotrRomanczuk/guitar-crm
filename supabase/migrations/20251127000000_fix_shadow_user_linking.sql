-- Migration: Fix shadow user linking logic
-- Description: Updates handle_new_user to link existing profiles by email instead of failing or creating duplicates.
--              Also updates dependent tables (lessons, assignments, user_roles) to point to the new auth.uid.

-- 1. Drop the trigger first to avoid race conditions during replacement
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Just in case

-- 2. Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create the new function with linking logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check if a profile with this email already exists
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE email = new.email
  LIMIT 1;

  IF existing_profile_id IS NOT NULL THEN
    -- Profile exists (Shadow User case)
    -- We need to migrate all data from the old profile ID (random UUID) to the new auth.uid

    -- 1. Update lessons (as teacher)
    UPDATE public.lessons
    SET teacher_id = new.id
    WHERE teacher_id = existing_profile_id;

    -- 2. Update lessons (as student)
    UPDATE public.lessons
    SET student_id = new.id
    WHERE student_id = existing_profile_id;

    -- 3. Update assignments (as teacher)
    UPDATE public.assignments
    SET teacher_id = new.id
    WHERE teacher_id = existing_profile_id;

    -- 4. Update assignments (as student)
    UPDATE public.assignments
    SET student_id = new.id
    WHERE student_id = existing_profile_id;

    -- 5. Update user_roles
    UPDATE public.user_roles
    SET user_id = new.id
    WHERE user_id = existing_profile_id;

    -- 6. Finally, update the profile itself to match the new auth.uid
    --    We also update the updated_at timestamp
    UPDATE public.profiles
    SET 
      id = new.id,
      updated_at = now(),
      -- Ensure metadata is synced if available
      full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
      avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', avatar_url)
    WHERE id = existing_profile_id;

  ELSE
    -- No existing profile, create a new one
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url'
    );
  END IF;

  RETURN new;
END;
$$;

-- 4. Re-create the trigger
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
