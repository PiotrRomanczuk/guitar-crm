-- Migration: Seed initial data for development/testing
-- NOTE: Songs and detailed data are seeded in seed.sql, not here
-- This migration only creates minimal reference data needed for foreign keys

-- Seed profiles first (required for foreign keys in lessons, assignments, etc.)
INSERT INTO profiles (id, email, full_name, is_admin, is_teacher, is_student) VALUES
('11111111-1111-1111-1111-111111111111', 'p.romanczuk@gmail.com', 'Piotr Romanczuk', true, true, false),
('22222222-2222-2222-2222-222222222222', 'teacher@example.com', 'Teacher User', false, true, false),
('44444444-4444-4444-4444-444444444444', 'student1@example.com', 'Student One', false, false, true),
('55555555-5555-5555-5555-555555555555', 'student2@example.com', 'Student Two', false, false, true)
ON CONFLICT (id) DO NOTHING;

-- NOTE: All songs are seeded from supabase/seed.sql to avoid duplicates
-- Songs include: sample songs + 111 legacy songs from .LEGACY_DATA/songs.json
