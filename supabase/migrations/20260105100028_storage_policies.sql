-- Migration: Storage bucket policies
-- Policies for Supabase Storage

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload song images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to song images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete song images" ON storage.objects;

-- Allow authenticated users to upload files to the song-images bucket
CREATE POLICY "Authenticated users can upload song images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'song-images');

-- Allow public access to view images
CREATE POLICY "Public Access to song images"
ON storage.objects FOR SELECT
USING (bucket_id = 'song-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete song images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'song-images');
