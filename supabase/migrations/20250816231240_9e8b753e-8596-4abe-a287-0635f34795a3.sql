-- Create affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_description TEXT,
  affiliate_url TEXT NOT NULL,
  commission_rate NUMERIC,
  category TEXT NOT NULL,
  brand TEXT,
  price_range JSONB,
  image_url TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create partnerships table
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  partnership_type TEXT NOT NULL, -- 'seed_supplier', 'plant_nursery', 'equipment_brand'
  contact_email TEXT NOT NULL,
  contact_person TEXT,
  commission_structure JSONB,
  product_catalog JSONB,
  partnership_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'paused', 'terminated'
  contract_details JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sponsored content table
CREATE TABLE public.sponsored_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sponsor_company TEXT NOT NULL,
  sponsor_logo_url TEXT,
  content_type TEXT NOT NULL, -- 'article', 'video', 'guide', 'tip'
  display_locations TEXT[], -- Where to show: 'homepage', 'plant_guide', 'tips_widget'
  target_audience JSONB, -- Demographics, interests, subscription tiers
  campaign_budget NUMERIC,
  cost_per_view NUMERIC,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  performance_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create virtual workshops table
CREATE TABLE public.virtual_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,
  workshop_type TEXT NOT NULL, -- 'live', 'recorded', 'hybrid'
  skill_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER,
  price NUMERIC NOT NULL,
  subscriber_discount_percent INTEGER DEFAULT 20,
  topics_covered TEXT[],
  materials_needed TEXT[],
  workshop_outline JSONB,
  scheduled_datetime TIMESTAMPTZ,
  zoom_link TEXT,
  recording_url TEXT,
  handout_materials JSONB,
  is_featured BOOLEAN DEFAULT false,
  registration_count INTEGER DEFAULT 0,
  rating_average NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'live', 'completed', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workshop registrations table
CREATE TABLE public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workshop_id UUID REFERENCES public.virtual_workshops(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_amount NUMERIC NOT NULL,
  attended BOOLEAN DEFAULT false,
  completion_certificate_url TEXT,
  rating INTEGER,
  review_text TEXT,
  zapier_webhook_url TEXT, -- For external integrations
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workshop_id)
);

-- Create plant care kits table
CREATE TABLE public.plant_care_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_name TEXT NOT NULL,
  description TEXT NOT NULL,
  kit_type TEXT NOT NULL, -- 'beginner', 'seasonal', 'specialty', 'troubleshoot'
  target_plants TEXT[],
  kit_contents JSONB NOT NULL, -- Array of items with quantities
  retail_price NUMERIC NOT NULL,
  subscriber_price NUMERIC NOT NULL,
  shipping_details JSONB,
  supplier_info JSONB,
  inventory_count INTEGER DEFAULT 0,
  monthly_limit INTEGER, -- Max kits per month for subscribers
  popularity_score INTEGER DEFAULT 0,
  customer_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured_image_url TEXT,
  gallery_images TEXT[],
  care_instructions TEXT,
  video_tutorial_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  seasonal_availability TEXT[], -- Months when available
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create kit subscriptions table
CREATE TABLE public.kit_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kit_id UUID REFERENCES public.plant_care_kits(id) ON DELETE CASCADE NOT NULL,
  subscription_frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'seasonal'
  next_delivery_date DATE,
  delivery_address JSONB NOT NULL,
  subscription_status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  total_deliveries INTEGER DEFAULT 0,
  customization_preferences JSONB,
  feedback_ratings JSONB[],
  zapier_webhook_url TEXT, -- For shipping notifications
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create monetization analytics table
CREATE TABLE public.monetization_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  revenue_source TEXT NOT NULL, -- 'subscriptions', 'affiliates', 'workshops', 'kits', 'sponsored_content'
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  transactions_count INTEGER DEFAULT 0,
  user_engagement_metrics JSONB,
  conversion_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, revenue_source)
);

-- Enable RLS on all tables
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_care_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for affiliate_links (public read)
CREATE POLICY "Affiliate links are viewable by everyone" ON public.affiliate_links
  FOR SELECT USING (is_active = true);

-- Create RLS policies for partnerships (admin only)
CREATE POLICY "Partnerships are admin only" ON public.partnerships
  FOR ALL USING (false); -- Admin management only

-- Create RLS policies for sponsored_content (public read)
CREATE POLICY "Sponsored content is viewable by everyone" ON public.sponsored_content
  FOR SELECT USING (is_active = true AND now() BETWEEN start_date AND COALESCE(end_date, now() + interval '1 year'));

-- Create RLS policies for virtual_workshops (public read)
CREATE POLICY "Workshops are viewable by everyone" ON public.virtual_workshops
  FOR SELECT USING (true);

-- Create RLS policies for workshop_registrations
CREATE POLICY "Users can manage their own workshop registrations" ON public.workshop_registrations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for plant_care_kits (public read)
CREATE POLICY "Plant care kits are viewable by everyone" ON public.plant_care_kits
  FOR SELECT USING (is_available = true);

-- Create RLS policies for kit_subscriptions
CREATE POLICY "Users can manage their own kit subscriptions" ON public.kit_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for monetization_analytics (admin only)
CREATE POLICY "Analytics are admin only" ON public.monetization_analytics
  FOR ALL USING (false); -- Admin analytics only

-- Create updated_at triggers
CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsored_content_updated_at
  BEFORE UPDATE ON public.sponsored_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_workshops_updated_at
  BEFORE UPDATE ON public.virtual_workshops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plant_care_kits_updated_at
  BEFORE UPDATE ON public.plant_care_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kit_subscriptions_updated_at
  BEFORE UPDATE ON public.kit_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();