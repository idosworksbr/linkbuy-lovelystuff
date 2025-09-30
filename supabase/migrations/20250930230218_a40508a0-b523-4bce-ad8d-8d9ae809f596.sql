-- Drop the insecure public policy on masters table
DROP POLICY IF EXISTS "Masters can access their own data" ON public.masters;

-- Create secure policy that restricts access to service_role only
-- This ensures only edge functions (not frontend clients) can access admin credentials
CREATE POLICY "Only service role can access masters"
  ON public.masters
  FOR ALL
  USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
  );

-- Add comment explaining the security restriction
COMMENT ON POLICY "Only service role can access masters" ON public.masters IS 
  'Restricts access to admin credentials to service_role only. This prevents hackers from reading admin emails and password hashes through the public API.';
