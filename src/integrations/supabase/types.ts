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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          product_id: string | null
          referrer: string | null
          store_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referrer?: string | null
          store_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referrer?: string | null
          store_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_links: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_store_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      product_analytics: {
        Row: {
          id: string
          instagram_clicks: number
          last_view: string | null
          product_id: string
          total_views: number
          updated_at: string
          whatsapp_clicks: number
        }
        Insert: {
          id?: string
          instagram_clicks?: number
          last_view?: string | null
          product_id: string
          total_views?: number
          updated_at?: string
          whatsapp_clicks?: number
        }
        Update: {
          id?: string
          instagram_clicks?: number
          last_view?: string | null
          product_id?: string
          total_views?: number
          updated_at?: string
          whatsapp_clicks?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          background_color: string | null
          background_image_url: string | null
          background_type: string | null
          catalog_layout: string | null
          catalog_theme: string | null
          created_at: string
          custom_background_enabled: boolean | null
          custom_whatsapp_message: string | null
          hide_footer: boolean | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          name: string
          product_grid_layout: string | null
          profile_photo_url: string | null
          store_description: string | null
          store_name: string
          store_url: string
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string
          whatsapp_number: number | null
        }
        Insert: {
          background_color?: string | null
          background_image_url?: string | null
          background_type?: string | null
          catalog_layout?: string | null
          catalog_theme?: string | null
          created_at?: string
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          hide_footer?: boolean | null
          id: string
          instagram_url?: string | null
          is_verified?: boolean | null
          name: string
          product_grid_layout?: string | null
          profile_photo_url?: string | null
          store_description?: string | null
          store_name: string
          store_url: string
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          whatsapp_number?: number | null
        }
        Update: {
          background_color?: string | null
          background_image_url?: string | null
          background_type?: string | null
          catalog_layout?: string | null
          catalog_theme?: string | null
          created_at?: string
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          hide_footer?: boolean | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          name?: string
          product_grid_layout?: string | null
          profile_photo_url?: string | null
          store_description?: string | null
          store_name?: string
          store_url?: string
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          whatsapp_number?: number | null
        }
        Relationships: []
      }
      public_access_log: {
        Row: {
          access_type: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          store_url: string | null
          user_agent: string | null
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          store_url?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          store_url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      store_analytics: {
        Row: {
          id: string
          last_visit: string | null
          store_id: string
          total_catalog_views: number
          total_instagram_clicks: number
          total_product_views: number
          total_whatsapp_clicks: number
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          id?: string
          last_visit?: string | null
          store_id: string
          total_catalog_views?: number
          total_instagram_clicks?: number
          total_product_views?: number
          total_whatsapp_clicks?: number
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          id?: string
          last_visit?: string | null
          store_id?: string
          total_catalog_views?: number
          total_instagram_clicks?: number
          total_product_views?: number
          total_whatsapp_clicks?: number
          unique_visitors?: number
          updated_at?: string
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
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_store_catalog: {
        Row: {
          background_color: string | null
          background_image_url: string | null
          background_type: string | null
          catalog_layout: string | null
          catalog_theme: string | null
          created_at: string | null
          custom_background_enabled: boolean | null
          custom_whatsapp_message: string | null
          hide_footer: boolean | null
          id: string | null
          instagram_url: string | null
          is_verified: boolean | null
          product_grid_layout: string | null
          profile_photo_url: string | null
          store_description: string | null
          store_name: string | null
          store_url: string | null
          whatsapp_number: number | null
        }
        Insert: {
          background_color?: string | null
          background_image_url?: string | null
          background_type?: string | null
          catalog_layout?: string | null
          catalog_theme?: string | null
          created_at?: string | null
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          hide_footer?: boolean | null
          id?: string | null
          instagram_url?: string | null
          is_verified?: boolean | null
          product_grid_layout?: string | null
          profile_photo_url?: string | null
          store_description?: string | null
          store_name?: string | null
          store_url?: string | null
          whatsapp_number?: number | null
        }
        Update: {
          background_color?: string | null
          background_image_url?: string | null
          background_type?: string | null
          catalog_layout?: string | null
          catalog_theme?: string | null
          created_at?: string | null
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          hide_footer?: boolean | null
          id?: string | null
          instagram_url?: string | null
          is_verified?: boolean | null
          product_grid_layout?: string | null
          profile_photo_url?: string | null
          store_description?: string | null
          store_name?: string | null
          store_url?: string | null
          whatsapp_number?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_product_analytics: {
        Args: {
          end_date_param?: string
          start_date_param?: string
          store_id_param: string
        }
        Returns: {
          conversion_rate: number
          instagram_clicks: number
          product_id: string
          product_image: string
          product_name: string
          product_price: number
          total_views: number
          whatsapp_clicks: number
        }[]
      }
      get_public_custom_links: {
        Args: { store_url_param: string }
        Returns: {
          display_order: number
          icon: string
          id: string
          title: string
          url: string
        }[]
      }
      get_public_store_info: {
        Args: { store_url_param: string }
        Returns: {
          background_color: string
          background_image_url: string
          background_type: string
          catalog_layout: string
          catalog_theme: string
          created_at: string
          custom_background_enabled: boolean
          custom_whatsapp_message: string
          hide_footer: boolean
          id: string
          instagram_url: string
          is_verified: boolean
          product_grid_layout: string
          profile_photo_url: string
          store_description: string
          store_name: string
          store_url: string
          whatsapp_number: number
        }[]
      }
      get_public_store_products: {
        Args: { store_url_param: string }
        Returns: {
          created_at: string
          description: string
          id: string
          images: string[]
          name: string
          price: number
          updated_at: string
        }[]
      }
      get_store_analytics: {
        Args: {
          end_date_param?: string
          start_date_param?: string
          store_id_param: string
        }
        Returns: {
          total_catalog_views: number
          total_instagram_clicks: number
          total_product_views: number
          total_whatsapp_clicks: number
          unique_visitors: number
        }[]
      }
    }
    Enums: {
      subscription_plan:
        | "free"
        | "pro"
        | "pro_plus"
        | "verified"
        | "pro_plus_verified"
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
    Enums: {
      subscription_plan: [
        "free",
        "pro",
        "pro_plus",
        "verified",
        "pro_plus_verified",
      ],
    },
  },
} as const
