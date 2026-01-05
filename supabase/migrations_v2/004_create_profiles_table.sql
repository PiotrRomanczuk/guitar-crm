-- Migration: Create profiles table
-- User profiles linked to auth.users

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    notes TEXT,
    phone TEXT,
    
    -- Role flags (synced to user_roles via trigger)
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_teacher BOOLEAN NOT NULL DEFAULT false,
    is_student BOOLEAN NOT NULL DEFAULT false,
    
    -- Status flags
    is_development BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_shadow BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Email format validation
    CONSTRAINT profiles_email_check CHECK (email ~* '^.+@.+\..+$')
);

-- Indexes
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Comments
COMMENT ON TABLE profiles IS 'User profiles linked to auth.users - stores user details and role flags';
COMMENT ON COLUMN profiles.id IS 'Unique profile identifier';
COMMENT ON COLUMN profiles.user_id IS 'Reference to Supabase auth.users (null for shadow students)';
COMMENT ON COLUMN profiles.email IS 'User email address - must be unique across all profiles';
COMMENT ON COLUMN profiles.full_name IS 'Display name shown in UI';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.notes IS 'Admin/teacher notes about the user';
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.is_admin IS 'Has full system access (synced to user_roles)';
COMMENT ON COLUMN profiles.is_teacher IS 'Can teach students and manage lessons (synced to user_roles)';
COMMENT ON COLUMN profiles.is_student IS 'Takes lessons (synced to user_roles)';
COMMENT ON COLUMN profiles.is_development IS 'Development/test account flag';
COMMENT ON COLUMN profiles.is_active IS 'Active account - false disables login';
COMMENT ON COLUMN profiles.is_shadow IS 'Shadow student - created by teacher without real email/auth account';
