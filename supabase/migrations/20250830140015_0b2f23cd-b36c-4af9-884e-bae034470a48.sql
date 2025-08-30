-- Create analytics_events table to track all user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('catalog_view', 'product_view', 'whatsapp_click', 'instagram_click')),
  store_id UUID NOT NULL,
  product_id UUID NULL,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_analytics table for aggregated product metrics
CREATE TABLE public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  instagram_clicks INTEGER NOT NULL DEFAULT 0,
  last_view TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Create store_analytics table for aggregated store metrics
CREATE TABLE public.store_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  total_catalog_views INTEGER NOT NULL DEFAULT 0,
  total_product_views INTEGER NOT NULL DEFAULT 0,
  total_whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  total_instagram_clicks INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id)
);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_events (owner can view their store's events)
CREATE POLICY "Store owners can view their analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (store_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));

-- RLS policies for product_analytics (owner can view their product analytics)
CREATE POLICY "Store owners can view their product analytics" 
ON public.product_analytics 
FOR SELECT 
USING (product_id IN (SELECT id FROM public.products WHERE auth.uid() = user_id));

-- RLS policies for store_analytics (owner can view their store analytics)
CREATE POLICY "Store owners can view their store analytics" 
ON public.store_analytics 
FOR SELECT 
USING (store_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_store_id ON public.analytics_events(store_id);
CREATE INDEX idx_analytics_events_product_id ON public.analytics_events(product_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);

-- Create function to get store analytics with date filtering
CREATE OR REPLACE FUNCTION public.get_store_analytics(
  store_id_param UUID,
  start_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  total_catalog_views BIGINT,
  total_product_views BIGINT,
  total_whatsapp_clicks BIGINT,
  total_instagram_clicks BIGINT,
  unique_visitors BIGINT
)
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

-- Create function to get product analytics with date filtering
CREATE OR REPLACE FUNCTION public.get_product_analytics(
  store_id_param UUID,
  start_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  product_image TEXT,
  product_price NUMERIC,
  total_views BIGINT,
  whatsapp_clicks BIGINT,
  instagram_clicks BIGINT,
  conversion_rate NUMERIC
)
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