-- Add TikTok short URL field to songs table for practice purposes
-- This allows students to listen to short repeated clips for practice

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS tiktok_short_url TEXT;

COMMENT ON COLUMN songs.tiktok_short_url IS 'TikTok short URL for practice - allows repeated listening of song clips';
