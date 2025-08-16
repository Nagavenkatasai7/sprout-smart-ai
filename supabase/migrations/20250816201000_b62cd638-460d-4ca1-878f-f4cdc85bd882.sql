-- Create growing programs table
CREATE TABLE public.growing_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('challenge', 'tutorial', 'guide', 'tracking')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_days INTEGER,
  steps JSONB,
  video_urls JSONB,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'year-round')),
  plant_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user program progress table
CREATE TABLE public.user_program_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.growing_programs(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes JSONB,
  photos JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plant diagnoses table
CREATE TABLE public.plant_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plant_id UUID REFERENCES public.plants(id),
  symptoms TEXT[] NOT NULL,
  image_urls TEXT[],
  diagnosis_type TEXT CHECK (diagnosis_type IN ('disease', 'pest', 'deficiency', 'environmental')),
  identified_issue TEXT,
  treatment_plan JSONB,
  prevention_tips TEXT[],
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community marketplace table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('seed_swap', 'cutting_exchange', 'meetup', 'vendor_recommendation')),
  title TEXT NOT NULL,
  description TEXT,
  plant_type TEXT,
  location TEXT,
  images TEXT[],
  contact_info JSONB,
  availability JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user reviews table
CREATE TABLE public.user_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reviewed_entity_type TEXT NOT NULL CHECK (reviewed_entity_type IN ('nursery', 'vendor', 'user', 'program')),
  reviewed_entity_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images TEXT[],
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comprehensive activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.growing_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for growing_programs (public read)
CREATE POLICY "Programs are viewable by everyone" 
ON public.growing_programs 
FOR SELECT 
USING (true);

-- RLS policies for user_program_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_program_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.user_program_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_program_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for plant_diagnoses
CREATE POLICY "Users can view their own diagnoses" 
ON public.plant_diagnoses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnoses" 
ON public.plant_diagnoses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnoses" 
ON public.plant_diagnoses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagnoses" 
ON public.plant_diagnoses 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for community_posts
CREATE POLICY "Community posts are viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.user_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.user_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.user_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.user_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_program_progress_user_id ON public.user_program_progress(user_id);
CREATE INDEX idx_user_program_progress_program_id ON public.user_program_progress(program_id);
CREATE INDEX idx_plant_diagnoses_user_id ON public.plant_diagnoses(user_id);
CREATE INDEX idx_plant_diagnoses_plant_id ON public.plant_diagnoses(plant_id);
CREATE INDEX idx_community_posts_type ON public.community_posts(type);
CREATE INDEX idx_community_posts_location ON public.community_posts(location);
CREATE INDEX idx_user_reviews_entity ON public.user_reviews(reviewed_entity_type, reviewed_entity_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_growing_programs_updated_at
BEFORE UPDATE ON public.growing_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_program_progress_updated_at
BEFORE UPDATE ON public.user_program_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plant_diagnoses_updated_at
BEFORE UPDATE ON public.plant_diagnoses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample growing programs
INSERT INTO public.growing_programs (title, description, type, difficulty_level, duration_days, steps, plant_types, season) VALUES
('30-Day Herb Garden Challenge', 'Perfect for beginners! Start your herb garden journey with easy-to-grow herbs', 'challenge', 'beginner', 30, 
'[
  {"day": 1, "title": "Choose Your Herbs", "description": "Select 3-5 beginner-friendly herbs like basil, cilantro, and parsley"},
  {"day": 3, "title": "Prepare Growing Space", "description": "Set up containers or garden bed with proper drainage"},
  {"day": 5, "title": "Plant Seeds or Seedlings", "description": "Follow spacing guidelines for each herb type"},
  {"day": 10, "title": "First Care Check", "description": "Monitor growth, adjust watering schedule"},
  {"day": 20, "title": "First Harvest", "description": "Learn proper harvesting techniques"},
  {"day": 30, "title": "Celebration & Planning", "description": "Enjoy your fresh herbs and plan next steps"}
]'::jsonb, 
'{"basil", "cilantro", "parsley", "chives", "mint"}', 'year-round'),

('Tomato From Seed to Harvest', 'Complete guide to growing tomatoes from seed to plate', 'tracking', 'intermediate', 120,
'[
  {"week": 1, "title": "Seed Starting", "description": "Start tomato seeds indoors 6-8 weeks before last frost"},
  {"week": 4, "title": "Transplant to Larger Pots", "description": "Move seedlings to 4-inch pots"},
  {"week": 8, "title": "Harden Off", "description": "Gradually expose plants to outdoor conditions"},
  {"week": 10, "title": "Plant Outdoors", "description": "Transplant to garden after last frost"},
  {"week": 16, "title": "First Flowers", "description": "Support plants and monitor for fruit development"},
  {"week": 20, "title": "Harvest Time", "description": "Pick ripe tomatoes and preserve extras"}
]'::jsonb,
'{"tomatoes"}', 'spring'),

('Winter Indoor Vegetable Garden', 'Grow fresh vegetables indoors during winter months', 'guide', 'intermediate', 90,
'[
  {"step": 1, "title": "Choose Winter Varieties", "description": "Select cold-tolerant and indoor-friendly vegetables"},
  {"step": 2, "title": "Set Up Grow Lights", "description": "Install full-spectrum LED lights for optimal growth"},
  {"step": 3, "title": "Container Selection", "description": "Choose appropriate sized containers for each vegetable"},
  {"step": 4, "title": "Planting Schedule", "description": "Stagger plantings for continuous harvest"},
  {"step": 5, "title": "Maintenance Routine", "description": "Establish daily and weekly care routines"}
]'::jsonb,
'{"lettuce", "spinach", "kale", "radishes", "microgreens"}', 'winter');

-- Function to log user activities
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