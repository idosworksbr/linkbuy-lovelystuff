-- Remover políticas problemáticas que permitem acesso muito amplo
DROP POLICY IF EXISTS "Public categories access for store view" ON public.categories;
DROP POLICY IF EXISTS "public_products_store_access_only" ON public.products;
DROP POLICY IF EXISTS "public_custom_links_store_access_only" ON public.custom_links;

-- Criar políticas mais restritivas para categorias
-- Usuários só podem ver suas próprias categorias quando autenticados
CREATE POLICY "users_own_categories_only" ON public.categories
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Para usuários não autenticados ou edge functions, usar service role
CREATE POLICY "service_role_categories_access" ON public.categories
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Criar políticas mais restritivas para produtos
-- Usuários só podem ver seus próprios produtos quando autenticados
CREATE POLICY "users_own_products_only" ON public.products
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Para usuários não autenticados ou edge functions, usar service role
CREATE POLICY "service_role_products_access" ON public.products
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Criar políticas mais restritivas para custom links
-- Usuários só podem ver seus próprios links quando autenticados
CREATE POLICY "users_own_custom_links_only" ON public.custom_links
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Para usuários não autenticados ou edge functions, usar service role
CREATE POLICY "service_role_custom_links_access" ON public.custom_links
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Verificar se há uma view problemática que precisa ser corrigida
-- A view public_store_catalog deve ser segura e não vazar dados entre usuários