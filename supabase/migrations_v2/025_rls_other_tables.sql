-- Migration: RLS policies for remaining tables
-- api_keys, assignment_templates, user_integrations, webhook_subscriptions, practice_sessions, song_status_history

-- =============================================
-- API KEYS
-- =============================================

CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ASSIGNMENT TEMPLATES
-- =============================================

-- Admins can do everything
CREATE POLICY "Admins can view all assignment templates" ON assignment_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert assignment templates" ON assignment_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update all assignment templates" ON assignment_templates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete all assignment templates" ON assignment_templates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Teachers can manage their own templates
CREATE POLICY "Teachers can view their own assignment templates" ON assignment_templates
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own assignment templates" ON assignment_templates
    FOR INSERT WITH CHECK (
        auth.uid() = teacher_id AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_teacher = true
        )
    );

CREATE POLICY "Teachers can update their own assignment templates" ON assignment_templates
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own assignment templates" ON assignment_templates
    FOR DELETE USING (auth.uid() = teacher_id);

-- =============================================
-- USER INTEGRATIONS
-- =============================================

CREATE POLICY "Users can view their own integrations" ON user_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON user_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON user_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON user_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- WEBHOOK SUBSCRIPTIONS
-- =============================================

CREATE POLICY "Users can view their own webhook subscriptions" ON webhook_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webhook subscriptions" ON webhook_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhook subscriptions" ON webhook_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhook subscriptions" ON webhook_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PRACTICE SESSIONS
-- =============================================

-- Students can manage their own practice sessions
CREATE POLICY "Students can view own practice sessions" ON practice_sessions
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert own practice sessions" ON practice_sessions
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own practice sessions" ON practice_sessions
    FOR UPDATE USING (student_id = auth.uid());

-- Admins and teachers can view all practice sessions
CREATE POLICY "Admins can view all practice sessions" ON practice_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- =============================================
-- SONG STATUS HISTORY
-- =============================================

-- Students can view and insert their own status history
CREATE POLICY "Students can view their own song status history" ON song_status_history
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own song status changes" ON song_status_history
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Teachers and admins can view all status history
CREATE POLICY "Teachers and admins can view all song status history" ON song_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- =============================================
-- STUDENT SONG PROGRESS
-- =============================================

-- Students can view their own progress
CREATE POLICY "Students can view their own song progress" ON student_song_progress
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own progress records
CREATE POLICY "Students can insert their own song progress" ON student_song_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own progress
CREATE POLICY "Students can update their own song progress" ON student_song_progress
    FOR UPDATE USING (auth.uid() = student_id);

-- Teachers and admins can view all progress
CREATE POLICY "Teachers and admins can view all song progress" ON student_song_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- Teachers can update student progress (for adding notes, etc.)
CREATE POLICY "Teachers can update student song progress" ON student_song_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );

-- Teachers can insert progress for students
CREATE POLICY "Teachers can insert student song progress" ON student_song_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.is_teacher = true)
        )
    );
