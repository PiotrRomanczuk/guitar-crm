-- Migration: Create utility functions
-- Step 12: Functions for automatic timestamps and user profile creation

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function to create profile when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, firstname, lastname, isAdmin, isTeacher, isStudent)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstname', NULL),
    COALESCE(NEW.raw_user_meta_data->>'lastname', NULL),
    COALESCE((NEW.raw_user_meta_data->>'isAdmin')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'isTeacher')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'isStudent')::boolean, true)
  );
  RETURN NEW;
END;
$function$;

-- ✅ Functions created
