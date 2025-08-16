export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string
          category: string
          created_at: string
          description: string
          id: string
          name: string
          points: number
          rarity: string
          requirement_type: string
          requirement_value: number
          updated_at: string
        }
        Insert: {
          badge_icon: string
          category: string
          created_at?: string
          description: string
          id?: string
          name: string
          points?: number
          rarity?: string
          requirement_type: string
          requirement_value: number
          updated_at?: string
        }
        Update: {
          badge_icon?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          points?: number
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carbon_footprint: {
        Row: {
          breakdown: Json
          calculation_date: string
          carbon_emissions_kg: number | null
          carbon_sequestered_kg: number | null
          created_at: string
          garden_size_sqm: number
          id: string
          net_carbon_kg: number | null
          tips_for_improvement: string[] | null
          user_id: string
        }
        Insert: {
          breakdown: Json
          calculation_date: string
          carbon_emissions_kg?: number | null
          carbon_sequestered_kg?: number | null
          created_at?: string
          garden_size_sqm: number
          id?: string
          net_carbon_kg?: number | null
          tips_for_improvement?: string[] | null
          user_id: string
        }
        Update: {
          breakdown?: Json
          calculation_date?: string
          carbon_emissions_kg?: number | null
          carbon_sequestered_kg?: number | null
          created_at?: string
          garden_size_sqm?: number
          id?: string
          net_carbon_kg?: number | null
          tips_for_improvement?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          availability: Json | null
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          plant_type: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          plant_type?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          plant_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      composting_guides: {
        Row: {
          created_at: string
          difficulty_level: string
          id: string
          materials_needed: string[] | null
          method: string
          space_required: string | null
          steps: Json
          time_to_compost: string | null
          tips: string[] | null
          title: string
          troubleshooting: Json | null
        }
        Insert: {
          created_at?: string
          difficulty_level: string
          id?: string
          materials_needed?: string[] | null
          method: string
          space_required?: string | null
          steps: Json
          time_to_compost?: string | null
          tips?: string[] | null
          title: string
          troubleshooting?: Json | null
        }
        Update: {
          created_at?: string
          difficulty_level?: string
          id?: string
          materials_needed?: string[] | null
          method?: string
          space_required?: string | null
          steps?: Json
          time_to_compost?: string | null
          tips?: string[] | null
          title?: string
          troubleshooting?: Json | null
        }
        Relationships: []
      }
      gardening_clubs: {
        Row: {
          contact_info: Json | null
          coordinates: Json | null
          created_at: string
          description: string | null
          focus_areas: string[] | null
          id: string
          meeting_location: string | null
          meeting_schedule: string | null
          member_count: number | null
          membership_fee: number | null
          name: string
          region_id: string
        }
        Insert: {
          contact_info?: Json | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          meeting_location?: string | null
          meeting_schedule?: string | null
          member_count?: number | null
          membership_fee?: number | null
          name: string
          region_id: string
        }
        Update: {
          contact_info?: Json | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          meeting_location?: string | null
          meeting_schedule?: string | null
          member_count?: number | null
          membership_fee?: number | null
          name?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gardening_clubs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      growing_programs: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_days: number | null
          id: string
          plant_types: string[] | null
          season: string | null
          steps: Json | null
          title: string
          type: string
          updated_at: string
          video_urls: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          id?: string
          plant_types?: string[] | null
          season?: string | null
          steps?: Json | null
          title: string
          type: string
          updated_at?: string
          video_urls?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          id?: string
          plant_types?: string[] | null
          season?: string | null
          steps?: Json | null
          title?: string
          type?: string
          updated_at?: string
          video_urls?: Json | null
        }
        Relationships: []
      }
      invasive_species: {
        Row: {
          control_methods: string[] | null
          created_at: string
          description: string
          id: string
          identification_tips: string[] | null
          image_urls: string[] | null
          region_id: string
          reporting_info: Json | null
          scientific_name: string
          species_name: string
          threat_level: string
        }
        Insert: {
          control_methods?: string[] | null
          created_at?: string
          description: string
          id?: string
          identification_tips?: string[] | null
          image_urls?: string[] | null
          region_id: string
          reporting_info?: Json | null
          scientific_name: string
          species_name: string
          threat_level: string
        }
        Update: {
          control_methods?: string[] | null
          created_at?: string
          description?: string
          id?: string
          identification_tips?: string[] | null
          image_urls?: string[] | null
          region_id?: string
          reporting_info?: Json | null
          scientific_name?: string
          species_name?: string
          threat_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "invasive_species_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      native_plants: {
        Row: {
          benefits: string[] | null
          bloom_time: string | null
          care_instructions: string | null
          created_at: string
          endangered_status: string | null
          growing_conditions: Json | null
          id: string
          image_url: string | null
          mature_size: Json | null
          plant_name: string
          plant_type: string
          region_id: string
          scientific_name: string
        }
        Insert: {
          benefits?: string[] | null
          bloom_time?: string | null
          care_instructions?: string | null
          created_at?: string
          endangered_status?: string | null
          growing_conditions?: Json | null
          id?: string
          image_url?: string | null
          mature_size?: Json | null
          plant_name: string
          plant_type: string
          region_id: string
          scientific_name: string
        }
        Update: {
          benefits?: string[] | null
          bloom_time?: string | null
          care_instructions?: string | null
          created_at?: string
          endangered_status?: string | null
          growing_conditions?: Json | null
          id?: string
          image_url?: string | null
          mature_size?: Json | null
          plant_name?: string
          plant_type?: string
          region_id?: string
          scientific_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "native_plants_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      nurseries: {
        Row: {
          address: string
          coordinates: Json | null
          created_at: string
          email: string | null
          id: string
          inventory_api_url: string | null
          name: string
          operating_hours: Json | null
          phone: string | null
          rating: number | null
          region_id: string
          review_count: number | null
          specialties: string[] | null
          website: string | null
        }
        Insert: {
          address: string
          coordinates?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          inventory_api_url?: string | null
          name: string
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          region_id: string
          review_count?: number | null
          specialties?: string[] | null
          website?: string | null
        }
        Update: {
          address?: string
          coordinates?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          inventory_api_url?: string | null
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          region_id?: string
          review_count?: number | null
          specialties?: string[] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurseries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_control_recipes: {
        Row: {
          application_method: string
          approved: boolean | null
          cost_estimate: string | null
          created_at: string
          effectiveness_rating: number | null
          id: string
          ingredients: Json
          instructions: string[]
          name: string
          preparation_time: string | null
          safety_precautions: string[] | null
          shelf_life: string | null
          target_pests: string[]
          user_id: string | null
          user_submitted: boolean | null
        }
        Insert: {
          application_method: string
          approved?: boolean | null
          cost_estimate?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          ingredients: Json
          instructions: string[]
          name: string
          preparation_time?: string | null
          safety_precautions?: string[] | null
          shelf_life?: string | null
          target_pests: string[]
          user_id?: string | null
          user_submitted?: boolean | null
        }
        Update: {
          application_method?: string
          approved?: boolean | null
          cost_estimate?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          ingredients?: Json
          instructions?: string[]
          name?: string
          preparation_time?: string | null
          safety_precautions?: string[] | null
          shelf_life?: string | null
          target_pests?: string[]
          user_id?: string | null
          user_submitted?: boolean | null
        }
        Relationships: []
      }
      plant_diagnoses: {
        Row: {
          created_at: string
          diagnosis_type: string | null
          id: string
          identified_issue: string | null
          image_urls: string[] | null
          plant_id: string | null
          prevention_tips: string[] | null
          resolved: boolean | null
          severity_level: string | null
          symptoms: string[]
          treatment_plan: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis_type?: string | null
          id?: string
          identified_issue?: string | null
          image_urls?: string[] | null
          plant_id?: string | null
          prevention_tips?: string[] | null
          resolved?: boolean | null
          severity_level?: string | null
          symptoms: string[]
          treatment_plan?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis_type?: string | null
          id?: string
          identified_issue?: string | null
          image_urls?: string[] | null
          plant_id?: string | null
          prevention_tips?: string[] | null
          resolved?: boolean | null
          severity_level?: string | null
          symptoms?: string[]
          treatment_plan?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_diagnoses_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          care_instructions: Json | null
          common_names: string[] | null
          confidence_score: number | null
          created_at: string
          difficulty_level: string | null
          fertilizer_frequency: number | null
          humidity_preference: string | null
          id: string
          identified_at: string
          image_url: string | null
          light_requirements: string | null
          plant_name: string
          scientific_name: string | null
          temperature_range: Json | null
          toxic_to_pets: boolean | null
          updated_at: string
          user_id: string | null
          watering_frequency: number | null
        }
        Insert: {
          care_instructions?: Json | null
          common_names?: string[] | null
          confidence_score?: number | null
          created_at?: string
          difficulty_level?: string | null
          fertilizer_frequency?: number | null
          humidity_preference?: string | null
          id?: string
          identified_at?: string
          image_url?: string | null
          light_requirements?: string | null
          plant_name: string
          scientific_name?: string | null
          temperature_range?: Json | null
          toxic_to_pets?: boolean | null
          updated_at?: string
          user_id?: string | null
          watering_frequency?: number | null
        }
        Update: {
          care_instructions?: Json | null
          common_names?: string[] | null
          confidence_score?: number | null
          created_at?: string
          difficulty_level?: string | null
          fertilizer_frequency?: number | null
          humidity_preference?: string | null
          id?: string
          identified_at?: string
          image_url?: string | null
          light_requirements?: string | null
          plant_name?: string
          scientific_name?: string | null
          temperature_range?: Json | null
          toxic_to_pets?: boolean | null
          updated_at?: string
          user_id?: string | null
          watering_frequency?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_links: Json | null
          brand: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_range: Json | null
          rating: number | null
          review_count: number | null
          specifications: Json | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          affiliate_links?: Json | null
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_range?: Json | null
          rating?: number | null
          review_count?: number | null
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_links?: Json | null
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_range?: Json | null
          rating?: number | null
          review_count?: number | null
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          climate_data: Json | null
          coordinates: Json | null
          country: string
          created_at: string
          hardiness_zones: string[] | null
          id: string
          name: string
          state_province: string | null
        }
        Insert: {
          climate_data?: Json | null
          coordinates?: Json | null
          country: string
          created_at?: string
          hardiness_zones?: string[] | null
          id?: string
          name: string
          state_province?: string | null
        }
        Update: {
          climate_data?: Json | null
          coordinates?: Json | null
          country?: string
          created_at?: string
          hardiness_zones?: string[] | null
          id?: string
          name?: string
          state_province?: string | null
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          total_estimated_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          name: string
          total_estimated_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          total_estimated_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soil_calculations: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          pot_dimensions: Json
          soil_mix_recommendations: Json | null
          soil_volume_liters: number
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          pot_dimensions: Json
          soil_mix_recommendations?: Json | null
          soil_volume_liters: number
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          pot_dimensions?: Json
          soil_mix_recommendations?: Json | null
          soil_volume_liters?: number
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          progress: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certificates: {
        Row: {
          certificate_data: Json
          created_at: string
          id: string
          issued_at: string
          program_id: string
          share_token: string | null
          user_id: string
        }
        Insert: {
          certificate_data: Json
          created_at?: string
          id?: string
          issued_at?: string
          program_id: string
          share_token?: string | null
          user_id: string
        }
        Update: {
          certificate_data?: Json
          created_at?: string
          id?: string
          issued_at?: string
          program_id?: string
          share_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certificates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "growing_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_composting: {
        Row: {
          batch_name: string
          created_at: string
          current_status: string
          estimated_completion: string | null
          final_yield_kg: number | null
          guide_id: string
          id: string
          materials_added: Json
          notes: string | null
          start_date: string
          temperature_logs: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_name: string
          created_at?: string
          current_status?: string
          estimated_completion?: string | null
          final_yield_kg?: number | null
          guide_id: string
          id?: string
          materials_added?: Json
          notes?: string | null
          start_date: string
          temperature_logs?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_name?: string
          created_at?: string
          current_status?: string
          estimated_completion?: string | null
          final_yield_kg?: number | null
          guide_id?: string
          id?: string
          materials_added?: Json
          notes?: string | null
          start_date?: string
          temperature_logs?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_composting_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "composting_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pest_applications: {
        Row: {
          after_photos: string[] | null
          application_date: string
          before_photos: string[] | null
          created_at: string
          effectiveness_rating: number | null
          id: string
          notes: string | null
          pest_problem: string
          plant_id: string | null
          recipe_id: string
          user_id: string
        }
        Insert: {
          after_photos?: string[] | null
          application_date: string
          before_photos?: string[] | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          pest_problem: string
          plant_id?: string | null
          recipe_id: string
          user_id: string
        }
        Update: {
          after_photos?: string[] | null
          application_date?: string
          before_photos?: string[] | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          pest_problem?: string
          plant_id?: string | null
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pest_applications_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pest_applications_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pest_control_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_program_progress: {
        Row: {
          completed_at: string | null
          completed_steps: number[] | null
          created_at: string
          current_step: number | null
          id: string
          notes: Json | null
          photos: Json | null
          program_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          notes?: Json | null
          photos?: Json | null
          program_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          notes?: Json | null
          photos?: Json | null
          program_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_program_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "growing_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          created_at: string
          helpful_votes: number | null
          id: string
          images: string[] | null
          rating: number
          review_text: string | null
          reviewed_entity_id: string
          reviewed_entity_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpful_votes?: number | null
          id?: string
          images?: string[] | null
          rating: number
          review_text?: string | null
          reviewed_entity_id: string
          reviewed_entity_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpful_votes?: number | null
          id?: string
          images?: string[] | null
          rating?: number
          review_text?: string | null
          reviewed_entity_id?: string
          reviewed_entity_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          best_streak_days: number
          created_at: string
          current_level: string
          current_streak_days: number
          diagnoses_performed: number
          harvests_completed: number
          id: string
          last_activity_date: string | null
          level_progress: number
          plants_grown: number
          programs_completed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak_days?: number
          created_at?: string
          current_level?: string
          current_streak_days?: number
          diagnoses_performed?: number
          harvests_completed?: number
          id?: string
          last_activity_date?: string | null
          level_progress?: number
          plants_grown?: number
          programs_completed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak_days?: number
          created_at?: string
          current_level?: string
          current_streak_days?: number
          diagnoses_performed?: number
          harvests_completed?: number
          id?: string
          last_activity_date?: string | null
          level_progress?: number
          plants_grown?: number
          programs_completed?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_usage: {
        Row: {
          amount_liters: number
          created_at: string
          date: string
          efficiency_score: number | null
          id: string
          method: string | null
          notes: string | null
          plant_id: string | null
          user_id: string
        }
        Insert: {
          amount_liters: number
          created_at?: string
          date: string
          efficiency_score?: number | null
          id?: string
          method?: string | null
          notes?: string | null
          plant_id?: string | null
          user_id: string
        }
        Update: {
          amount_liters?: number
          created_at?: string
          date?: string
          efficiency_score?: number | null
          id?: string
          method?: string | null
          notes?: string | null
          plant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_usage_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_community_posts_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          availability: Json
          contact_info: Json
          created_at: string
          description: string
          id: string
          images: string[]
          location: string
          plant_type: string
          status: string
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_post_contact_info: {
        Args: { post_id: string }
        Returns: Json
      }
      get_safe_community_post: {
        Args: {
          post_record: Database["public"]["Tables"]["community_posts"]["Row"]
        }
        Returns: {
          availability: Json | null
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          plant_type: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
      }
      log_user_activity: {
        Args: {
          activity_data_param?: Json
          activity_type_param: string
          entity_id_param?: string
          entity_type_param?: string
          user_id_param: string
        }
        Returns: string
      }
      mask_sensitive_data: {
        Args: { data_type: string; original_value: string }
        Returns: string
      }
      update_user_stats_and_achievements: {
        Args: {
          increment_value?: number
          stat_type: string
          user_id_param: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
