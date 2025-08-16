-- CRITICAL FIX: Completely secure the profiles table against email address theft
-- Replace permissive policies with restrictive ones and ensure no public access

-- First, disable RLS temporarily to recreate all policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Re-enable RLS 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RESTRICTIVE policies that explicitly deny unauthorized access
-- This ensures NO public access is possible

-- CRITICAL: Only authenticated users can view their OWN profile
CREATE POLICY "Authenticated users can only view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- CRITICAL: Only authenticated users can insert their OWN profile  
CREATE POLICY "Authenticated users can only insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- CRITICAL: Only authenticated users can update their OWN profile
CREATE POLICY "Authenticated users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- CRITICAL: Completely prevent deletes for data integrity
CREATE POLICY "Prevent profile deletion"
ON public.profiles
FOR DELETE
USING (false);

-- Add an additional policy to explicitly deny public access (belt and suspenders)
CREATE POLICY "Deny all public access to profiles"
ON public.profiles
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Create a view for safe profile access (without email exposure)
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at,
  -- Mask email addresses for security
  CASE 
    WHEN auth.uid() = user_id THEN email
    ELSE public.mask_sensitive_data('email', email)
  END as email
FROM public.profiles
WHERE auth.uid() = user_id; -- Only show own profile

-- Grant access to the safe view
GRANT SELECT ON public.safe_profiles TO authenticated;