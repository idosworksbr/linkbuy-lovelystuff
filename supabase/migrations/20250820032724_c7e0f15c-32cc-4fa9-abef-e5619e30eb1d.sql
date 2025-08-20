
-- Primeiro, vamos corrigir a segurança crítica dos produtos
-- Remover a política que expõe todos os produtos publicamente
DROP POLICY IF EXISTS "Anyone can view products for public catalogs" ON public.products;

-- Criar uma função segura para buscar produtos de uma loja específica
CREATE OR REPLACE FUNCTION public.get_public_store_products(store_url_param text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  images text[],
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
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
$$;

-- Conceder permissões para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.get_public_store_products(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_store_products(text) TO authenticated;
