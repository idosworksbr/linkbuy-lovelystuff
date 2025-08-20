-- Drop the problematic view that triggered security warnings
DROP VIEW IF EXISTS public.public_store_profiles;

-- Remove the current overly permissive policy
DROP POLICY IF EXISTS "Public catalog access to store info only" ON public.profiles;

-- Create a security definer function that only returns public store information
-- This prevents exposing personal information like full names
CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
RETURNS TABLE (
  id uuid,
  store_url text,
  store_name text,
  store_description text,
  profile_photo_url text,
  background_color text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.store_url,
    p.store_name,
    p.store_description,
    p.profile_photo_url,
    p.background_color,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.store_url = store_url_param;
$$;

-- Grant execute permission to anonymous users for the catalog function
GRANT EXECUTE ON FUNCTION public.get_public_store_info(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_store_info(text) TO authenticated;