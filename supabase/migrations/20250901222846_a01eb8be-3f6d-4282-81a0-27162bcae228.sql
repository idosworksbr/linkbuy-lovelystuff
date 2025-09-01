-- Clean up and fix user_subscriptions RLS policies properly

-- Remove all existing policies on user_subscriptions
DROP POLICY IF EXISTS "Service can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions only" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;

-- Create secure RLS policies for user_subscriptions
-- Policy 1: Users can only SELECT their own subscriptions
CREATE POLICY "user_can_view_own_subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Service role can manage all operations (for edge functions)
CREATE POLICY "service_role_full_access" 
ON public.user_subscriptions 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');