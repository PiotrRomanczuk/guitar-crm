-- Migration: RLS policies for lessons table
-- Admins see all, Teachers/Students see their own lessons

-- SELECT: Admin sees all, Teachers see theirs, Students see theirs
CREATE POLICY lessons_select_policy ON lessons
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

-- INSERT: Only admins and teachers can create lessons
CREATE POLICY lessons_insert_policy ON lessons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- UPDATE: Only admins and teachers can update lessons
CREATE POLICY lessons_update_policy ON lessons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- DELETE: Only admins and teachers can delete lessons
CREATE POLICY lessons_delete_policy ON lessons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );
