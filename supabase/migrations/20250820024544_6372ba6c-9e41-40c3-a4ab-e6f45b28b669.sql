
-- Criar tabela de perfis de usuário (lojas)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  store_url TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  store_description TEXT,
  profile_photo_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política pública para visualizar perfis por store_url (para catálogo público)
CREATE POLICY "Anyone can view profiles by store_url" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Políticas de segurança para products
CREATE POLICY "Users can view their own products" 
  ON public.products 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
  ON public.products 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
  ON public.products 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política pública para visualizar produtos (para catálogo público)
CREATE POLICY "Anyone can view products for public catalogs" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índices para performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_profiles_store_url ON public.profiles(store_url);

-- Função para validar store_url (apenas letras, números e hífens)
CREATE OR REPLACE FUNCTION public.validate_store_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.store_url !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'store_url deve conter apenas letras minúsculas, números e hífens';
  END IF;
  
  IF LENGTH(NEW.store_url) < 3 OR LENGTH(NEW.store_url) > 50 THEN
    RAISE EXCEPTION 'store_url deve ter entre 3 e 50 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validação
CREATE TRIGGER validate_store_url_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_store_url();
