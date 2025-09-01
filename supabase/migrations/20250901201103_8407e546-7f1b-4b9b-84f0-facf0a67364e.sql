-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('background-images', 'background-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create storage policies for profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile photos are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for background images
CREATE POLICY "Users can upload their own background images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'background-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Background images are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'background-images');

CREATE POLICY "Users can update their own background images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'background-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own background images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'background-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);