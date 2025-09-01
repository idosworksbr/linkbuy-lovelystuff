-- Fix critical security issues

-- 1. Fix user_subscriptions RLS policies - Remove overly permissive policy
DROP POLICY IF EXISTS "Service can manage all subscriptions" ON public.user_subscriptions;

-- Create proper RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions only" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow service role to manage all subscriptions (for edge functions)
CREATE POLICY "Service role can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. Fix database functions security - Set proper search_path

-- Update sync_subscription_to_profile function
CREATE OR REPLACE FUNCTION public.sync_subscription_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar o perfil correspondente
  UPDATE public.profiles 
  SET 
    subscription_plan = CASE 
      WHEN NEW.subscription_tier = 'pro' THEN 'pro'::subscription_plan
      WHEN NEW.subscription_tier = 'pro_plus' THEN 'pro_plus'::subscription_plan  
      WHEN NEW.subscription_tier = 'verified' THEN 'verified'::subscription_plan
      WHEN NEW.subscription_tier = 'pro_plus_verified' THEN 'pro_plus_verified'::subscription_plan
      ELSE 'free'::subscription_plan
    END,
    subscription_expires_at = NEW.subscription_end,
    is_verified = CASE 
      WHEN NEW.subscription_tier IN ('verified', 'pro_plus_verified') THEN true 
      ELSE false 
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_store_analytics function
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

-- Update get_product_analytics function
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

-- Update get_public_custom_links function
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

-- Update sync_user_subscriptions_to_profile function
CREATE OR REPLACE FUNCTION public.sync_user_subscriptions_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_pro_plus BOOLEAN := FALSE;
  has_pro BOOLEAN := FALSE;
  has_verified BOOLEAN := FALSE;
  has_pro_plus_verified BOOLEAN := FALSE;
  final_plan subscription_plan;
  final_expires_at TIMESTAMPTZ;
  is_verified_user BOOLEAN := FALSE;
BEGIN
  -- Verificar quais assinaturas ativas o usuário possui
  SELECT 
    bool_or(subscription_type = 'pro_plus') AS has_pro_plus_sub,
    bool_or(subscription_type = 'pro') AS has_pro_sub,
    bool_or(subscription_type = 'verified') AS has_verified_sub,
    bool_or(subscription_type = 'pro_plus_verified') AS has_pro_plus_verified_sub,
    MAX(current_period_end) AS max_expires_at
  INTO has_pro_plus, has_pro, has_verified, has_pro_plus_verified, final_expires_at
  FROM public.user_subscriptions 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
    AND status = 'active';

  -- Determinar o plano final e status de verificação
  IF has_pro_plus_verified THEN
    final_plan := 'pro_plus_verified';
    is_verified_user := TRUE;
  ELSIF has_pro_plus AND has_verified THEN
    final_plan := 'pro_plus_verified'; -- Combinação PRO+ + Verificado = PRO+ Verificado
    is_verified_user := TRUE;
  ELSIF has_pro_plus THEN
    final_plan := 'pro_plus';
    is_verified_user := FALSE;
  ELSIF has_pro AND has_verified THEN
    final_plan := 'pro'; -- PRO + Verificado separado
    is_verified_user := TRUE;
  ELSIF has_verified THEN
    final_plan := 'verified'; -- Apenas verificado (sobre o FREE)
    is_verified_user := TRUE;
  ELSIF has_pro THEN
    final_plan := 'pro';
    is_verified_user := FALSE;
  ELSE
    final_plan := 'free';
    is_verified_user := FALSE;
    final_expires_at := NULL;
  END IF;

  -- Atualizar o perfil
  UPDATE public.profiles 
  SET 
    subscription_plan = final_plan,
    subscription_expires_at = final_expires_at,
    is_verified = is_verified_user,
    updated_at = now()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update get_public_store_info function
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

-- Update get_public_store_products function
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

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, store_url, store_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    LOWER(REPLACE(COALESCE(new.raw_user_meta_data->>'name', 'loja-' || SUBSTRING(new.id::text, 1, 8)), ' ', '-')),
    COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja')
  );
  RETURN new;
END;
$function$;

-- Update validate_store_url function
CREATE OR REPLACE FUNCTION public.validate_store_url()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.store_url !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'store_url deve conter apenas letras minúsculas, números e hífens';
  END IF;
  
  IF LENGTH(NEW.store_url) < 3 OR LENGTH(NEW.store_url) > 50 THEN
    RAISE EXCEPTION 'store_url deve ter entre 3 e 50 caracteres';
  END IF;
  
  RETURN NEW;
END;
$function$;