-- CRITICAL SECURITY FIXES FOR SUBSCRIBERS TABLE
-- This migration addresses customer data protection vulnerabilities

-- Step 1: Create a secure function to safely retrieve user subscription data
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe()
RETURNS TABLE(
  subscribed boolean,
  subscription_tier text,
  subscription_end timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Step 2: Create a function to mask sensitive data for logging/debugging
CREATE OR REPLACE FUNCTION public.mask_email(email_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Step 3: Create audit log table for subscription changes
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  masked_email TEXT, -- Store masked email for audit purposes
  change_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role and user can view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.subscription_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Step 4: Completely replace existing RLS policies with bulletproof ones
DROP POLICY IF EXISTS "Users can view only their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Only service role can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Only service role can update subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Prevent subscription deletion completely" ON public.subscribers;

-- BULLETPROOF RLS POLICIES

-- 1. Absolutely block all direct SELECT access to subscribers table
CREATE POLICY "Block all direct SELECT access to subscribers" 
ON public.subscribers 
FOR SELECT 
USING (false);

-- 2. Only service role can INSERT (for edge functions)
CREATE POLICY "Only service role can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text
);

-- 3. Only service role can UPDATE (for edge functions)  
CREATE POLICY "Only service role can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- 4. Absolutely prevent any deletion
CREATE POLICY "Prevent all subscription deletion" 
ON public.subscribers 
FOR DELETE 
USING (false);

-- Step 5: Create a secure view that exposes only safe data
CREATE OR REPLACE VIEW public.user_subscription_view AS
SELECT 
  s.user_id,
  s.subscribed,
  s.subscription_tier,
  s.subscription_end,
  s.updated_at
FROM public.subscribers s
WHERE s.user_id = auth.uid();

-- Grant access to the safe view
GRANT SELECT ON public.user_subscription_view TO authenticated;

-- Step 6: Create secure function for edge functions to safely update subscriptions
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
SET search_path = public
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

-- Step 7: Create indexes for performance on the audit log
CREATE INDEX idx_subscription_audit_user_id ON public.subscription_audit_log(user_id);
CREATE INDEX idx_subscription_audit_created_at ON public.subscription_audit_log(created_at);

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_subscription_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_subscription_secure(UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMP WITH TIME ZONE) TO service_role;
GRANT SELECT ON public.subscription_audit_log TO authenticated;

-- Step 9: Add comments for documentation
COMMENT ON TABLE public.subscribers IS 'Stores subscription data - SECURITY CRITICAL: Only accessible via secure functions';
COMMENT ON TABLE public.subscription_audit_log IS 'Audit trail for subscription changes with masked PII';
COMMENT ON FUNCTION public.get_user_subscription_safe() IS 'Safe function to retrieve user subscription without exposing sensitive data';
COMMENT ON FUNCTION public.upsert_subscription_secure(UUID, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMP WITH TIME ZONE) IS 'Secure upsert function for service role only';
COMMENT ON VIEW public.user_subscription_view IS 'Safe view exposing only non-sensitive subscription data to authenticated users';