-- Fix RLS for storage uploads to background-images
DROP POLICY IF EXISTS "Public can view background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own background images" ON storage.objects;

CREATE POLICY "Public can view background images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'background-images');

CREATE POLICY "Users can upload their own background images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'background-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can update their own background images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'background-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'background-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can delete their own background images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'background-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);