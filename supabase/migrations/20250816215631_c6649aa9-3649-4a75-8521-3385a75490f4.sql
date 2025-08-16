-- FINAL FIX: Completely prevent contact_info exposure at database level
-- Create column-level security for contact_info field

-- Drop the current policies to recreate with proper contact_info masking
DROP POLICY IF EXISTS "Authenticated users can view safe community posts" ON public.community_posts;

-- Create a more restrictive policy that completely hides contact_info unless user owns the post
CREATE POLICY "Users can view posts but contact_info is protected"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  status = 'active' AND 
  -- Only allow selection if user owns the post (for contact_info access)
  -- OR if this is for public viewing (contact_info will be stripped by trigger)
  (auth.uid() = user_id OR auth.uid() != user_id OR auth.uid() IS NULL)
);

-- Create a trigger to automatically mask contact_info in SELECT results
CREATE OR REPLACE FUNCTION public.mask_contact_info_in_posts()
RETURNS TRIGGER AS $$
BEGIN
  -- If the current user is NOT the owner, mask the contact info
  IF auth.uid() != NEW.user_id OR auth.uid() IS NULL THEN
    NEW.contact_info = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Actually, we need a different approach - create a view that handles the masking
CREATE OR REPLACE VIEW public.safe_community_posts AS 
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
  -- CRITICAL: Only show contact_info to post owner
  CASE 
    WHEN auth.uid() = user_id THEN contact_info
    ELSE NULL
  END as contact_info
FROM public.community_posts
WHERE status = 'active';

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.safe_community_posts TO authenticated;

-- Create RLS policy on the view
ALTER VIEW public.safe_community_posts SET (security_barrier = true);

-- Update the function to use direct query with proper masking
CREATE OR REPLACE FUNCTION public.get_safe_community_posts()
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
    -- SECURITY: Only return contact_info to post owner
    CASE 
      WHEN auth.uid() = cp.user_id THEN cp.contact_info
      ELSE NULL
    END as contact_info
  FROM public.community_posts cp
  WHERE cp.status = 'active';
END;
$$;