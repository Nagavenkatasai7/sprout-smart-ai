-- Fix profiles table RLS policies by removing conflicting rules
-- and ensuring clear, secure access control

-- Drop the confusing "Deny all public access" policy since specific policies handle this better
DROP POLICY IF EXISTS "Deny all public access to profiles" ON public.profiles;

-- Create a clear restrictive policy for unauthenticated users
CREATE POLICY "Block all unauthenticated access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Ensure the authenticated user policies are properly restrictive
-- Update the SELECT policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can only view own profile" ON public.profiles;
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Update INSERT policy for clarity
DROP POLICY IF EXISTS "Authenticated users can only insert own profile" ON public.profiles;
CREATE POLICY "Users can only create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Update UPDATE policy for clarity  
DROP POLICY IF EXISTS "Authenticated users can only update own profile" ON public.profiles;
CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Keep the DELETE restriction as is
-- The "Prevent profile deletion" policy already blocks all deletion attempts