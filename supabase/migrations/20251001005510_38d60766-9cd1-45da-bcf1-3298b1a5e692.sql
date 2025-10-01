-- ============================================
-- FASE 1: Correção Crítica do Sistema de Cadastro (Corrigido)
-- ============================================

-- 1. Adicionar campo onboarding_completed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Corrigir função handle_new_user com lógica robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- 3. Criar índices para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON public.profiles(email_confirmed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- 4. Atualizar usuários existentes com onboarding_completed = true se tiverem produtos
UPDATE public.profiles
SET onboarding_completed = true
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.products
);

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indica se o usuário completou o onboarding inicial';