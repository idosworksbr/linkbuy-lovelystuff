-- Create lead capture settings table
CREATE TABLE IF NOT EXISTS public.lead_capture_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  whatsapp_feed_enabled boolean NOT NULL DEFAULT true,
  whatsapp_product_enabled boolean NOT NULL DEFAULT true,
  instagram_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_capture_settings_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.lead_capture_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lead capture settings"
ON public.lead_capture_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead capture settings"
ON public.lead_capture_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead capture settings"
ON public.lead_capture_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_lead_capture_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_lead_capture_settings_updated_at
BEFORE UPDATE ON public.lead_capture_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_capture_settings_updated_at();