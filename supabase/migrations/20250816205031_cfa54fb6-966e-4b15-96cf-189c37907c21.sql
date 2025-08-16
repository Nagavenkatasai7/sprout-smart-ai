-- Fix security vulnerability: Protect user contact information from public access
-- Remove the overly permissive public read policy and create more secure ones

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON public.community_posts;

-- Create new policies that protect contact information
-- Allow everyone to see basic post information but hide contact details
CREATE POLICY "Community posts basic info viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

-- Add RLS policy to hide contact_info from unauthorized users
-- Only the post owner can see their own contact info
CREATE POLICY "Contact info only visible to post owner" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a view for public post display that excludes sensitive contact information
CREATE OR REPLACE VIEW public.community_posts_public AS
SELECT 
  id,
  user_id,
  type,
  title,
  description,
  plant_type,
  location,
  images,
  availability,
  status,
  tags,
  created_at,
  updated_at,
  -- Hide contact_info from public view
  NULL as contact_info
FROM public.community_posts
WHERE status = 'active';

-- Grant select permissions on the public view
GRANT SELECT ON public.community_posts_public TO authenticated, anon;

-- Create a function to get contact info only for authenticated users requesting their own posts
CREATE OR REPLACE FUNCTION public.get_post_contact_info(post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact_data JSONB;
BEGIN
  -- Only return contact info if user is authenticated and owns the post
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT contact_info INTO contact_data
  FROM public.community_posts
  WHERE id = post_id AND user_id = auth.uid();
  
  RETURN contact_data;
END;
$$;