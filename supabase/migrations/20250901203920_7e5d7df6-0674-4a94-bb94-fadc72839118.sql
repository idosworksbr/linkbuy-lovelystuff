-- Fix critical security issue: Remove public access to sensitive personal data in profiles table
-- The previous policy exposed all profile data including phone numbers, names, subscription details

-- Drop the overly permissive public SELECT policy that exposes sensitive data
DROP POLICY IF EXISTS "Public users can view store profiles" ON public.profiles;

-- Keep the existing secure policy that only allows users to view their own profiles
-- Public store information is already handled securely through the get_public_store_info() function
-- which only exposes store-related data, not personal information

-- Verify that users can still view their own profiles (this policy should already exist)
-- This ensures authenticated users can access their own data while protecting privacy