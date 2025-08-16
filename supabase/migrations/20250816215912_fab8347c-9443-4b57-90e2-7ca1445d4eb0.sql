-- ULTIMATE FIX: Completely prevent direct access to contact_info in community_posts
-- Force all access through secure functions only

-- Drop existing SELECT policy and create a completely restrictive one
DROP POLICY IF EXISTS "Users can view posts but contact_info is protected" ON public.community_posts;

-- Create a policy that completely prevents SELECT access to contact_info
-- Users must use the secure function instead
CREATE POLICY "Block direct access to community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (false);  -- Block all direct SELECT access

-- Allow access only through our secure functions by creating a special role
-- Create policies for INSERT, UPDATE, DELETE that still work
CREATE POLICY "Users can create posts through app"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts through app"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts through app"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create a completely new approach: Use a secure function for ALL community post access
-- This function will be the ONLY way to access community posts data
CREATE OR REPLACE FUNCTION public.get_community_posts()
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
  -- contact_info is completely hidden unless you own the post
  contact_info jsonb,
  -- Add a flag to indicate if user can see contact info
  can_view_contact boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only authenticated users can access this function
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

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
    -- SECURITY: contact_info is NULL unless user owns the post
    CASE 
      WHEN auth.uid() = cp.user_id THEN cp.contact_info
      ELSE NULL::jsonb
    END as contact_info,
    -- Flag to indicate if user can see contact info
    (auth.uid() = cp.user_id) as can_view_contact
  FROM public.community_posts cp
  WHERE cp.status = 'active';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_community_posts() TO authenticated;

-- Revoke direct table access and force function usage
REVOKE SELECT ON public.community_posts FROM authenticated;
GRANT SELECT ON public.community_posts TO service_role;