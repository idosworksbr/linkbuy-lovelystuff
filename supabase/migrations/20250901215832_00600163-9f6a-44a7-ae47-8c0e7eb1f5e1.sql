-- Criar tabela para gerenciar múltiplas assinaturas por usuário
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL, -- 'pro', 'pro_plus', 'verified'
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subscription_type)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (true);

-- Função para sincronizar assinaturas com profile
CREATE OR REPLACE FUNCTION public.sync_user_subscriptions_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  has_pro_plus BOOLEAN := FALSE;
  has_pro BOOLEAN := FALSE;
  has_verified BOOLEAN := FALSE;
  has_pro_plus_verified BOOLEAN := FALSE;
  final_plan subscription_plan;
  final_expires_at TIMESTAMPTZ;
  is_verified_user BOOLEAN := FALSE;
BEGIN
  -- Verificar quais assinaturas ativas o usuário possui
  SELECT 
    bool_or(subscription_type = 'pro_plus') AS has_pro_plus_sub,
    bool_or(subscription_type = 'pro') AS has_pro_sub,
    bool_or(subscription_type = 'verified') AS has_verified_sub,
    bool_or(subscription_type = 'pro_plus_verified') AS has_pro_plus_verified_sub,
    MAX(current_period_end) AS max_expires_at
  INTO has_pro_plus, has_pro, has_verified, has_pro_plus_verified, final_expires_at
  FROM public.user_subscriptions 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
    AND status = 'active';

  -- Determinar o plano final e status de verificação
  IF has_pro_plus_verified THEN
    final_plan := 'pro_plus_verified';
    is_verified_user := TRUE;
  ELSIF has_pro_plus AND has_verified THEN
    final_plan := 'pro_plus_verified'; -- Combinação PRO+ + Verificado = PRO+ Verificado
    is_verified_user := TRUE;
  ELSIF has_pro_plus THEN
    final_plan := 'pro_plus';
    is_verified_user := FALSE;
  ELSIF has_pro AND has_verified THEN
    final_plan := 'pro'; -- PRO + Verificado separado
    is_verified_user := TRUE;
  ELSIF has_verified THEN
    final_plan := 'verified'; -- Apenas verificado (sobre o FREE)
    is_verified_user := TRUE;
  ELSIF has_pro THEN
    final_plan := 'pro';
    is_verified_user := FALSE;
  ELSE
    final_plan := 'free';
    is_verified_user := FALSE;
    final_expires_at := NULL;
  END IF;

  -- Atualizar o perfil
  UPDATE public.profiles 
  SET 
    subscription_plan = final_plan,
    subscription_expires_at = final_expires_at,
    is_verified = is_verified_user,
    updated_at = now()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para sincronizar automaticamente
CREATE TRIGGER sync_subscriptions_to_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_subscriptions_to_profile();

-- Migrar dados existentes da tabela subscribers para user_subscriptions
INSERT INTO public.user_subscriptions (
  user_id, 
  subscription_type, 
  stripe_subscription_id,
  status,
  current_period_end,
  created_at
)
SELECT 
  user_id,
  CASE 
    WHEN subscription_tier = 'pro_plus_verified' THEN 'pro_plus_verified'
    WHEN subscription_tier = 'pro_plus' THEN 'pro_plus'
    WHEN subscription_tier = 'verified' THEN 'verified'
    WHEN subscription_tier = 'pro' THEN 'pro'
    ELSE 'pro'
  END as subscription_type,
  stripe_customer_id, -- Temporário, será atualizado pela edge function
  CASE WHEN subscribed THEN 'active' ELSE 'expired' END as status,
  subscription_end,
  created_at
FROM public.subscribers 
WHERE subscribed = true AND user_id IS NOT NULL;

-- Trigger de update timestamp
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();