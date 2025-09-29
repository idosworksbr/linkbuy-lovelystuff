-- Adicionar colunas de cores de texto para nome e preço
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS product_name_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS product_price_text_color TEXT DEFAULT '#ffffff';

-- Atualizar a view public_store_catalog
DROP VIEW IF EXISTS public.public_store_catalog;

CREATE VIEW public.public_store_catalog AS
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
  created_at,
  whatsapp_number,
  instagram_url,
  custom_whatsapp_message,
  product_text_background_enabled,
  product_text_background_color,
  product_text_background_opacity,
  product_name_text_color,
  product_price_text_color
FROM public.profiles
WHERE catalog_visible = true;

-- Atualizar a function get_public_store_info
DROP FUNCTION IF EXISTS public.get_public_store_info(text);

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
  custom_whatsapp_message text,
  product_text_background_enabled boolean,
  product_text_background_color text,
  product_text_background_opacity integer,
  product_name_text_color text,
  product_price_text_color text
)
LANGUAGE sql
STABLE
SET search_path = public
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
    p.created_at,
    p.whatsapp_number,
    p.instagram_url,
    COALESCE(p.custom_whatsapp_message, 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.') as custom_whatsapp_message,
    COALESCE(p.product_text_background_enabled, true) as product_text_background_enabled,
    COALESCE(p.product_text_background_color, '#000000') as product_text_background_color,
    COALESCE(p.product_text_background_opacity, 70) as product_text_background_opacity,
    COALESCE(p.product_name_text_color, '#ffffff') as product_name_text_color,
    COALESCE(p.product_price_text_color, '#ffffff') as product_price_text_color
  FROM public_store_catalog p
  WHERE p.store_url = store_url_param;
$$;