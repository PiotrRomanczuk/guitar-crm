-- Migration: RLS policies for user_roles table
-- Uses is_admin() function to avoid RLS recursion

-- SELECT: Users can see their own roles, admins can see all
CREATE POLICY select_own_roles ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY select_user_roles_admin ON user_roles
    FOR SELECT USING (is_admin());

-- INSERT: Only admins can assign roles
CREATE POLICY insert_user_roles_admin ON user_roles
    FOR INSERT WITH CHECK (is_admin());

-- UPDATE: Only admins can modify roles
CREATE POLICY update_user_roles_admin ON user_roles
    FOR UPDATE USING (is_admin());

-- DELETE: Only admins can remove roles
CREATE POLICY delete_user_roles_admin ON user_roles
    FOR DELETE USING (is_admin());
