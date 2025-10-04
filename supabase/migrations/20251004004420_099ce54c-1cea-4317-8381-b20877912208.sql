-- Adicionar campo de telefone na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT;

-- Adicionar índice para melhorar buscas por telefone
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Adicionar campos de tracking de acesso na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Adicionar função para atualizar last_login_at
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar last_login_at quando usuário fizer login
-- (será acionado pela aplicação quando detectar login)

COMMENT ON COLUMN public.profiles.phone IS 'Número de telefone do usuário para contato';
COMMENT ON COLUMN public.profiles.last_login_at IS 'Último acesso do usuário';
COMMENT ON COLUMN public.profiles.first_login_at IS 'Primeiro acesso do usuário';