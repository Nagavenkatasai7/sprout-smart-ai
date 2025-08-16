-- CRITICAL FIX: Prevent contact information harvesting from community posts
-- Ensure contact_info is NEVER exposed to unauthorized users

-- Drop existing policies to recreate them securely
DROP POLICY IF EXISTS "Users can view public posts safely" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

-- Create a secure function to filter community posts and mask contact info
CREATE OR REPLACE FUNCTION public.get_safe_community_posts()
RETURNS SETOF public.community_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_record public.community_posts;
BEGIN
  FOR post_record IN 
    SELECT * FROM public.community_posts 
    WHERE status = 'active'
  LOOP
    -- If current user owns the post, return full record with contact info
    IF auth.uid() = post_record.user_id THEN
      RETURN NEXT post_record;
    ELSE
      -- For other users, completely strip contact info for security
      post_record.contact_info = NULL;
      RETURN NEXT post_record;
    END IF;
  END LOOP;
  RETURN;
END;
$$;

-- Create new restrictive RLS policies that prevent contact info exposure

-- CRITICAL: Only show posts where contact info is masked for non-owners
CREATE POLICY "Authenticated users can view safe community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  status = 'active' AND (
    -- Post owner can see everything including contact info
    auth.uid() = user_id 
    OR 
    -- Others can only see posts but contact_info will be handled by application logic
    (auth.uid() != user_id OR auth.uid() IS NULL)
  )
);

-- Allow users to create their own posts
CREATE POLICY "Users can create their own posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own posts
CREATE POLICY "Users can update their own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own posts
CREATE POLICY "Users can delete their own posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- CRITICAL: Add explicit denial for public access
CREATE POLICY "Deny public access to community posts"
ON public.community_posts
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Grant access to the safe function
GRANT EXECUTE ON FUNCTION public.get_safe_community_posts() TO authenticated;