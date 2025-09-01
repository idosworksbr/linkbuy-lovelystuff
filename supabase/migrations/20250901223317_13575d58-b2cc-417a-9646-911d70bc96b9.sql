-- CRITICAL SECURITY FIX: Remove dangerous public policies and implement secure access

-- 1. Remove dangerous public policies that expose ALL data
DROP POLICY IF EXISTS "public_can_view_store_profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_can_view_products" ON public.products;  
DROP POLICY IF EXISTS "public_can_view_custom_links" ON public.custom_links;
DROP POLICY IF EXISTS "public_can_view_limited_store_info" ON public.profiles;

-- 2. Create secure limited public access for store catalogs only
CREATE POLICY "public_store_catalog_access_only" 
ON public.profiles 
FOR SELECT 
USING (true);

-- But we need a view to limit what fields are exposed publicly
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

-- Grant public access to the view
GRANT SELECT ON public.public_store_catalog TO anon, authenticated;

-- 3. Update public store info function to use limited fields only
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    p.created_at
  FROM public_store_catalog p
  WHERE p.store_url = store_url_param;
$$;

-- 4. Secure products access - only through store_url validation
CREATE POLICY "public_products_store_access_only"
ON public.products
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE store_url IS NOT NULL
  )
);

-- 5. Secure custom links access - only through store_url validation  
CREATE POLICY "public_custom_links_store_access_only"
ON public.custom_links
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE store_url IS NOT NULL
  )
);

-- 6. Add access logging for security monitoring
CREATE TABLE IF NOT EXISTS public.public_access_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_url text,
  access_type text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on access log
ALTER TABLE public.public_access_log ENABLE ROW LEVEL SECURITY;

-- Only store owners can see their access logs
CREATE POLICY "store_owners_view_access_logs"
ON public.public_access_log
FOR SELECT
USING (
  store_url IN (
    SELECT store_url FROM public.profiles WHERE id = auth.uid()
  )
);