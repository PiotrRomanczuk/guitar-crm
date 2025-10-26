-- Baseline Migration: Create core database schema
-- Author: Guitar CRM Team
-- Date: 2025-10-26
-- Purpose: Initial database schema setup

-- Create profiles table
-- This extends auth.users with application-specific user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT,
    firstName TEXT,
    lastName TEXT,
    bio TEXT,
    isAdmin BOOLEAN DEFAULT false,
    isTeacher BOOLEAN DEFAULT false,
    isStudent BOOLEAN DEFAULT true,
    canEdit BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    isTest BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    author TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    key TEXT,
    chords TEXT,
    audio_files JSONB,
    ultimate_guitar_link TEXT,
    short_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on songs for common queries
CREATE INDEX IF NOT EXISTS idx_songs_level ON public.songs(level);
CREATE INDEX IF NOT EXISTS idx_songs_author ON public.songs(author);
CREATE INDEX IF NOT EXISTS idx_songs_key ON public.songs(key);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    creator_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    date DATE,
    time TIME,
    start_time TIME,
    status TEXT CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
    lesson_number INTEGER,
    lesson_teacher_number INTEGER,
    title TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on lessons
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON public.lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON public.lessons(date);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);

-- Create lesson_songs table (junction table for lessons and songs)
CREATE TABLE IF NOT EXISTS public.lesson_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    song_status TEXT CHECK (song_status IN ('to_learn', 'started', 'remembered', 'with_author', 'mastered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, song_id)
);

-- Create indexes on lesson_songs
CREATE INDEX IF NOT EXISTS idx_lesson_songs_lesson_id ON public.lesson_songs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_songs_song_id ON public.lesson_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_lesson_songs_student_id ON public.lesson_songs(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_songs_status ON public.lesson_songs(song_status);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- Create indexes on user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_song_id ON public.user_favorites(song_id);

-- Create lesson_templates table
CREATE TABLE IF NOT EXISTS public.lesson_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration INTEGER,
    structure JSONB,
    teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teacher_availability table
CREATE TABLE IF NOT EXISTS public.teacher_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on teacher_availability
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_id ON public.teacher_availability(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_date ON public.teacher_availability(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_songs_updated_at BEFORE UPDATE ON public.lesson_songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_templates_updated_at BEFORE UPDATE ON public.lesson_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_availability_updated_at BEFORE UPDATE ON public.teacher_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
