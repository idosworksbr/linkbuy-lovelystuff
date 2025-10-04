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
      account_expiration_settings: {
        Row: {
          created_at: string
          enabled: boolean
          expiration_hours: number
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          expiration_hours?: number
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          expiration_hours?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          amount: number
          commission_amount: number
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          plan_type: string
          referral_id: string | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          commission_amount: number
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          plan_type: string
          referral_id?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          commission_amount?: number
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          plan_type?: string
          referral_id?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          first_purchase_at: string | null
          id: string
          referred_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_id: string
          first_purchase_at?: string | null
          id?: string
          referred_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_id?: string
          first_purchase_at?: string | null
          id?: string
          referred_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          affiliate_url: string
          commission_rate: number | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_code: string
          affiliate_url: string
          commission_rate?: number | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_code?: string
          affiliate_url?: string
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          product_id: string | null
          referrer: string | null
          session_id: string | null
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
          session_id?: string | null
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
          session_id?: string | null
          store_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      catalog_leads: {
        Row: {
          captured_at: string
          city: string
          id: string
          ip_address: string | null
          name: string
          phone: string
          source_button: string
          store_id: string
          user_agent: string | null
        }
        Insert: {
          captured_at?: string
          city: string
          id?: string
          ip_address?: string | null
          name: string
          phone: string
          source_button: string
          store_id: string
          user_agent?: string | null
        }
        Update: {
          captured_at?: string
          city?: string
          id?: string
          ip_address?: string | null
          name?: string
          phone?: string
          source_button?: string
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
      lead_capture_settings: {
        Row: {
          created_at: string
          id: string
          instagram_enabled: boolean
          show_on_catalog_open: boolean
          trigger_mode: string
          updated_at: string
          user_id: string
          whatsapp_feed_enabled: boolean
          whatsapp_product_enabled: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_enabled?: boolean
          show_on_catalog_open?: boolean
          trigger_mode?: string
          updated_at?: string
          user_id: string
          whatsapp_feed_enabled?: boolean
          whatsapp_product_enabled?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          instagram_enabled?: boolean
          show_on_catalog_open?: boolean
          trigger_mode?: string
          updated_at?: string
          user_id?: string
          whatsapp_feed_enabled?: boolean
          whatsapp_product_enabled?: boolean
        }
        Relationships: []
      }
      masters: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          bounce: boolean
          created_at: string
          id: string
          page_title: string | null
          page_url: string
          referrer_page: string | null
          session_id: string
          time_on_page_seconds: number | null
        }
        Insert: {
          bounce?: boolean
          created_at?: string
          id?: string
          page_title?: string | null
          page_url: string
          referrer_page?: string | null
          session_id: string
          time_on_page_seconds?: number | null
        }
        Update: {
          bounce?: boolean
          created_at?: string
          id?: string
          page_title?: string | null
          page_url?: string
          referrer_page?: string | null
          session_id?: string
          time_on_page_seconds?: number | null
        }
        Relationships: []
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
          code: string | null
          cost: number | null
          created_at: string
          description: string | null
          discount: number | null
          discount_animation_color: string | null
          discount_animation_enabled: boolean | null
          display_order: number | null
          id: string
          images: string[] | null
          name: string
          price: number
          status: string | null
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          category_id?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          discount?: number | null
          discount_animation_color?: string | null
          discount_animation_enabled?: boolean | null
          display_order?: number | null
          id?: string
          images?: string[] | null
          name: string
          price: number
          status?: string | null
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          discount?: number | null
          discount_animation_color?: string | null
          discount_animation_enabled?: boolean | null
          display_order?: number | null
          id?: string
          images?: string[] | null
          name?: string
          price?: number
          status?: string | null
          updated_at?: string
          user_id?: string
          weight?: string | null
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
          catalog_visible: boolean | null
          created_at: string
          custom_background_enabled: boolean | null
          custom_whatsapp_message: string | null
          email_confirmed_at: string | null
          first_login_at: string | null
          hide_footer: boolean | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          last_login_at: string | null
          name: string
          niche: string | null
          onboarding_completed: boolean | null
          phone: string | null
          product_grid_layout: string | null
          product_name_text_color: string | null
          product_price_text_color: string | null
          product_text_background_color: string | null
          product_text_background_enabled: boolean | null
          product_text_background_opacity: number | null
          profile_photo_url: string | null
          referred_by_affiliate_id: string | null
          show_all_products_in_feed: boolean
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
          catalog_visible?: boolean | null
          created_at?: string
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          email_confirmed_at?: string | null
          first_login_at?: string | null
          hide_footer?: boolean | null
          id: string
          instagram_url?: string | null
          is_verified?: boolean | null
          last_login_at?: string | null
          name: string
          niche?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          product_grid_layout?: string | null
          product_name_text_color?: string | null
          product_price_text_color?: string | null
          product_text_background_color?: string | null
          product_text_background_enabled?: boolean | null
          product_text_background_opacity?: number | null
          profile_photo_url?: string | null
          referred_by_affiliate_id?: string | null
          show_all_products_in_feed?: boolean
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
          catalog_visible?: boolean | null
          created_at?: string
          custom_background_enabled?: boolean | null
          custom_whatsapp_message?: string | null
          email_confirmed_at?: string | null
          first_login_at?: string | null
          hide_footer?: boolean | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          last_login_at?: string | null
          name?: string
          niche?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          product_grid_layout?: string | null
          product_name_text_color?: string | null
          product_price_text_color?: string | null
          product_text_background_color?: string | null
          product_text_background_enabled?: boolean | null
          product_text_background_opacity?: number | null
          profile_photo_url?: string | null
          referred_by_affiliate_id?: string | null
          show_all_products_in_feed?: boolean
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
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_affiliate_id_fkey"
            columns: ["referred_by_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
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
      user_deletion_audit: {
        Row: {
          categories_count: number | null
          created_at: string
          deleted_by: string
          deleted_user_email: string
          deleted_user_id: string
          deleted_user_name: string | null
          deletion_reason: string | null
          id: string
          leads_count: number | null
          products_count: number | null
        }
        Insert: {
          categories_count?: number | null
          created_at?: string
          deleted_by: string
          deleted_user_email: string
          deleted_user_id: string
          deleted_user_name?: string | null
          deletion_reason?: string | null
          id?: string
          leads_count?: number | null
          products_count?: number | null
        }
        Update: {
          categories_count?: number | null
          created_at?: string
          deleted_by?: string
          deleted_user_email?: string
          deleted_user_id?: string
          deleted_user_name?: string | null
          deletion_reason?: string | null
          id?: string
          leads_count?: number | null
          products_count?: number | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
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
          cancel_at_period_end?: boolean | null
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
          cancel_at_period_end?: boolean | null
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
      website_sessions: {
        Row: {
          converted_to_signup: boolean
          created_at: string
          duration_seconds: number
          end_time: string | null
          id: string
          ip_address: string | null
          landing_page: string | null
          page_count: number
          referrer: string | null
          session_id: string
          start_time: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          converted_to_signup?: boolean
          created_at?: string
          duration_seconds?: number
          end_time?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          page_count?: number
          referrer?: string | null
          session_id: string
          start_time?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          converted_to_signup?: boolean
          created_at?: string
          duration_seconds?: number
          end_time?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          page_count?: number
          referrer?: string | null
          session_id?: string
          start_time?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_store_catalog"
            referencedColumns: ["id"]
          },
        ]
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
          product_name_text_color: string | null
          product_price_text_color: string | null
          product_text_background_color: string | null
          product_text_background_enabled: boolean | null
          product_text_background_opacity: number | null
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
          product_name_text_color?: string | null
          product_price_text_color?: string | null
          product_text_background_color?: string | null
          product_text_background_enabled?: boolean | null
          product_text_background_opacity?: number | null
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
          product_name_text_color?: string | null
          product_price_text_color?: string | null
          product_text_background_color?: string | null
          product_text_background_enabled?: boolean | null
          product_text_background_opacity?: number | null
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
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      get_public_store_categories: {
        Args: { store_url_param: string }
        Returns: {
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          name: string
          product_count: number
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
          product_name_text_color: string
          product_price_text_color: string
          product_text_background_color: string
          product_text_background_enabled: boolean
          product_text_background_opacity: number
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
      is_master_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
