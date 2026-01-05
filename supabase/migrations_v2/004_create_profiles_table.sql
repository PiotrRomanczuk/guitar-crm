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
COMMENT ON COLUMN profiles.is_shadow IS 'Flag to identify students created by teachers without real email addresses';
