-- Migration: Create all views
-- Consolidated reporting and utility views

-- View: user_overview
-- Shows user info with role flags calculated from user_roles
CREATE OR REPLACE VIEW user_overview AS
SELECT
    p.id AS user_id,
    p.email,
    p.created_at,
    p.updated_at,
    bool_or(ur.role = 'admin') AS is_admin,
    bool_or(ur.role = 'teacher') AS is_teacher,
    bool_or(ur.role = 'student') AS is_student
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
GROUP BY p.id, p.email, p.created_at, p.updated_at;

-- View: lesson_counts_per_teacher
-- Aggregates lesson counts by teacher
CREATE OR REPLACE VIEW lesson_counts_per_teacher AS
SELECT
    teacher_id,
    COUNT(*) AS total_lessons
FROM lessons
GROUP BY teacher_id;

-- View: lesson_counts_per_student
-- Aggregates lesson counts by student
CREATE OR REPLACE VIEW lesson_counts_per_student AS
SELECT
    student_id,
    COUNT(*) AS total_lessons
FROM lessons
GROUP BY student_id;

-- View: song_usage_stats
-- Shows how often each song is assigned to lessons
CREATE OR REPLACE VIEW song_usage_stats AS
SELECT
    s.id AS song_id,
    s.title,
    COUNT(ls.id) AS times_assigned
FROM songs s
LEFT JOIN lesson_songs ls ON ls.song_id = s.id
GROUP BY s.id, s.title;
