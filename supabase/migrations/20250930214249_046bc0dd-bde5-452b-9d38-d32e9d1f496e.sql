-- Melhorar a função handle_new_user para tratar melhor os erros de store_url duplicado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_store_url TEXT;
  final_store_url TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  -- Gerar store_url base do nome ou email
  base_store_url := LOWER(
    REPLACE(
      REGEXP_REPLACE(
        COALESCE(new.raw_user_meta_data->>'name', 'loja-' || SUBSTRING(new.id::text, 1, 8)),
        '[^a-zA-Z0-9\s-]',
        '',
        'g'
      ),
      ' ',
      '-'
    )
  );
  
  -- Limpar hífens múltiplos e trailing
  base_store_url := REGEXP_REPLACE(base_store_url, '-+', '-', 'g');
  base_store_url := TRIM(BOTH '-' FROM base_store_url);
  
  -- Garantir que não está vazio
  IF base_store_url = '' OR base_store_url IS NULL THEN
    base_store_url := 'loja-' || SUBSTRING(new.id::text, 1, 8);
  END IF;
  
  final_store_url := base_store_url;
  
  -- Tentar encontrar um store_url único
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE store_url = final_store_url) AND counter < max_attempts LOOP
    counter := counter + 1;
    final_store_url := base_store_url || '-' || counter;
  END LOOP;
  
  -- Se ainda assim não conseguiu, adicionar ID do usuário
  IF EXISTS (SELECT 1 FROM public.profiles WHERE store_url = final_store_url) THEN
    final_store_url := base_store_url || '-' || SUBSTRING(new.id::text, 1, 6);
  END IF;
  
  -- Inserir perfil com tratamento de erro
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      store_url, 
      store_name, 
      catalog_theme, 
      catalog_layout, 
      product_grid_layout
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
      final_store_url,
      COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja'),
      'light',
      'bottom',
      'default'
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Em caso de violação única (muito raro), adicionar timestamp
      final_store_url := base_store_url || '-' || EXTRACT(EPOCH FROM now())::bigint::text;
      INSERT INTO public.profiles (
        id, 
        name, 
        store_url, 
        store_name, 
        catalog_theme, 
        catalog_layout, 
        product_grid_layout
      )
      VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
        final_store_url,
        COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja'),
        'light',
        'bottom',
        'default'
      );
  END;
  
  RETURN new;
END;
$$;