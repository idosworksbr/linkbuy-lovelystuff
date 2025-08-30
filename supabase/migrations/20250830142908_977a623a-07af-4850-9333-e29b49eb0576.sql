-- Add new personalization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hide_footer boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_type text DEFAULT 'color' CHECK (background_type IN ('color', 'image'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_image_url text;

-- Update catalog_theme to support new themes
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_catalog_theme_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_catalog_theme_check 
  CHECK (catalog_theme IN ('light', 'dark', 'beige', 'rose', 'gold', 'purple', 'mint', 'sunset'));

-- Create custom_links table for personalized links
CREATE TABLE IF NOT EXISTS public.custom_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text, -- Lucide icon name
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on custom_links table
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_links
CREATE POLICY "Users can view their own custom links" 
ON public.custom_links 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert their own custom links" 
ON public.custom_links 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update their own custom links" 
ON public.custom_links 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete their own custom links" 
ON public.custom_links 
FOR DELETE 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create function to update updated_at column for custom_links
CREATE TRIGGER update_custom_links_updated_at
BEFORE UPDATE ON public.custom_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the get_public_store_info function to include new fields
CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
RETURNS TABLE(
  id uuid, 
  store_url text, 
  store_name text, 
  store_description text, 
  profile_photo_url text, 
  background_color text,
  background_type text,
  background_image_url text,
  whatsapp_number numeric, 
  custom_whatsapp_message text, 
  instagram_url text, 
  catalog_theme text, 
  catalog_layout text,
  hide_footer boolean,
  is_verified boolean,
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.store_url,
    p.store_name,
    p.store_description,
    p.profile_photo_url,
    p.background_color,
    p.background_type,
    p.background_image_url,
    p.whatsapp_number,
    p.custom_whatsapp_message,
    p.instagram_url,
    p.catalog_theme,
    p.catalog_layout,
    p.hide_footer,
    p.is_verified,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.store_url = store_url_param;
$function$

-- Create function to get public custom links for a store
CREATE OR REPLACE FUNCTION public.get_public_custom_links(store_url_param text)
RETURNS TABLE(
  id uuid,
  title text,
  url text,
  icon text,
  display_order integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    cl.id,
    cl.title,
    cl.url,
    cl.icon,
    cl.display_order
  FROM public.custom_links cl
  INNER JOIN public.profiles p ON cl.user_id = p.id
  WHERE p.store_url = store_url_param 
    AND cl.is_active = true
  ORDER BY cl.display_order ASC, cl.created_at ASC;
$function$