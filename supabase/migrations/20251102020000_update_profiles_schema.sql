-- Update profiles table schema to match current requirements
-- First add all missing columns
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS id SERIAL;
-- Add missing columns
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS "canEdit" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS "isTest" BOOLEAN DEFAULT FALSE;
-- Rename columns to match expected schema
  -- No need to rename columns as they already use lowercase
  -- ALTER TABLE public.profiles RENAME COLUMN firstname TO "firstName";
  -- ALTER TABLE public.profiles RENAME COLUMN lastname TO "lastName";
  -- Make some columns nullable that were previously non-null
ALTER TABLE
  public.profiles
ALTER COLUMN
  username DROP NOT NULL;
ALTER TABLE
  public.profiles
ALTER COLUMN
  email DROP NOT NULL;
-- Update default values for role flags
ALTER TABLE
  public.profiles
ALTER COLUMN
  isAdmin
SET
  DEFAULT FALSE;
ALTER TABLE
  public.profiles
ALTER COLUMN
  isTeacher
SET
  DEFAULT FALSE;
ALTER TABLE
  public.profiles
ALTER COLUMN
  isStudent
SET
  DEFAULT FALSE;