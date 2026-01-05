-- Migration: Seed initial data for development/testing
-- NOTE: Songs and detailed data are seeded in seed.sql, not here
-- This migration only creates minimal reference data needed for foreign keys

-- Seed profiles first (required for foreign keys in lessons, assignments, etc.)
INSERT INTO profiles (id, email, full_name, is_admin, is_teacher, is_student) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@guitcrm.test', 'Admin User', true, false, false),
('22222222-2222-2222-2222-222222222222', 'teacher1@guitcrm.test', 'Teacher One', false, true, false),
('33333333-3333-3333-3333-333333333333', 'teacher2@guitcrm.test', 'Teacher Two', false, true, false),
('44444444-4444-4444-4444-444444444444', 'student1@guitcrm.test', 'Student One', false, false, true),
('55555555-5555-5555-5555-555555555555', 'student2@guitcrm.test', 'Student Two', false, false, true),
('66666666-6666-6666-6666-666666666666', 'student3@guitcrm.test', 'Student Three', false, false, true),
('77777777-7777-7777-7777-777777777777', 'teacher_student@guitcrm.test', 'Teacher Student', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- NOTE: All songs are seeded from supabase/seed.sql to avoid duplicates
-- Songs include: sample songs + 111 legacy songs from .LEGACY_DATA/songs.json
