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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          username?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
