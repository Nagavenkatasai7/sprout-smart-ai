-- Fix security warnings from the linter

-- Fix 1: Remove SECURITY DEFINER from view and create proper RLS-enforced view
DROP VIEW IF EXISTS public.user_subscription_view;

-- Create a standard view that relies on RLS instead of SECURITY DEFINER
CREATE VIEW public.user_subscription_view AS
SELECT 
  s.user_id,
  s.subscribed,
  s.subscription_tier,
  s.subscription_end,
  s.updated_at
FROM public.subscribers s;

-- The view will be secured by the RLS policies we created
GRANT SELECT ON public.user_subscription_view TO authenticated;

-- Fix 2: Update functions with proper search_path settings
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe()
RETURNS TABLE(
  subscribed boolean,
  subscription_tier text,
  subscription_end timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return subscription status, never expose email or stripe_customer_id
  RETURN QUERY
  SELECT 
    s.subscribed,
    s.subscription_tier,
    s.subscription_end
  FROM public.subscribers s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_email(email_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mask email addresses for logging: user@example.com -> u***@example.com
  IF email_input IS NULL OR email_input = '' THEN
    RETURN '';
  END IF;
  
  RETURN 
    LEFT(email_input, 1) || 
    '***@' || 
    SPLIT_PART(email_input, '@', 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_subscription_secure(
  p_user_id UUID,
  p_email TEXT,
  p_stripe_customer_id TEXT,
  p_subscribed BOOLEAN,
  p_subscription_tier TEXT DEFAULT NULL,
  p_subscription_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  masked_email_val TEXT;
BEGIN
  -- Only allow service role to execute this function
  IF current_setting('role'::text) != 'service_role'::text THEN
    RAISE EXCEPTION 'Access denied: Only service role can update subscriptions';
  END IF;
  
  -- Validate inputs
  IF p_user_id IS NULL OR p_email IS NULL THEN
    RAISE EXCEPTION 'user_id and email are required';
  END IF;
  
  -- Mask email for audit log
  masked_email_val := public.mask_email(p_email);
  
  -- Perform the upsert
  INSERT INTO public.subscribers (
    user_id,
    email,
    stripe_customer_id,
    subscribed,
    subscription_tier,
    subscription_end,
    updated_at
  ) VALUES (
    p_user_id,
    p_email,
    p_stripe_customer_id,
    p_subscribed,
    p_subscription_tier,
    p_subscription_end,
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    subscribed = EXCLUDED.subscribed,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_end = EXCLUDED.subscription_end,
    updated_at = now();
  
  -- Log the change for audit purposes
  INSERT INTO public.subscription_audit_log (
    user_id,
    action_type,
    masked_email,
    change_details,
    created_at
  ) VALUES (
    p_user_id,
    'SUBSCRIPTION_UPDATE',
    masked_email_val,
    jsonb_build_object(
      'subscribed', p_subscribed,
      'subscription_tier', p_subscription_tier,
      'subscription_end', p_subscription_end
    ),
    now()
  );
END;
$$;