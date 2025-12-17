-- Add youtube_url and gallery_images columns to songs table
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS gallery_images text[];
