-- Corrigir RLS policies para afiliados
-- Remover policies existentes e recriar com autenticação correta

-- Dropar policies antigas
DROP POLICY IF EXISTS "Masters can insert affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Masters can update affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Masters can view affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Masters can delete affiliates" ON public.affiliates;

-- Recriar policies com autenticação para usuários autenticados
CREATE POLICY "Masters can insert affiliates"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (is_master_user());

CREATE POLICY "Masters can update affiliates"
ON public.affiliates
FOR UPDATE
TO authenticated
USING (is_master_user());

CREATE POLICY "Masters can view affiliates"
ON public.affiliates
FOR SELECT
TO authenticated
USING (is_master_user());

CREATE POLICY "Masters can delete affiliates"
ON public.affiliates
FOR DELETE
TO authenticated
USING (is_master_user());