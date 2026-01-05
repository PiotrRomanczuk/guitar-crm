-- Migration: RLS policies for profiles table

-- SELECT: Users can view their own profile, admins can view all, teachers can view all
CREATE POLICY select_own_or_admin_profile ON profiles
    FOR SELECT USING (
        id = auth.uid() OR is_admin()
    );

CREATE POLICY "Teachers can read all profiles" ON profiles
    FOR SELECT TO authenticated USING (
        has_role('teacher') OR is_admin()
    );

-- INSERT: Only admins can create profiles directly (normal users created via auth trigger)
CREATE POLICY insert_profile_admin_only ON profiles
    FOR INSERT WITH CHECK (is_admin());

-- Teachers can create student profiles (shadow users)
CREATE POLICY "Teachers can create student profiles" ON profiles
    FOR INSERT TO authenticated WITH CHECK (
        has_role('teacher')
    );

-- UPDATE: Users can update their own profile, admins can update all
CREATE POLICY update_own_or_admin_profile ON profiles
    FOR UPDATE USING (
        id = auth.uid() OR is_admin()
    );

-- DELETE: Users can delete their own profile, admins can delete all
CREATE POLICY delete_own_or_admin_profile ON profiles
    FOR DELETE USING (
        id = auth.uid() OR is_admin()
    );
