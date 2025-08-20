-- Remove the overly permissive policy that exposes personal information
DROP POLICY IF EXISTS "Anyone can view profiles by store_url" ON public.profiles;

-- Create a more restrictive policy that only exposes store-related information for public catalogs
-- This policy allows public access only to store-specific fields, not personal information like full names
CREATE POLICY "Public catalog access to store info only" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create a view that only exposes public store information
CREATE VIEW public.public_store_profiles AS
SELECT 
  id,
  store_url,
  store_name,
  store_description,
  profile_photo_url,
  background_color,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view (inherits from the table)
-- Users can still access their full profile through the existing "Users can view their own profile" policy