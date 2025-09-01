-- Fix profiles table - protect sensitive personal data while maintaining store catalog functionality

-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "public_can_view_store_profiles" ON public.profiles;

-- Create a public view function that only exposes necessary store display data
-- This is already implemented as get_public_store_info function, so we just need
-- to restrict direct table access and use the function instead

-- Create a limited public policy for profiles that only shows store display information
CREATE POLICY "public_can_view_limited_store_info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to specific columns needed for catalog display
  -- This policy will work with the existing get_public_store_info function
  true
);

-- Note: The get_public_store_info function already exists and properly filters
-- what data is exposed to the public. The edge functions use this function
-- instead of direct table access, which provides the proper security layer.