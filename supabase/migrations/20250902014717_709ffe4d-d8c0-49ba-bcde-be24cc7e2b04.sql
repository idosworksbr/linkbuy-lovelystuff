-- Update get_public_store_info function to include whatsapp_number and instagram_url
CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
RETURNS TABLE(
  id uuid, 
  store_name text, 
  store_description text, 
  profile_photo_url text, 
  background_color text, 
  background_type text, 
  background_image_url text, 
  custom_background_enabled boolean, 
  store_url text, 
  catalog_theme text, 
  catalog_layout text, 
  hide_footer boolean, 
  is_verified boolean, 
  product_grid_layout text, 
  created_at timestamp with time zone,
  whatsapp_number numeric,
  instagram_url text,
  custom_whatsapp_message text
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.store_name,
    p.store_description,
    p.profile_photo_url,
    p.background_color,
    COALESCE(p.background_type, 'color') as background_type,
    p.background_image_url,
    COALESCE(p.custom_background_enabled, false) as custom_background_enabled,
    p.store_url,
    p.catalog_theme,
    p.catalog_layout,
    COALESCE(p.hide_footer, false) as hide_footer,
    COALESCE(p.is_verified, false) as is_verified,
    COALESCE(p.product_grid_layout, 'default') as product_grid_layout,
    p.created_at,
    p.whatsapp_number,
    p.instagram_url,
    COALESCE(p.custom_whatsapp_message, 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.') as custom_whatsapp_message
  FROM public_store_catalog p
  WHERE p.store_url = store_url_param;
$function$;