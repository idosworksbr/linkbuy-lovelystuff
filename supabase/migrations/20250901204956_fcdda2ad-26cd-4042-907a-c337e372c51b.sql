-- CRITICAL SECURITY FIX: Remove overly permissive public read access to products table
-- This was exposing all product information to everyone, including sensitive data

-- Remove the dangerous public policy that allows anyone to view all products
DROP POLICY IF EXISTS "Public users can view products" ON public.products;

-- Fix database functions security by adding proper search_path (addresses linter warning)
-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
 RETURNS TABLE(id uuid, store_name text, store_description text, profile_photo_url text, background_color text, background_type text, background_image_url text, custom_background_enabled boolean, store_url text, whatsapp_number numeric, custom_whatsapp_message text, instagram_url text, catalog_theme text, catalog_layout text, hide_footer boolean, is_verified boolean, product_grid_layout text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
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
    p.whatsapp_number,
    p.custom_whatsapp_message,
    p.instagram_url,
    p.catalog_theme,
    p.catalog_layout,
    COALESCE(p.hide_footer, false) as hide_footer,
    COALESCE(p.is_verified, false) as is_verified,
    COALESCE(p.product_grid_layout, 'default') as product_grid_layout,
    p.created_at
  FROM profiles p
  WHERE p.store_url = store_url_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_store_products(store_url_param text)
 RETURNS TABLE(id uuid, name text, description text, price numeric, images text[], created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.images,
    p.created_at,
    p.updated_at
  FROM public.products p
  INNER JOIN public.profiles pr ON p.user_id = pr.id
  WHERE pr.store_url = store_url_param;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_custom_links(store_url_param text)
 RETURNS TABLE(id uuid, title text, url text, icon text, display_order integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    cl.id,
    cl.title,
    cl.url,
    cl.icon,
    cl.display_order
  FROM public.custom_links cl
  INNER JOIN public.profiles p ON cl.user_id = p.id
  WHERE p.store_url = store_url_param 
    AND cl.is_active = true
  ORDER BY cl.display_order ASC, cl.created_at ASC;
$function$;

CREATE OR REPLACE FUNCTION public.get_store_analytics(store_id_param uuid, start_date_param timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date_param timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(total_catalog_views bigint, total_product_views bigint, total_whatsapp_clicks bigint, total_instagram_clicks bigint, unique_visitors bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    COALESCE(SUM(CASE WHEN event_type = 'catalog_view' THEN 1 ELSE 0 END), 0) as total_catalog_views,
    COALESCE(SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END), 0) as total_product_views,
    COALESCE(SUM(CASE WHEN event_type = 'whatsapp_click' THEN 1 ELSE 0 END), 0) as total_whatsapp_clicks,
    COALESCE(SUM(CASE WHEN event_type = 'instagram_click' THEN 1 ELSE 0 END), 0) as total_instagram_clicks,
    COALESCE(COUNT(DISTINCT ip_address), 0) as unique_visitors
  FROM public.analytics_events e
  WHERE e.store_id = store_id_param
    AND (start_date_param IS NULL OR e.created_at >= start_date_param)
    AND (end_date_param IS NULL OR e.created_at <= end_date_param);
$function$;

CREATE OR REPLACE FUNCTION public.get_product_analytics(store_id_param uuid, start_date_param timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date_param timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(product_id uuid, product_name text, product_image text, product_price numeric, total_views bigint, whatsapp_clicks bigint, instagram_clicks bigint, conversion_rate numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(p.images[1], '') as product_image,
    p.price as product_price,
    COALESCE(SUM(CASE WHEN e.event_type = 'product_view' THEN 1 ELSE 0 END), 0) as total_views,
    COALESCE(SUM(CASE WHEN e.event_type = 'whatsapp_click' THEN 1 ELSE 0 END), 0) as whatsapp_clicks,
    COALESCE(SUM(CASE WHEN e.event_type = 'instagram_click' THEN 1 ELSE 0 END), 0) as instagram_clicks,
    CASE 
      WHEN SUM(CASE WHEN e.event_type = 'product_view' THEN 1 ELSE 0 END) > 0 
      THEN ROUND((SUM(CASE WHEN e.event_type = 'whatsapp_click' THEN 1 ELSE 0 END)::NUMERIC / SUM(CASE WHEN e.event_type = 'product_view' THEN 1 ELSE 0 END)) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM public.products p
  INNER JOIN public.profiles pr ON p.user_id = pr.id
  LEFT JOIN public.analytics_events e ON p.id = e.product_id 
    AND (start_date_param IS NULL OR e.created_at >= start_date_param)
    AND (end_date_param IS NULL OR e.created_at <= end_date_param)
  WHERE pr.id = store_id_param
  GROUP BY p.id, p.name, p.images, p.price
  ORDER BY total_views DESC;
$function$;