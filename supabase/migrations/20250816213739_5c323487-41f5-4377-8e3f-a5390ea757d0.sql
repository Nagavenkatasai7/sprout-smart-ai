-- Fix critical security issue: Make user_id non-nullable and add proper constraints
-- This prevents RLS policy failures that could expose email addresses

-- First, update any existing profiles that might have null user_id
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Make user_id NOT NULL to ensure RLS policies work correctly
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add a foreign key constraint to ensure data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more secure RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update the handle_new_user function to ensure user_id is properly set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username, full_name)
  VALUES (
    NEW.id,  -- Use the auth user's ID as user_id
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substring(NEW.id::text from 1 for 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;