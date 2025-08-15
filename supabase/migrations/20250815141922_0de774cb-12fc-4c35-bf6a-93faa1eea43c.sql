-- Fix overly permissive RLS policies on subscribers table
-- The current policies allow any edge function to insert/update any subscription data
-- This creates a security risk for customer email addresses and payment data

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Edge functions can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Edge functions can update subscriptions" ON public.subscribers;

-- Create more secure policies that validate the operation context
-- Only allow inserts/updates when the user_id matches the authenticated user
-- or when called from authorized edge functions with proper validation

CREATE POLICY "Secure subscription insert" ON public.subscribers
FOR INSERT
WITH CHECK (
  -- Allow if the user_id matches the authenticated user
  (auth.uid() = user_id) OR
  -- Allow if called from edge function with service role and email matches auth user
  (current_setting('role') = 'service_role' AND 
   email = (SELECT email FROM auth.users WHERE id = user_id))
);

CREATE POLICY "Secure subscription update" ON public.subscribers
FOR UPDATE
USING (
  -- Allow if the user_id matches the authenticated user
  (auth.uid() = user_id) OR
  -- Allow if called from edge function with service role and updating own record
  (current_setting('role') = 'service_role' AND 
   (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = user_id)))
)
WITH CHECK (
  -- Prevent changing user_id or email to different values
  (auth.uid() = user_id OR 
   (current_setting('role') = 'service_role' AND 
    email = (SELECT email FROM auth.users WHERE id = user_id)))
);

-- Add a policy to prevent unauthorized deletion of subscription data
CREATE POLICY "Prevent subscription deletion" ON public.subscribers
FOR DELETE
USING (false); -- No deletions allowed to preserve audit trail