-- Migration: RLS policies for lesson_songs table
-- Only lesson participants and admins can access


CREATE POLICY select_lesson_songs_participants ON lesson_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR lesson_id IN (
      SELECT id FROM lessons WHERE teacher_id = auth.uid() OR student_id = auth.uid()
    )
  );

CREATE POLICY insert_lesson_songs_admin ON lesson_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR lesson_id IN (
      SELECT id FROM lessons WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY update_lesson_songs_admin ON lesson_songs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR lesson_id IN (
      SELECT id FROM lessons WHERE teacher_id = auth.uid() OR student_id = auth.uid()
    )
  );

CREATE POLICY delete_lesson_songs_admin ON lesson_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR lesson_id IN (
      SELECT id FROM lessons WHERE teacher_id = auth.uid() OR student_id = auth.uid()
    )
  );
