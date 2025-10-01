-- Modificar handle_new_user para NÃO gerar store_url na criação
-- store_url será gerado apenas no primeiro login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  -- Inserir perfil SEM store_url (será gerado no primeiro login)
  INSERT INTO public.profiles (
    id, 
    name, 
    store_url,  -- NULL inicialmente
    store_name, 
    catalog_theme, 
    catalog_layout, 
    product_grid_layout
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    NULL,  -- store_url será gerado no primeiro login
    COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja'),
    'light',
    'bottom',
    'default'
  );
  
  RETURN new;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil do usuário sem store_url - será gerado no primeiro login';