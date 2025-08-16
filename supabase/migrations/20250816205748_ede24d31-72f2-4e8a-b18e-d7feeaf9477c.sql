-- Fix the RLS policy issue by implementing proper column-level security
-- The current setup has two permissive SELECT policies which means PostgreSQL grants access if EITHER allows it
-- We need to restructure this to properly protect the contact_info column

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Community posts basic info viewable by everyone" ON public.community_posts;
DROP POLICY IF EXISTS "Contact info only visible to post owner" ON public.community_posts;

-- Create a single, comprehensive SELECT policy that handles both cases
-- This policy allows public access to most fields but restricts contact_info to owners only
CREATE POLICY "Secure community posts access" 
ON public.community_posts 
FOR SELECT 
USING (
  -- Allow access to all fields EXCEPT contact_info for everyone
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Post owners can see everything including contact_info
    ELSE contact_info IS NULL OR contact_info = '{}'::jsonb OR contact_info = 'null'::jsonb  -- Others can only see posts where contact_info is empty/null
  END
);

-- Alternative approach: Create a function that returns sanitized post data
CREATE OR REPLACE FUNCTION public.get_community_posts_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type text,
  title text,
  description text,
  plant_type text,
  location text,
  images text[],
  availability jsonb,
  status text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  contact_info jsonb  -- Will be null unless user owns the post
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.user_id,
    cp.type,
    cp.title,
    cp.description,
    cp.plant_type,
    cp.location,
    cp.images,
    cp.availability,
    cp.status,
    cp.tags,
    cp.created_at,
    cp.updated_at,
    CASE 
      WHEN auth.uid() = cp.user_id THEN cp.contact_info
      ELSE NULL
    END as contact_info
  FROM public.community_posts cp
  WHERE cp.status = 'active';
END;
$$;