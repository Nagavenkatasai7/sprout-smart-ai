-- Add username column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Update existing profiles with auto-generated usernames
UPDATE public.profiles 
SET username = 'user_' || substring(id::text from 1 for 8) 
WHERE username IS NULL;

-- Make username NOT NULL after updating existing records
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;