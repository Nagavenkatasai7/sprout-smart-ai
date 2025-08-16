-- Fix critical security issue: Make user_id non-nullable in profiles table
-- This prevents RLS policy failures that could expose email addresses

-- First, update any existing profiles that might have null user_id
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Make user_id NOT NULL to ensure RLS policies work correctly
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create secure RLS policies that prevent public access to email addresses
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled (should already be, but confirming)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;