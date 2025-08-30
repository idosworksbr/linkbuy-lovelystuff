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