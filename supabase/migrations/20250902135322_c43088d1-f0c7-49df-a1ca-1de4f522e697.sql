-- Remover a view problemática que expõe dados sem segurança adequada
DROP VIEW IF EXISTS public.public_store_catalog;

-- Recriar a view de forma segura usando SECURITY INVOKER 
-- Isso garante que a view usa as permissões do usuário que faz a consulta
CREATE VIEW public.public_store_catalog 
WITH (security_invoker = true)
AS
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
    custom_whatsapp_message
FROM profiles
WHERE store_url IS NOT NULL;

-- Garantir que a view só pode ser acessada por service role
-- Isso evita que usuários normais vejam dados de outros usuários
CREATE POLICY "public_store_catalog_service_role_only" ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'service_role' 
  AND store_url IS NOT NULL
);