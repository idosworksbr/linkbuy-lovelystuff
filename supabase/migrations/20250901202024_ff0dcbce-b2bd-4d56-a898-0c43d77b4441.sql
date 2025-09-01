-- Fix security vulnerability in subscribers table
-- Replace the overly permissive INSERT policy with a secure one

-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create a secure INSERT policy that only allows authenticated users to insert their own subscription records
CREATE POLICY "authenticated_users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also update the UPDATE policy to be more restrictive
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "users_can_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING ((user_id = auth.uid()) OR (email = auth.email()))
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));