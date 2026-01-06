-- Fix missing profile for authenticated user
-- This script creates a profile for users who don't have one

DO $$
DECLARE
  v_user_id uuid := 'db44f596-8ccb-4d71-837d-61de0fc791f7';
  v_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    -- Create profile
    INSERT INTO profiles (id, email, full_name, created_at, updated_at)
    VALUES (
      v_user_id,
      v_email,
      COALESCE(
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id),
        split_part(v_email, '@', 1)
      ),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created profile for user %', v_email;
  ELSE
    RAISE NOTICE 'Profile already exists for user %', v_email;
  END IF;
END $$;
