-- Create function to get public custom links for a store
CREATE OR REPLACE FUNCTION public.get_public_custom_links(store_url_param text)
RETURNS TABLE(
  id uuid,
  title text,
  url text,
  icon text,
  display_order integer
)
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
$function$