-- Create table for plant calendar tasks
CREATE TABLE IF NOT EXISTS public.plant_calendar_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  scheduled_time TIME,
  priority TEXT NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  task_date DATE NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plant_calendar_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for plant_calendar_tasks
CREATE POLICY "Users can view their own tasks" 
ON public.plant_calendar_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.plant_calendar_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.plant_calendar_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.plant_calendar_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_plant_calendar_tasks_updated_at
BEFORE UPDATE ON public.plant_calendar_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for user locations and preferences
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  formatted_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_current BOOLEAN NOT NULL DEFAULT true,
  weather_data JSONB,
  last_weather_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_locations
CREATE POLICY "Users can manage their own locations" 
ON public.user_locations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_plant_calendar_tasks_user_date ON public.plant_calendar_tasks(user_id, task_date);
CREATE INDEX idx_plant_calendar_tasks_completed ON public.plant_calendar_tasks(completed, task_date);
CREATE INDEX idx_user_locations_user_current ON public.user_locations(user_id, is_current);