-- Fix security definer view issue
-- Recreate view without security definer
DROP VIEW IF EXISTS public_store_catalog;

CREATE VIEW public_store_catalog AS
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
  created_at,
  whatsapp_number,
  instagram_url,
  custom_whatsapp_message
FROM public.profiles
WHERE store_url IS NOT NULL;

-- Grant appropriate permissions
GRANT SELECT ON public_store_catalog TO anon, authenticated;