-- Create storage bucket for court images
-- Created: 2026-02-04

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('court-images', 'court-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view court images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload court images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update court images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete court images" ON storage.objects;

-- Allow public read access to court images
CREATE POLICY "Public can view court images"
ON storage.objects FOR SELECT
USING (bucket_id = 'court-images');

-- Allow anyone to upload court images (you might want to restrict this to authenticated users only)
CREATE POLICY "Anyone can upload court images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'court-images');

-- Allow anyone to update court images
CREATE POLICY "Anyone can update court images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'court-images')
WITH CHECK (bucket_id = 'court-images');

-- Allow anyone to delete court images
CREATE POLICY "Anyone can delete court images"
ON storage.objects FOR DELETE
USING (bucket_id = 'court-images');
