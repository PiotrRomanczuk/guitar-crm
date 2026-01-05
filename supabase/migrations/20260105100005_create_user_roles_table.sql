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

-- Comments
COMMENT ON TABLE user_roles IS 'User role assignments - junction table linking profiles to roles for RBAC';
COMMENT ON COLUMN user_roles.id IS 'Unique role assignment identifier';
COMMENT ON COLUMN user_roles.user_id IS 'Reference to profile receiving the role';
COMMENT ON COLUMN user_roles.role IS 'Role type: admin, teacher, or student';
COMMENT ON COLUMN user_roles.assigned_at IS 'When the role was assigned';
