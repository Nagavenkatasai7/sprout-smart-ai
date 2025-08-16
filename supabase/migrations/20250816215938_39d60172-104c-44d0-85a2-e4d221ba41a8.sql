-- Fix policy conflict and ensure contact_info is completely protected

-- Drop ALL existing policies on community_posts to start fresh
DROP POLICY IF EXISTS "Block direct access to community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts through app" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts through app" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts through app" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;  
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Deny public access to community posts" ON public.community_posts;

-- Create new restrictive policies
-- CRITICAL: Block all direct SELECT access to prevent contact_info exposure
CREATE POLICY "Prevent direct select access to community posts"
ON public.community_posts
FOR SELECT
USING (false); -- Completely block direct SELECT access

-- Allow INSERT, UPDATE, DELETE for normal operations
CREATE POLICY "Allow authenticated users to create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Block all public access
CREATE POLICY "Block all public access to community posts"
ON public.community_posts
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Create the secure function (drop existing first to avoid conflicts)
DROP FUNCTION IF EXISTS public.get_community_posts();

CREATE OR REPLACE FUNCTION public.get_community_posts_secure()
RETURNS TABLE(
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
  contact_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    -- ABSOLUTE SECURITY: contact_info is NULL unless user owns the post
    CASE 
      WHEN auth.uid() = cp.user_id THEN cp.contact_info
      ELSE NULL::jsonb
    END as contact_info
  FROM public.community_posts cp
  WHERE cp.status = 'active'
    AND auth.uid() IS NOT NULL; -- Only for authenticated users
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_community_posts_secure() TO authenticated;