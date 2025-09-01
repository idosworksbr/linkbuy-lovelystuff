-- Fix remaining SECURITY DEFINER functions for public access
-- Only public-facing functions should be non-SECURITY DEFINER

-- Fix get_public_store_products function
DROP FUNCTION IF EXISTS public.get_public_store_products(text);

CREATE OR REPLACE FUNCTION public.get_public_store_products(store_url_param text)
RETURNS TABLE(id uuid, name text, description text, price numeric, images text[], created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
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
$$;

-- Fix get_public_custom_links function  
DROP FUNCTION IF EXISTS public.get_public_custom_links(text);

CREATE OR REPLACE FUNCTION public.get_public_custom_links(store_url_param text)
RETURNS TABLE(id uuid, title text, url text, icon text, display_order integer)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
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
$$;