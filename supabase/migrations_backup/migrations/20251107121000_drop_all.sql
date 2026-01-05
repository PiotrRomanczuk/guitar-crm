
-- Only drop custom tables in public schema. Do NOT drop any tables in the auth schema.
DROP TABLE IF EXISTS public.lesson_songs CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.task_management CASCADE;

DROP VIEW IF EXISTS user_overview CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS set_lesson_numbers CASCADE;

DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
		EXECUTE 'DROP TRIGGER IF EXISTS profiles_auto_create ON profiles';
		EXECUTE 'DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles';
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
		EXECUTE 'DROP TRIGGER IF EXISTS set_lesson_numbers_trigger ON lessons';
	END IF;
END $$;

DROP TYPE IF EXISTS difficulty_level;
DROP TYPE IF EXISTS music_key;
DROP TYPE IF EXISTS lesson_song_status;

