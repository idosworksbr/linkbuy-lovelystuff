-- Drop and recreate the get_public_store_info function to include hide_footer and is_verified fields
DROP FUNCTION IF EXISTS public.get_public_store_info(text);

CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
 RETURNS TABLE(
   id uuid, 
   store_url text, 
   store_name text, 
   store_description text, 
   profile_photo_url text, 
   background_color text, 
   background_type text,
   background_image_url text,
   whatsapp_number numeric, 
   custom_whatsapp_message text, 
   instagram_url text, 
   catalog_theme text, 
   catalog_layout text, 
   hide_footer boolean,
   is_verified boolean,
   created_at timestamp with time zone, 
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.store_url,
    p.store_name,
    p.store_description,
    p.profile_photo_url,
    p.background_color,
    p.background_type,
    p.background_image_url,
    p.whatsapp_number,
    p.custom_whatsapp_message,
    p.instagram_url,
    p.catalog_theme,
    p.catalog_layout,
    p.hide_footer,
    p.is_verified,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.store_url = store_url_param;
$function$