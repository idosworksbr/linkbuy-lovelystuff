-- Create masters table for admin authentication
CREATE TABLE public.masters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for masters table
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;

-- Create policy for masters to access their own data
CREATE POLICY "Masters can access their own data" 
ON public.masters 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create catalog_leads table for lead capture
CREATE TABLE public.catalog_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_button TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT
);

-- Enable RLS for catalog_leads table
ALTER TABLE public.catalog_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for store owners to view their leads
CREATE POLICY "Store owners can view their leads" 
ON public.catalog_leads 
FOR SELECT 
USING (store_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE auth.uid() = profiles.id
));

-- Create policy for service role to insert leads
CREATE POLICY "Service role can insert leads" 
ON public.catalog_leads 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create trigger for updated_at on masters
CREATE TRIGGER update_masters_updated_at
BEFORE UPDATE ON public.masters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();