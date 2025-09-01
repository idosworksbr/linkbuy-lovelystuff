-- Fix security issue: Allow public access to view store catalogs and products
-- This is essential for e-commerce functionality where customers need to browse stores

-- Add public SELECT policy for profiles table to allow customers to view store information
CREATE POLICY "Public users can view store profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (true);

-- Add public SELECT policy for products table to allow customers to view products
CREATE POLICY "Public users can view products" 
ON public.products 
FOR SELECT 
TO public
USING (true);