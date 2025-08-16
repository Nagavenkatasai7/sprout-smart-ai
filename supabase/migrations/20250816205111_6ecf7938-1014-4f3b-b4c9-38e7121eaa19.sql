-- Fix the SECURITY DEFINER view issue by removing it and using RLS policies instead
-- Drop the problematic view
DROP VIEW IF EXISTS public.community_posts_public;

-- Revoke the grants that were made
REVOKE SELECT ON public.community_posts_public FROM authenticated, anon;

-- The RLS policies we created are sufficient for security
-- The main table with RLS policies will handle access control properly