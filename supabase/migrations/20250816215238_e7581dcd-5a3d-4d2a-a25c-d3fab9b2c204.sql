-- Fix the view security issue by removing the problematic view
-- and ensuring profiles table is completely secured

-- Remove the view that was causing security warnings
DROP VIEW IF EXISTS public.safe_profiles;

-- Verify RLS is enabled and policies are active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Double-check that our restrictive policies are working
-- by testing the policy structure is correct
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';