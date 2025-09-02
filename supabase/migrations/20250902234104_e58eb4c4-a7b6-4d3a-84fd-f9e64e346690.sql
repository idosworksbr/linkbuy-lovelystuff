-- Add new column to profiles table to control product display in feed
ALTER TABLE public.profiles 
ADD COLUMN show_all_products_in_feed boolean NOT NULL DEFAULT false;