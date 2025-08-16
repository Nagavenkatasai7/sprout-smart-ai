-- Fix contact_info exposure by dropping and recreating the function properly

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_safe_community_posts();

-- Remove the problematic view
DROP VIEW IF EXISTS public.safe_community_posts;

-- Remove the trigger function we don't need
DROP FUNCTION IF EXISTS public.mask_contact_info_in_posts();

-- Create the proper secure function with correct return type
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
    -- CRITICAL SECURITY FIX: Only return contact_info to post owner
    CASE 
      WHEN auth.uid() = cp.user_id THEN cp.contact_info
      ELSE NULL::jsonb
    END as contact_info
  FROM public.community_posts cp
  WHERE cp.status = 'active';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_community_posts() TO authenticated;

-- Also ensure the existing get_post_contact_info function is secure
CREATE OR REPLACE FUNCTION public.get_post_contact_info(post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_data JSONB;
  post_owner_id UUID;
BEGIN
  -- Only return contact info if user is authenticated and owns the post
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the post owner
  SELECT user_id INTO post_owner_id
  FROM public.community_posts
  WHERE id = post_id;
  
  -- Only return contact info if current user owns the post
  IF auth.uid() = post_owner_id THEN
    SELECT contact_info INTO contact_data
    FROM public.community_posts
    WHERE id = post_id;
    
    RETURN contact_data;
  END IF;
  
  -- Return null for non-owners
  RETURN NULL;
END;
$$;