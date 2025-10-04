-- Adicionar RLS policies para permitir masters gerenciar notificações e afiliados

-- Criar função de segurança para verificar se o usuário é um master
CREATE OR REPLACE FUNCTION public.is_master_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.masters
    WHERE email = auth.email()
  )
$$;

-- Adicionar policy para masters inserirem notificações
CREATE POLICY "Masters can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_master_user());

-- Adicionar policies para masters gerenciarem afiliados
CREATE POLICY "Masters can insert affiliates"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (public.is_master_user());

CREATE POLICY "Masters can update affiliates"
ON public.affiliates
FOR UPDATE
TO authenticated
USING (public.is_master_user());

CREATE POLICY "Masters can view affiliates"
ON public.affiliates
FOR SELECT
TO authenticated
USING (public.is_master_user());

CREATE POLICY "Masters can delete affiliates"
ON public.affiliates
FOR DELETE
TO authenticated
USING (public.is_master_user());