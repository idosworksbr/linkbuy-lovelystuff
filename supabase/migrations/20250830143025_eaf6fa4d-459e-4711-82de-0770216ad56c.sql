-- Add new personalization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hide_footer boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_type text DEFAULT 'color' CHECK (background_type IN ('color', 'image'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_image_url text;