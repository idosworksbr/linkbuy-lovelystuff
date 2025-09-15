-- Update existing users to enable show_all_products_in_feed by default
UPDATE public.profiles 
SET show_all_products_in_feed = true 
WHERE show_all_products_in_feed = false;