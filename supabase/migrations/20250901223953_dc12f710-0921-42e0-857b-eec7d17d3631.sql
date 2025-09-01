-- Completely drop and recreate view to remove any SECURITY DEFINER remnants
DROP VIEW IF EXISTS public.public_store_catalog CASCADE;

-- Recreate the view completely clean without any SECURITY DEFINER
CREATE VIEW public.public_store_catalog AS
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

-- Grant access to the view
GRANT SELECT ON public.public_store_catalog TO anon, authenticated;