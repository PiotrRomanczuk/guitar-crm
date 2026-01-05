-- Migration: RLS policies for songs table
-- Admins/Teachers see all, Students only see assigned songs

-- SELECT: 
-- - Admins and Teachers can see all non-deleted songs
-- - Students can only see songs assigned to them via lesson_songs
CREATE POLICY songs_select_policy ON songs
    FOR SELECT USING (
        deleted_at IS NULL AND (
            -- Admin or Teacher check
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (profiles.is_admin = true OR profiles.is_teacher = true)
            )
            OR
            -- Student check: Must have an assignment
            (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_student = true
                )
                AND
                EXISTS (
                    SELECT 1 FROM lesson_songs ls
                    JOIN lessons l ON ls.lesson_id = l.id
                    WHERE ls.song_id = songs.id
                    AND l.student_id = auth.uid()
                )
            )
        )
    );

-- INSERT: Only admins and teachers can add songs
CREATE POLICY songs_insert_policy ON songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- UPDATE: Only admins and teachers can update non-deleted songs
CREATE POLICY songs_update_policy ON songs
    FOR UPDATE USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- DELETE: Only admins and teachers can delete songs
CREATE POLICY songs_delete_policy ON songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );
