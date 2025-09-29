-- Add product text background configuration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS product_text_background_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS product_text_background_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS product_text_background_opacity INTEGER DEFAULT 70;