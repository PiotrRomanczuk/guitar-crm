-- Migration: Create user_roles table
-- Stores user role assignments (linked to profiles)

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Each user can only have each role once
    CONSTRAINT user_roles_unique UNIQUE (user_id, role)
);

-- Indexes
CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_idx ON user_roles(role);
