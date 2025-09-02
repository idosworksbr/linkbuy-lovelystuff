-- Remover apenas as políticas problemáticas que permitem vazamento de dados entre usuários
DROP POLICY IF EXISTS "Public categories access for store view" ON public.categories;
DROP POLICY IF EXISTS "public_products_store_access_only" ON public.products; 
DROP POLICY IF EXISTS "public_custom_links_store_access_only" ON public.custom_links;

-- Adicionar políticas para permitir que edge functions acessem dados com service role
-- Estas são necessárias para o catálogo público funcionar

CREATE POLICY "service_role_categories_access" ON public.categories
FOR SELECT
USING ((auth.jwt() ->> 'role')::text = 'service_role');

CREATE POLICY "service_role_products_access" ON public.products  
FOR SELECT
USING ((auth.jwt() ->> 'role')::text = 'service_role');

CREATE POLICY "service_role_custom_links_access" ON public.custom_links
FOR SELECT  
USING ((auth.jwt() ->> 'role')::text = 'service_role');