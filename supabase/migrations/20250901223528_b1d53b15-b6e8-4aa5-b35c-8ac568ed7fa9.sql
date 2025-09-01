-- Fix security definer view issue
-- Drop and recreate the view without SECURITY DEFINER property

DROP VIEW IF EXISTS public.public_store_catalog;

-- Create view without SECURITY DEFINER - regular view is sufficient and safer
CREATE OR REPLACE VIEW public.public_store_catalog AS
SELECT 
  id,
  store_name,
  store_description,
  profile_photo_url,
  background_color,
  background_type,
  background_image_url,
  custom_background_enabled,
  store_url,
  catalog_theme,
  catalog_layout,
  hide_footer,
  is_verified,
  product_grid_layout,
  created_at
FROM public.profiles;

-- Re-grant public access to the view
GRANT SELECT ON public.public_store_catalog TO anon, authenticated;