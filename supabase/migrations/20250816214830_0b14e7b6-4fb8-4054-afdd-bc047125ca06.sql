-- Fix function search path security warnings
-- Set search_path for security definer functions to prevent SQL injection

-- Fix the get_safe_community_post function
CREATE OR REPLACE FUNCTION public.get_safe_community_post(post_record public.community_posts)
RETURNS public.community_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If the current user owns the post, return full record
  IF auth.uid() = post_record.user_id THEN
    RETURN post_record;
  END IF;
  
  -- For other users, strip contact info
  post_record.contact_info = NULL;
  RETURN post_record;
END;
$$;

-- Fix the mask_sensitive_data function
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data_type text, original_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  CASE data_type
    WHEN 'email' THEN
      -- Mask email addresses except for first 2 chars
      RETURN CONCAT(
        LEFT(original_value, 2), 
        '***@',
        SPLIT_PART(original_value, '@', 2)
      );
    WHEN 'ip' THEN
      -- Mask IP addresses
      RETURN '***.***.***.' || SPLIT_PART(original_value, '.', 4);
    ELSE
      RETURN '***MASKED***';
  END CASE;
END;
$$;