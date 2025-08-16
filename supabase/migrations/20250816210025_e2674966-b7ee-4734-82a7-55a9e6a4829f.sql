-- Create achievement system tables

-- Achievement definitions table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  badge_icon text NOT NULL, -- Icon name for the badge
  category text NOT NULL, -- 'milestone', 'streak', 'level', 'program'
  requirement_type text NOT NULL, -- 'plant_count', 'harvest_count', 'streak_days', 'program_completion', 'diagnosis_count'
  requirement_value integer NOT NULL, -- The value needed to unlock
  points integer NOT NULL DEFAULT 0, -- Points awarded for achievement
  rarity text NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  progress jsonb, -- Store progress data for partially completed achievements
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User stats table for tracking various metrics
CREATE TABLE public.user_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  plants_grown integer NOT NULL DEFAULT 0,
  harvests_completed integer NOT NULL DEFAULT 0,
  programs_completed integer NOT NULL DEFAULT 0,
  diagnoses_performed integer NOT NULL DEFAULT 0,
  current_streak_days integer NOT NULL DEFAULT 0,
  best_streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_points integer NOT NULL DEFAULT 0,
  current_level text NOT NULL DEFAULT 'Seedling',
  level_progress integer NOT NULL DEFAULT 0, -- Progress towards next level (0-100)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User certificates table for completed programs
CREATE TABLE public.user_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.growing_programs(id) ON DELETE CASCADE,
  certificate_data jsonb NOT NULL, -- Store certificate details, completion date, etc.
  share_token text UNIQUE, -- Unique token for sharing certificates
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Achievements are viewable by everyone
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- User certificates policies
CREATE POLICY "Users can view their own certificates" 
ON public.user_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Certificates are publicly shareable via token" 
ON public.user_certificates 
FOR SELECT 
USING (share_token IS NOT NULL);

CREATE POLICY "Users can create their own certificates" 
ON public.user_certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_certificates_user_id ON public.user_certificates(user_id);
CREATE INDEX idx_user_certificates_share_token ON public.user_certificates(share_token);

-- Function to update user stats and check for achievements
CREATE OR REPLACE FUNCTION public.update_user_stats_and_achievements(
  user_id_param uuid,
  stat_type text,
  increment_value integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stats jsonb;
  new_achievements uuid[];
  result jsonb;
BEGIN
  -- Initialize user stats if not exists
  INSERT INTO public.user_stats (user_id) 
  VALUES (user_id_param) 
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update stats based on type
  CASE stat_type
    WHEN 'plant_grown' THEN
      UPDATE public.user_stats 
      SET plants_grown = plants_grown + increment_value,
          total_points = total_points + (increment_value * 10),
          updated_at = now()
      WHERE user_id = user_id_param;
      
    WHEN 'harvest_completed' THEN
      UPDATE public.user_stats 
      SET harvests_completed = harvests_completed + increment_value,
          total_points = total_points + (increment_value * 25),
          updated_at = now()
      WHERE user_id = user_id_param;
      
    WHEN 'program_completed' THEN
      UPDATE public.user_stats 
      SET programs_completed = programs_completed + increment_value,
          total_points = total_points + (increment_value * 100),
          updated_at = now()
      WHERE user_id = user_id_param;
      
    WHEN 'diagnosis_performed' THEN
      UPDATE public.user_stats 
      SET diagnoses_performed = diagnoses_performed + increment_value,
          total_points = total_points + (increment_value * 15),
          updated_at = now()
      WHERE user_id = user_id_param;
      
    WHEN 'daily_activity' THEN
      -- Update streak logic
      UPDATE public.user_stats 
      SET current_streak_days = CASE 
        WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
        WHEN last_activity_date = CURRENT_DATE THEN current_streak_days
        ELSE 1
      END,
      best_streak_days = GREATEST(best_streak_days, 
        CASE 
          WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
          WHEN last_activity_date = CURRENT_DATE THEN current_streak_days
          ELSE 1
        END
      ),
      last_activity_date = CURRENT_DATE,
      total_points = total_points + 5,
      updated_at = now()
      WHERE user_id = user_id_param;
  END CASE;
  
  -- Get updated stats
  SELECT row_to_json(us.*) INTO current_stats
  FROM public.user_stats us 
  WHERE us.user_id = user_id_param;
  
  -- Check for new achievements (simplified logic)
  -- This would typically be more complex with proper achievement checking
  
  RETURN jsonb_build_object(
    'stats', current_stats,
    'new_achievements', new_achievements
  );
END;
$$;

-- Insert initial achievements
INSERT INTO public.achievements (name, description, badge_icon, category, requirement_type, requirement_value, points, rarity) VALUES
('First Steps', 'Welcome to your gardening journey!', 'seedling', 'milestone', 'plant_count', 1, 10, 'common'),
('Green Thumb', 'Successfully grow 5 plants', 'leaf', 'milestone', 'plant_count', 5, 50, 'common'),
('Plant Parent Pro', 'Successfully grow 25 plants', 'tree', 'milestone', 'plant_count', 25, 250, 'rare'),
('Master Gardener', 'Successfully grow 100 plants', 'crown', 'milestone', 'plant_count', 100, 1000, 'legendary'),
('First Harvest', 'Complete your first harvest', 'harvest', 'milestone', 'harvest_count', 1, 25, 'common'),
('Bountiful Harvest', 'Complete 10 harvests', 'basket', 'milestone', 'harvest_count', 10, 150, 'rare'),
('Dedicated Gardener', 'Maintain a 7-day care streak', 'calendar', 'streak', 'streak_days', 7, 75, 'common'),
('Consistent Caretaker', 'Maintain a 30-day care streak', 'fire', 'streak', 'streak_days', 30, 300, 'rare'),
('Gardening Legend', 'Maintain a 100-day care streak', 'star', 'streak', 'streak_days', 100, 1000, 'epic'),
('Program Graduate', 'Complete your first growing program', 'graduation-cap', 'program', 'program_completion', 1, 100, 'common'),
('Knowledge Seeker', 'Complete 5 growing programs', 'book', 'program', 'program_completion', 5, 500, 'rare'),
('Plant Doctor', 'Perform 10 plant diagnoses', 'stethoscope', 'milestone', 'diagnosis_count', 10, 100, 'common'),
('Expert Diagnostician', 'Perform 50 plant diagnoses', 'microscope', 'milestone', 'diagnosis_count', 50, 500, 'epic');