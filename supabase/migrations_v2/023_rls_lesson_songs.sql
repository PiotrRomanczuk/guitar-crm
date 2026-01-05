-- Migration: RLS policies for lesson_songs table
-- Visibility based on lesson visibility

-- SELECT: Visible if the associated lesson is visible (via lessons RLS)
CREATE POLICY lesson_songs_select_policy ON lesson_songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons
            WHERE lessons.id = lesson_songs.lesson_id
        )
    );

-- Also allow authenticated users to read (for joins)
CREATE POLICY "Allow authenticated users to read lesson_songs" ON lesson_songs
    FOR SELECT TO authenticated USING (true);

-- INSERT: Only admins and teachers can add songs to lessons
CREATE POLICY lesson_songs_insert_policy ON lesson_songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- UPDATE: Only admins and teachers can update lesson songs
CREATE POLICY lesson_songs_update_policy ON lesson_songs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- DELETE: Only admins and teachers can remove songs from lessons
CREATE POLICY lesson_songs_delete_policy ON lesson_songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );
