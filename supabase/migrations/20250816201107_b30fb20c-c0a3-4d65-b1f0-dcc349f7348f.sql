-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_id_param UUID,
  activity_type_param TEXT,
  entity_type_param TEXT DEFAULT NULL,
  entity_id_param UUID DEFAULT NULL,
  activity_data_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    activity_data
  ) VALUES (
    user_id_param,
    activity_type_param,
    entity_type_param,
    entity_id_param,
    activity_data_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;