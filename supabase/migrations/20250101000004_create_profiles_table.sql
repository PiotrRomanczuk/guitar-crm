-- Create profiles table
-- Step 5: Profiles table with auth.users foreign key (no RLS yet)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  firstname TEXT,
  lastname TEXT,
  isAdmin BOOLEAN NOT NULL DEFAULT false,
  isTeacher BOOLEAN NOT NULL DEFAULT false,
  isStudent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
-- Basic indexes
CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_isTeacher ON public.profiles (isTeacher);
CREATE INDEX idx_profiles_isStudent ON public.profiles (isStudent);