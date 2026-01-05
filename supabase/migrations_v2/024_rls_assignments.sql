-- Migration: RLS policies for assignments table
-- Admins see all, Teachers see theirs, Students see their own

-- SELECT: Admin sees all, otherwise user must be teacher or student of assignment
CREATE POLICY assignments_select_policy ON assignments
    FOR SELECT USING (
        (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.is_admin = true
            )
        )
        OR teacher_id = auth.uid()
        OR student_id = auth.uid()
    );

-- INSERT: Only admins and teachers can create assignments
CREATE POLICY assignments_insert_policy ON assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- UPDATE: Only admins and teachers can update assignments
CREATE POLICY assignments_update_policy ON assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- DELETE: Only admins and teachers can delete assignments
CREATE POLICY assignments_delete_policy ON assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );
