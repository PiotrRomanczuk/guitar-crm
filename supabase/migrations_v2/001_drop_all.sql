-- Migration: Drop all existing objects
-- This ensures a clean slate for the database
-- WARNING: This will delete all data!

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all tables (cascade will handle FKs)
DROP TABLE IF EXISTS song_status_history CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;
DROP TABLE IF EXISTS webhook_subscriptions CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS assignment_templates CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lesson_songs CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop views
DROP VIEW IF EXISTS user_overview CASCADE;
DROP VIEW IF EXISTS lesson_counts_per_teacher CASCADE;
DROP VIEW IF EXISTS lesson_counts_per_student CASCADE;
DROP VIEW IF EXISTS song_usage_stats CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS link_shadow_profile() CASCADE;
DROP FUNCTION IF EXISTS has_active_lesson_assignments(uuid) CASCADE;
DROP FUNCTION IF EXISTS has_role(user_role) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_student() CASCADE;
DROP FUNCTION IF EXISTS is_teacher() CASCADE;
DROP FUNCTION IF EXISTS set_lesson_numbers() CASCADE;
DROP FUNCTION IF EXISTS soft_delete_song_with_cascade(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS sync_profile_roles() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop enums
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS lesson_song_status CASCADE;
DROP TYPE IF EXISTS lesson_status CASCADE;
DROP TYPE IF EXISTS music_key CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
