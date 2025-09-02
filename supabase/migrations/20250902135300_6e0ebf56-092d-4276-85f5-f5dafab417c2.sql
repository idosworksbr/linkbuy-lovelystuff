-- Primeiro, vamos ver as políticas atuais e remover apenas as problemáticas

-- Remover políticas que permitem acesso muito amplo a dados de outros usuários
DROP POLICY IF EXISTS "Public categories access for store view" ON public.categories;
DROP POLICY IF EXISTS "public_products_store_access_only" ON public.products; 
DROP POLICY IF EXISTS "public_custom_links_store_access_only" ON public.custom_links;

-- Verificar se as políticas corretas já existem, se não, criar
-- Para categorias - permitir acesso do service role para edge functions públicas
CREATE POLICY IF NOT EXISTS "service_role_categories_access" ON public.categories
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Para produtos - permitir acesso do service role para edge functions públicas  
CREATE POLICY IF NOT EXISTS "service_role_products_access" ON public.products
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Para custom links - permitir acesso do service role para edge functions públicas
CREATE POLICY IF NOT EXISTS "service_role_custom_links_access" ON public.custom_links
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);