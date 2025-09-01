-- Corrigir warnings de segurança das funções criadas
-- Adicionando search_path às funções existentes que não têm

-- Função handle_new_user já existe, apenas adicionando search_path se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Função update_updated_at_column já existe, apenas adicionando search_path se necessário  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;