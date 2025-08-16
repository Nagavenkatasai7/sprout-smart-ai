-- Create Shopping Assistant tables

-- Products table for garden supplies
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL, -- 'soil', 'fertilizer', 'tools', 'pots', 'seeds'
  subcategory text,
  description text,
  brand text,
  price_range jsonb, -- {min: number, max: number}
  specifications jsonb, -- product-specific data
  image_url text,
  affiliate_links jsonb, -- {store_name: url}
  rating numeric(3,2),
  review_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User shopping lists
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of {product_id, quantity, notes, purchased}
  total_estimated_cost numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Soil calculator results
CREATE TABLE public.soil_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  pot_dimensions jsonb NOT NULL, -- {length, width, height, shape}
  soil_volume_liters numeric(10,2) NOT NULL,
  soil_mix_recommendations jsonb, -- recommended soil types and ratios
  estimated_cost numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Regional Intelligence tables

-- Regions table
CREATE TABLE public.regions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  state_province text,
  hardiness_zones text[], -- USDA hardiness zones
  climate_data jsonb, -- temperature ranges, rainfall, seasons
  coordinates jsonb, -- {lat, lng}
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Native plants database
CREATE TABLE public.native_plants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  plant_name text NOT NULL,
  scientific_name text NOT NULL,
  plant_type text NOT NULL, -- 'tree', 'shrub', 'perennial', 'annual', 'grass'
  bloom_time text,
  mature_size jsonb, -- {height, width}
  growing_conditions jsonb, -- {sun, water, soil_type}
  benefits text[], -- wildlife, erosion control, etc.
  care_instructions text,
  image_url text,
  endangered_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invasive species warnings
CREATE TABLE public.invasive_species (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  species_name text NOT NULL,
  scientific_name text NOT NULL,
  threat_level text NOT NULL, -- 'low', 'medium', 'high', 'severe'
  description text NOT NULL,
  identification_tips text[],
  control_methods text[],
  reporting_info jsonb, -- contact information for reporting
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Local nurseries
CREATE TABLE public.nurseries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  website text,
  email text,
  specialties text[], -- organic, native plants, vegetables, etc.
  inventory_api_url text, -- for integration
  operating_hours jsonb,
  coordinates jsonb, -- {lat, lng}
  rating numeric(3,2),
  review_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Gardening clubs
CREATE TABLE public.gardening_clubs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  meeting_schedule text,
  contact_info jsonb, -- {email, phone, website}
  focus_areas text[], -- organic, native plants, vegetables, etc.
  membership_fee numeric(10,2),
  meeting_location text,
  coordinates jsonb, -- {lat, lng}
  member_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sustainability Features tables

-- Composting guides
CREATE TABLE public.composting_guides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  method text NOT NULL, -- 'bin', 'tumbler', 'pile', 'worm', 'bokashi'
  difficulty_level text NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  time_to_compost text, -- estimated time
  materials_needed text[],
  steps jsonb NOT NULL, -- array of step objects
  tips text[],
  troubleshooting jsonb,
  space_required text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User composting tracking
CREATE TABLE public.user_composting (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  guide_id uuid NOT NULL REFERENCES public.composting_guides(id) ON DELETE CASCADE,
  batch_name text NOT NULL,
  start_date date NOT NULL,
  estimated_completion date,
  current_status text NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed'
  materials_added jsonb NOT NULL DEFAULT '[]'::jsonb, -- {date, material, amount, type}
  temperature_logs jsonb DEFAULT '[]'::jsonb, -- {date, temperature}
  notes text,
  final_yield_kg numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Water usage tracking
CREATE TABLE public.water_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plant_id uuid REFERENCES public.plants(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount_liters numeric(10,2) NOT NULL,
  method text, -- 'manual', 'drip', 'sprinkler', 'rain'
  efficiency_score numeric(3,2), -- calculated efficiency rating
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Carbon footprint calculations
CREATE TABLE public.carbon_footprint (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  calculation_date date NOT NULL,
  garden_size_sqm numeric(10,2) NOT NULL,
  carbon_sequestered_kg numeric(10,2), -- from plants
  carbon_emissions_kg numeric(10,2), -- from fertilizers, transport, etc.
  net_carbon_kg numeric(10,2), -- sequestered - emissions
  breakdown jsonb NOT NULL, -- detailed breakdown of calculations
  tips_for_improvement text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Organic pest control recipes
CREATE TABLE public.pest_control_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  target_pests text[] NOT NULL,
  ingredients jsonb NOT NULL, -- {ingredient, amount, unit}
  instructions text[] NOT NULL,
  application_method text NOT NULL,
  safety_precautions text[],
  effectiveness_rating numeric(3,2),
  preparation_time text,
  shelf_life text,
  cost_estimate text,
  user_submitted boolean DEFAULT false,
  user_id uuid, -- if user submitted
  approved boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User pest control applications
CREATE TABLE public.user_pest_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL REFERENCES public.pest_control_recipes(id) ON DELETE CASCADE,
  plant_id uuid REFERENCES public.plants(id) ON DELETE CASCADE,
  application_date date NOT NULL,
  pest_problem text NOT NULL,
  effectiveness_rating numeric(3,2), -- user's rating of how well it worked
  notes text,
  before_photos text[], -- URLs to before photos
  after_photos text[], -- URLs to after photos
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.native_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invasive_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardening_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composting_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_composting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_control_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pest_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Shopping lists policies
CREATE POLICY "Users can view their own shopping lists" 
ON public.shopping_lists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopping lists" 
ON public.shopping_lists 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Soil calculations policies
CREATE POLICY "Users can view their own soil calculations" 
ON public.soil_calculations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own soil calculations" 
ON public.soil_calculations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Regional data is publicly viewable
CREATE POLICY "Regions are viewable by everyone" 
ON public.regions 
FOR SELECT 
USING (true);

CREATE POLICY "Native plants are viewable by everyone" 
ON public.native_plants 
FOR SELECT 
USING (true);

CREATE POLICY "Invasive species are viewable by everyone" 
ON public.invasive_species 
FOR SELECT 
USING (true);

CREATE POLICY "Nurseries are viewable by everyone" 
ON public.nurseries 
FOR SELECT 
USING (true);

CREATE POLICY "Gardening clubs are viewable by everyone" 
ON public.gardening_clubs 
FOR SELECT 
USING (true);

-- Composting policies
CREATE POLICY "Composting guides are viewable by everyone" 
ON public.composting_guides 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own composting" 
ON public.user_composting 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Water usage policies
CREATE POLICY "Users can manage their own water usage" 
ON public.water_usage 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Carbon footprint policies
CREATE POLICY "Users can manage their own carbon footprint" 
ON public.carbon_footprint 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pest control policies
CREATE POLICY "Pest control recipes are viewable by everyone" 
ON public.pest_control_recipes 
FOR SELECT 
USING (approved = true);

CREATE POLICY "Users can create pest control recipes" 
ON public.pest_control_recipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pest applications" 
ON public.user_pest_applications 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_composting_updated_at
BEFORE UPDATE ON public.user_composting
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_native_plants_region ON public.native_plants(region_id);
CREATE INDEX idx_invasive_species_region ON public.invasive_species(region_id);
CREATE INDEX idx_nurseries_region ON public.nurseries(region_id);
CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id);
CREATE INDEX idx_water_usage_user_date ON public.water_usage(user_id, date);
CREATE INDEX idx_carbon_footprint_user ON public.carbon_footprint(user_id);

-- Insert sample data

-- Insert sample regions
INSERT INTO public.regions (name, country, state_province, hardiness_zones, climate_data) VALUES
('California Central Valley', 'USA', 'California', ARRAY['9a', '9b', '10a'], '{"avg_temp_range": {"min": 45, "max": 85}, "rainfall_mm": 250}'),
('Pacific Northwest', 'USA', 'Washington', ARRAY['8a', '8b', '9a'], '{"avg_temp_range": {"min": 40, "max": 75}, "rainfall_mm": 1000}'),
('Texas Gulf Coast', 'USA', 'Texas', ARRAY['9a', '9b', '10a'], '{"avg_temp_range": {"min": 50, "max": 90}, "rainfall_mm": 800}');

-- Insert sample products
INSERT INTO public.products (name, category, description, price_range, specifications) VALUES
('Premium Potting Mix', 'soil', 'High-quality potting soil for containers', '{"min": 15, "max": 25}', '{"volume_liters": 40, "ph_range": "6.0-7.0", "organic": true}'),
('All-Purpose Fertilizer', 'fertilizer', 'Balanced NPK fertilizer for general use', '{"min": 12, "max": 18}', '{"npk_ratio": "10-10-10", "coverage_sqm": 100, "organic": false}'),
('Ceramic Plant Pot', 'pots', 'Decorative ceramic pot with drainage', '{"min": 20, "max": 40}', '{"diameter_cm": 25, "height_cm": 20, "drainage_holes": true}'),
('Garden Trowel', 'tools', 'Stainless steel hand trowel', '{"min": 15, "max": 30}', '{"material": "stainless steel", "handle": "ergonomic", "warranty_years": 5}');

-- Insert sample composting guides
INSERT INTO public.composting_guides (title, method, difficulty_level, time_to_compost, materials_needed, steps) VALUES
('Beginner Bin Composting', 'bin', 'beginner', '3-6 months', ARRAY['compost bin', 'brown materials', 'green materials', 'garden fork'], 
'[{"step": 1, "title": "Set up bin", "description": "Place bin in partially shaded area"}, {"step": 2, "title": "Add materials", "description": "Layer brown and green materials"}]'),
('Worm Composting', 'worm', 'intermediate', '2-4 months', ARRAY['worm bin', 'bedding', 'red worms', 'food scraps'],
'[{"step": 1, "title": "Prepare bin", "description": "Set up worm bin with bedding"}, {"step": 2, "title": "Add worms", "description": "Introduce red worms to the bin"}]');

-- Insert sample pest control recipes
INSERT INTO public.pest_control_recipes (name, target_pests, ingredients, instructions, application_method) VALUES
('Neem Oil Spray', ARRAY['aphids', 'spider mites', 'whiteflies'], 
'[{"ingredient": "neem oil", "amount": 2, "unit": "tablespoons"}, {"ingredient": "water", "amount": 1, "unit": "liter"}, {"ingredient": "mild soap", "amount": 1, "unit": "teaspoon"}]',
ARRAY['Mix neem oil with water', 'Add mild soap as emulsifier', 'Shake well before use'], 
'Spray on affected leaves in evening'),
('Garlic Pepper Spray', ARRAY['caterpillars', 'beetles', 'rabbits'],
'[{"ingredient": "garlic cloves", "amount": 6, "unit": "pieces"}, {"ingredient": "hot peppers", "amount": 2, "unit": "pieces"}, {"ingredient": "water", "amount": 1, "unit": "liter"}]',
ARRAY['Blend garlic and peppers with water', 'Strain mixture', 'Let sit for 24 hours'], 
'Spray on plants avoiding flowers');