-- Tabela de configurações de expiração de contas
CREATE TABLE IF NOT EXISTS public.account_expiration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expiration_hours INTEGER NOT NULL DEFAULT 24,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir configuração padrão (24 horas)
INSERT INTO public.account_expiration_settings (expiration_hours, enabled)
VALUES (24, true)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.account_expiration_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas service role pode gerenciar
CREATE POLICY "Service role can manage expiration settings"
ON public.account_expiration_settings
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Adicionar coluna email_confirmed_at na tabela profiles para rastrear confirmação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Função para atualizar timestamp de confirmação quando usuário confirma email
CREATE OR REPLACE FUNCTION public.update_email_confirmed_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualiza apenas se email_confirmed_at ainda não foi definido e o usuário confirmou o email
  IF NEW.email_confirmed_at != OLD.email_confirmed_at OR 
     (NEW.email_confirmed_at IS NULL AND OLD.email_confirmed_at IS NULL) THEN
    -- Verifica se o email foi confirmado
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.id 
      AND email_confirmed_at IS NOT NULL
      AND (OLD.email_confirmed_at IS NULL OR NEW.email_confirmed_at IS NULL)
    ) THEN
      NEW.email_confirmed_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar timestamp de confirmação
DROP TRIGGER IF EXISTS update_email_confirmed_trigger ON public.profiles;
CREATE TRIGGER update_email_confirmed_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_confirmed_timestamp();

-- Tabela para auditar exclusões de usuários
CREATE TABLE IF NOT EXISTS public.user_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id UUID NOT NULL,
  deleted_user_email TEXT NOT NULL,
  deleted_user_name TEXT,
  deleted_by TEXT NOT NULL,
  deletion_reason TEXT,
  products_count INTEGER DEFAULT 0,
  categories_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_deletion_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas service role pode acessar
CREATE POLICY "Service role can access deletion audit"
ON public.user_deletion_audit
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);