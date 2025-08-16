-- Create user preferences table for dashboard and sidebar settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  dashboard_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  notification_settings JSONB NOT NULL DEFAULT '{
    "care_reminders": true,
    "social_notifications": true,
    "achievement_notifications": true,
    "community_updates": true,
    "email_notifications": false
  }'::jsonb,
  theme_preference TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create dashboard widgets table
CREATE TABLE public.dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  widget_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own widgets" 
ON public.dashboard_widgets 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Extend plants table with health tracking
ALTER TABLE public.plants 
ADD COLUMN health_status TEXT DEFAULT 'healthy',
ADD COLUMN last_watered DATE,
ADD COLUMN last_fertilized DATE,
ADD COLUMN growth_stage TEXT DEFAULT 'seedling',
ADD COLUMN notes TEXT,
ADD COLUMN is_favorite BOOLEAN DEFAULT false,
ADD COLUMN collection_name TEXT;

-- Create plant photos timeline table
CREATE TABLE public.plant_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  growth_milestone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own plant photos" 
ON public.plant_photos 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create user follows table for social features
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own follows" 
ON public.user_follows 
FOR ALL 
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Follow relationships are viewable by involved users" 
ON public.user_follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Create post interactions table
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share')),
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Enable RLS
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own interactions" 
ON public.post_interactions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Interactions are viewable by everyone" 
ON public.post_interactions 
FOR SELECT 
USING (true);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create search suggestions table
CREATE TABLE public.search_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_type TEXT NOT NULL,
  result_id UUID,
  search_count INTEGER NOT NULL DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own search suggestions" 
ON public.search_suggestions 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
BEFORE UPDATE ON public.dashboard_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_dashboard_widgets_user_id ON public.dashboard_widgets(user_id);
CREATE INDEX idx_plant_photos_plant_id ON public.plant_photos(plant_id);
CREATE INDEX idx_plant_photos_user_id ON public.plant_photos(user_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_post_interactions_post ON public.post_interactions(post_id);
CREATE INDEX idx_post_interactions_user ON public.post_interactions(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_search_suggestions_query ON public.search_suggestions(query);
CREATE INDEX idx_plants_user_collection ON public.plants(user_id, collection_name);
CREATE INDEX idx_plants_health_status ON public.plants(health_status);

-- Add full-text search capabilities
CREATE INDEX idx_plants_search ON public.plants USING gin(to_tsvector('english', plant_name || ' ' || COALESCE(scientific_name, '')));
CREATE INDEX idx_community_posts_search ON public.community_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_daily_tips_search ON public.daily_tips USING gin(to_tsvector('english', title || ' ' || content));