-- Migration: Create spotify_matches table for storing potential matches awaiting review
-- Author: AI Assistant
-- Date: 2026-01-07

-- Create spotify_matches table
CREATE TABLE IF NOT EXISTS public.spotify_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    
    -- Spotify track data
    spotify_track_id VARCHAR(255) NOT NULL,
    spotify_track_name VARCHAR(500) NOT NULL,
    spotify_artist_name VARCHAR(500) NOT NULL,
    spotify_album_name VARCHAR(500),
    spotify_url VARCHAR(1000) NOT NULL,
    spotify_preview_url VARCHAR(1000),
    spotify_cover_image_url VARCHAR(1000),
    spotify_duration_ms INTEGER,
    spotify_release_date VARCHAR(50),
    spotify_popularity INTEGER,
    
    -- Matching metadata
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    search_query TEXT NOT NULL,
    match_reason TEXT,
    ai_reasoning TEXT,
    
    -- Review status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique pending matches per song
    UNIQUE (song_id, spotify_track_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spotify_matches_song_id ON public.spotify_matches(song_id);
CREATE INDEX IF NOT EXISTS idx_spotify_matches_status ON public.spotify_matches(status);
CREATE INDEX IF NOT EXISTS idx_spotify_matches_confidence ON public.spotify_matches(confidence_score);
CREATE INDEX IF NOT EXISTS idx_spotify_matches_created_at ON public.spotify_matches(created_at);
CREATE INDEX IF NOT EXISTS idx_spotify_matches_reviewed_by ON public.spotify_matches(reviewed_by);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_spotify_matches_status_confidence ON public.spotify_matches(status, confidence_score DESC);

-- Add RLS policies
ALTER TABLE public.spotify_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and teachers can view all matches
CREATE POLICY "Admins and teachers can view spotify matches" ON public.spotify_matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_overview 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_teacher = true)
        )
    );

-- Policy: Admins and teachers can insert matches
CREATE POLICY "Admins and teachers can insert spotify matches" ON public.spotify_matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_overview 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_teacher = true)
        )
    );

-- Policy: Admins and teachers can update matches (for review)
CREATE POLICY "Admins and teachers can update spotify matches" ON public.spotify_matches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_overview 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_teacher = true)
        )
    );

-- Policy: Admins can delete matches
CREATE POLICY "Admins can delete spotify matches" ON public.spotify_matches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_overview 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_spotify_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spotify_matches_updated_at
    BEFORE UPDATE ON public.spotify_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_spotify_matches_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.spotify_matches IS 'Stores potential Spotify matches for manual review when confidence is below auto-apply threshold';
COMMENT ON COLUMN public.spotify_matches.confidence_score IS 'AI confidence score (0-100) for the match quality';
COMMENT ON COLUMN public.spotify_matches.status IS 'Review status: pending (awaiting review), approved (manually approved), rejected (manually rejected), auto_applied (automatically applied due to high confidence)';
COMMENT ON COLUMN public.spotify_matches.search_query IS 'The search query that found this match';
COMMENT ON COLUMN public.spotify_matches.match_reason IS 'Brief explanation of why this was considered a match';
COMMENT ON COLUMN public.spotify_matches.ai_reasoning IS 'Detailed AI reasoning for the match';