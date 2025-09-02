-- Create function to get public categories for store catalog
CREATE OR REPLACE FUNCTION public.get_public_store_categories(store_url_param text)
 RETURNS TABLE(id uuid, name text, image_url text, display_order integer, is_active boolean, product_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    c.id,
    c.name,
    c.image_url,
    c.display_order,
    c.is_active,
    COUNT(p.id) as product_count
  FROM public.categories c
  INNER JOIN public.profiles pr ON c.user_id = pr.id
  LEFT JOIN public.products p ON c.id = p.category_id
  WHERE pr.store_url = store_url_param 
    AND c.is_active = true
  GROUP BY c.id, c.name, c.image_url, c.display_order, c.is_active
  ORDER BY c.display_order ASC, c.created_at ASC;
$function$;

-- Update default profile settings for new users to have light theme and correct layouts
-- Fix the inverted layout names issue
UPDATE public.profiles 
SET 
  catalog_theme = 'light',
  catalog_layout = 'bottom',  -- This shows title/price visible (was inverted)
  product_grid_layout = 'default'
WHERE catalog_theme IS NULL OR catalog_theme = 'beige';