-- Fix critical security issues that break core functionality

-- 1. Fix subscribers table - Remove email-based access (security risk)
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure policies for subscribers table
CREATE POLICY "users_can_view_own_subscription_only" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "service_role_manages_subscriptions" 
ON public.subscribers 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. Add public read access for store catalogs (profiles)
CREATE POLICY "public_can_view_store_profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 3. Add public read access for products (catalog functionality)
CREATE POLICY "public_can_view_products" 
ON public.products 
FOR SELECT 
USING (true);

-- 4. Add public read access for custom links (store functionality)
CREATE POLICY "public_can_view_custom_links" 
ON public.custom_links 
FOR SELECT 
USING (true);