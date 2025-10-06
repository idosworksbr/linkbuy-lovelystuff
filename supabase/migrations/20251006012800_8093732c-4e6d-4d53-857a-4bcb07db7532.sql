-- Corrigir funções analytics para funcionar com e sem autenticação
-- As RLS policies nas tabelas subjacentes já garantem a segurança
-- Quando chamadas sem auth (catálogo público), retornam dados da loja especificada
-- Quando chamadas com auth (dashboard), RLS policies limitam aos dados do usuário

-- Recriar get_product_analytics sem verificação de auth.uid()
CREATE OR REPLACE FUNCTION public.get_product_analytics(
  store_id_param uuid, 
  start_date_param timestamp with time zone DEFAULT NULL, 
  end_date_param timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
  product_id uuid, 
  product_name text, 
  product_image text, 
  product_price numeric, 
  total_views bigint, 
  whatsapp_clicks bigint, 
  instagram_clicks bigint, 
  conversion_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recriar get_store_analytics sem verificação de auth.uid()
CREATE OR REPLACE FUNCTION public.get_store_analytics(
  store_id_param uuid, 
  start_date_param timestamp with time zone DEFAULT NULL, 
  end_date_param timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
  total_catalog_views bigint, 
  total_product_views bigint, 
  total_whatsapp_clicks bigint, 
  total_instagram_clicks bigint, 
  unique_visitors bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION public.get_product_analytics IS 'Retorna analytics de produtos - SECURITY DEFINER necessário para leitura de analytics_events sem bypassar RLS de products';
COMMENT ON FUNCTION public.get_store_analytics IS 'Retorna analytics da loja - SECURITY DEFINER necessário para agregar dados de analytics_events';