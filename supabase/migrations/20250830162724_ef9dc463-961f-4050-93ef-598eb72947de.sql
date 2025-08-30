-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'pro_plus', 'verified', 'pro_plus_verified');

-- Add subscription fields to profiles table (is_verified already exists)
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan public.subscription_plan DEFAULT 'free',
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles to have free plan
UPDATE public.profiles SET subscription_plan = 'free' WHERE subscription_plan IS NULL;