-- Sincronizar dados de assinatura entre subscribers e profiles
-- Atualizar tabela profiles com dados de assinatura dos subscribers
UPDATE public.profiles 
SET 
  subscription_plan = CASE 
    WHEN s.subscription_tier = 'pro' THEN 'pro'::subscription_plan
    WHEN s.subscription_tier = 'pro_plus' THEN 'pro_plus'::subscription_plan
    WHEN s.subscription_tier = 'verified' THEN 'verified'::subscription_plan
    WHEN s.subscription_tier = 'pro_plus_verified' THEN 'pro_plus_verified'::subscription_plan
    ELSE 'free'::subscription_plan
  END,
  subscription_expires_at = s.subscription_end,
  is_verified = CASE 
    WHEN s.subscription_tier IN ('verified', 'pro_plus_verified') THEN true 
    ELSE false 
  END
FROM public.subscribers s 
WHERE profiles.id = s.user_id AND s.subscribed = true;

-- Criar função para sincronizar automaticamente
CREATE OR REPLACE FUNCTION public.sync_subscription_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o perfil correspondente
  UPDATE public.profiles 
  SET 
    subscription_plan = CASE 
      WHEN NEW.subscription_tier = 'pro' THEN 'pro'::subscription_plan
      WHEN NEW.subscription_tier = 'pro_plus' THEN 'pro_plus'::subscription_plan  
      WHEN NEW.subscription_tier = 'verified' THEN 'verified'::subscription_plan
      WHEN NEW.subscription_tier = 'pro_plus_verified' THEN 'pro_plus_verified'::subscription_plan
      ELSE 'free'::subscription_plan
    END,
    subscription_expires_at = NEW.subscription_end,
    is_verified = CASE 
      WHEN NEW.subscription_tier IN ('verified', 'pro_plus_verified') THEN true 
      ELSE false 
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS sync_subscription_trigger ON public.subscribers;
CREATE TRIGGER sync_subscription_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscription_to_profile();