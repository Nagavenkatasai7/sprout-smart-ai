-- Create plant wishlist table
CREATE TABLE public.plant_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  scientific_name TEXT,
  notes TEXT,
  priority INTEGER DEFAULT 1,
  image_url TEXT,
  care_difficulty TEXT,
  estimated_cost NUMERIC,
  where_to_buy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user transformations table for before/after gallery
CREATE TABLE public.user_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  plant_type TEXT,
  transformation_period INTEGER, -- days
  tips_used TEXT[],
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create daily tips table
CREATE TABLE public.daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  season TEXT,
  plant_types TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create propagation guides table
CREATE TABLE public.propagation_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL,
  scientific_name TEXT,
  propagation_method TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  time_to_propagate TEXT,
  success_rate INTEGER,
  best_season TEXT,
  materials_needed TEXT[],
  step_by_step_guide JSONB NOT NULL,
  tips TEXT[],
  common_mistakes TEXT[],
  image_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create seasonal planting calendar table
CREATE TABLE public.seasonal_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL,
  scientific_name TEXT,
  plant_type TEXT NOT NULL,
  planting_month INTEGER NOT NULL, -- 1-12
  harvesting_month INTEGER,
  region TEXT,
  climate_zone TEXT,
  indoor_outdoor TEXT DEFAULT 'both',
  care_difficulty TEXT DEFAULT 'medium',
  planting_tips TEXT[],
  care_instructions TEXT[],
  companion_plants TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plant_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propagation_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_plants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plant_wishlists
CREATE POLICY "Users can manage their own wishlists" ON public.plant_wishlists
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_transformations
CREATE POLICY "Users can create their own transformations" ON public.user_transformations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transformations" ON public.user_transformations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transformations" ON public.user_transformations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "All users can view transformations" ON public.user_transformations
  FOR SELECT USING (true);

-- Create RLS policies for daily_tips (read-only for users)
CREATE POLICY "Tips are viewable by everyone" ON public.daily_tips
  FOR SELECT USING (is_active = true);

-- Create RLS policies for propagation_guides (read-only for users)
CREATE POLICY "Propagation guides are viewable by everyone" ON public.propagation_guides
  FOR SELECT USING (true);

-- Create RLS policies for seasonal_plants (read-only for users)
CREATE POLICY "Seasonal plants are viewable by everyone" ON public.seasonal_plants
  FOR SELECT USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_plant_wishlists_updated_at
  BEFORE UPDATE ON public.plant_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_transformations_updated_at
  BEFORE UPDATE ON public.user_transformations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propagation_guides_updated_at
  BEFORE UPDATE ON public.propagation_guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();