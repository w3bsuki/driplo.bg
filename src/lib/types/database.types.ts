export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          ip_address: unknown | null
          last_used_at: string | null
          remember_me: boolean | null
          user_agent: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          last_used_at?: string | null
          remember_me?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          last_used_at?: string | null
          remember_me?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          request_id: string
          request_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          request_id: string
          request_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          request_id?: string
          request_type?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          can_manage_users: boolean | null
          can_verify_emails: boolean | null
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_manage_users?: boolean | null
          can_verify_emails?: boolean | null
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_manage_users?: boolean | null
          can_verify_emails?: boolean | null
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_audit_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          location: Json | null
          metadata: Json | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_login_history: {
        Row: {
          failure_reason: string | null
          id: number
          ip_address: unknown | null
          login_at: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          failure_reason?: string | null
          id?: number
          ip_address?: unknown | null
          login_at?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          failure_reason?: string | null
          id?: number
          ip_address?: unknown | null
          login_at?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limit: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          action: string
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
        }
        Insert: {
          action: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      auth_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_used_at: string | null
          refresh_token_hash: string
          remember_me: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          refresh_token_hash: string
          remember_me?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          refresh_token_hash?: string
          remember_me?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_suspicious_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          brand_cover_url: string | null
          brand_description: string | null
          brand_logo_url: string | null
          brand_mission: string | null
          brand_name: string
          brand_slug: string
          brand_story: string | null
          brand_values: string | null
          created_at: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_metadata: Json | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          brand_cover_url?: string | null
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_mission?: string | null
          brand_name: string
          brand_slug: string
          brand_story?: string | null
          brand_values?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_metadata?: Json | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          brand_cover_url?: string | null
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_mission?: string | null
          brand_name?: string
          brand_slug?: string
          brand_story?: string | null
          brand_values?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_metadata?: Json | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      brand_social_verifications: {
        Row: {
          brand_id: string
          created_at: string | null
          id: string
          platform: string
          username: string
          verification_code: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          id?: string
          platform: string
          username: string
          verification_code: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          id?: string
          platform?: string
          username?: string
          verification_code?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_social_verifications_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_verification_requests: {
        Row: {
          admin_notes: string | null
          brand_category: string
          brand_name: string
          business_registration_number: string | null
          created_at: string | null
          documents: Json | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_accounts: Json | null
          submitted_at: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          brand_category: string
          brand_name: string
          business_registration_number?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_accounts?: Json | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          brand_category?: string
          brand_name?: string
          business_registration_number?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_accounts?: Json | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string | null
          cart_id: string
          id: string
          listing_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          added_at?: string | null
          cart_id: string
          id?: string
          listing_id: string
          quantity?: number
          variant_id?: string | null
        }
        Update: {
          added_at?: string | null
          cart_id?: string
          id?: string
          listing_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_by_buyer: boolean | null
          archived_by_seller: boolean | null
          buyer_id: string
          buyer_unread_count: number | null
          created_at: string | null
          id: string
          last_message_at: string | null
          listing_id: string | null
          seller_id: string
          seller_unread_count: number | null
        }
        Insert: {
          archived_by_buyer?: boolean | null
          archived_by_seller?: boolean | null
          buyer_id: string
          buyer_unread_count?: number | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id: string
          seller_unread_count?: number | null
        }
        Update: {
          archived_by_buyer?: boolean | null
          archived_by_seller?: boolean | null
          buyer_id?: string
          buyer_unread_count?: number | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id?: string
          seller_unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          failure_reason: string | null
          id: string
          is_successful: boolean | null
          order_amount: number | null
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          failure_reason?: string | null
          id?: string
          is_successful?: boolean | null
          order_amount?: number | null
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          failure_reason?: string | null
          id?: string
          is_successful?: boolean | null
          order_amount?: number | null
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          buy_quantity: number | null
          can_stack: boolean | null
          category_ids: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          excluded_listing_ids: string[] | null
          get_quantity: number | null
          id: string
          is_active: boolean | null
          listing_ids: string[] | null
          maximum_discount: number | null
          minimum_account_age_days: number | null
          minimum_purchase: number | null
          name: string
          new_users_only: boolean | null
          seller_id: string | null
          target_type: Database["public"]["Enums"]["promotion_target"] | null
          total_discount_given: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_user: number | null
          user_ids: string[] | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          buy_quantity?: number | null
          can_stack?: boolean | null
          category_ids?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          excluded_listing_ids?: string[] | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          listing_ids?: string[] | null
          maximum_discount?: number | null
          minimum_account_age_days?: number | null
          minimum_purchase?: number | null
          name: string
          new_users_only?: boolean | null
          seller_id?: string | null
          target_type?: Database["public"]["Enums"]["promotion_target"] | null
          total_discount_given?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          user_ids?: string[] | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          buy_quantity?: number | null
          can_stack?: boolean | null
          category_ids?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          excluded_listing_ids?: string[] | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          listing_ids?: string[] | null
          maximum_discount?: number | null
          minimum_account_age_days?: number | null
          minimum_purchase?: number | null
          name?: string
          new_users_only?: boolean | null
          seller_id?: string | null
          target_type?: Database["public"]["Enums"]["promotion_target"] | null
          total_discount_given?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
          user_ids?: string[] | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      database_health_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
        }
        Relationships: []
      }
      dispute_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          dispute_id: string
          id: string
          is_private_note: boolean | null
          is_staff_message: boolean | null
          is_system_message: boolean | null
          message: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          dispute_id: string
          id?: string
          is_private_note?: boolean | null
          is_staff_message?: boolean | null
          is_system_message?: boolean | null
          message: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          dispute_id?: string
          id?: string
          is_private_note?: boolean | null
          is_staff_message?: boolean | null
          is_system_message?: boolean | null
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          description: string
          dispute_number: string
          id: string
          initiated_by: string
          metadata: Json | null
          order_id: string
          resolution: Database["public"]["Enums"]["resolution_type"] | null
          resolution_notes: string | null
          resolved_at: string | null
          respondent_id: string
          status: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          type: Database["public"]["Enums"]["dispute_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          dispute_number: string
          id?: string
          initiated_by: string
          metadata?: Json | null
          order_id: string
          resolution?: Database["public"]["Enums"]["resolution_type"] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          respondent_id: string
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          type: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          dispute_number?: string
          id?: string
          initiated_by?: string
          metadata?: Json | null
          order_id?: string
          resolution?: Database["public"]["Enums"]["resolution_type"] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          respondent_id?: string
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          rejection_reason: string | null
          status: string | null
          type: string
          updated_at: string
          url: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          rejection_reason?: string | null
          status?: string | null
          type: string
          updated_at?: string
          url: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          rejection_reason?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_drafts: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          form_data: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      listing_views: {
        Row: {
          id: string
          ip_address: unknown | null
          listing_id: string
          session_id: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          listing_id: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          listing_id?: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          brand: string | null
          category_id: string | null
          color: string | null
          condition: string | null
          created_at: string | null
          currency: string | null
          description: string
          favorite_count: number | null
          id: string
          image_metadata: Json | null
          image_urls: Json | null
          images: Json | null
          is_featured: boolean | null
          location: Json | null
          location_city: string | null
          materials: string[] | null
          metadata: Json | null
          price: number
          published_at: string | null
          quantity: number | null
          seller_id: string
          shipping_cost: number | null
          shipping_info: Json | null
          shipping_type: string | null
          ships_worldwide: boolean | null
          size: string | null
          slug: string
          sold_at: string | null
          status: string | null
          subcategory_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          favorite_count?: number | null
          id?: string
          image_metadata?: Json | null
          image_urls?: Json | null
          images?: Json | null
          is_featured?: boolean | null
          location?: Json | null
          location_city?: string | null
          materials?: string[] | null
          metadata?: Json | null
          price: number
          published_at?: string | null
          quantity?: number | null
          seller_id: string
          shipping_cost?: number | null
          shipping_info?: Json | null
          shipping_type?: string | null
          ships_worldwide?: boolean | null
          size?: string | null
          slug: string
          sold_at?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          favorite_count?: number | null
          id?: string
          image_metadata?: Json | null
          image_urls?: Json | null
          images?: Json | null
          is_featured?: boolean | null
          location?: Json | null
          location_city?: string | null
          materials?: string[] | null
          metadata?: Json | null
          price?: number
          published_at?: string | null
          quantity?: number | null
          seller_id?: string
          shipping_cost?: number | null
          shipping_info?: Json | null
          shipping_type?: string | null
          ships_worldwide?: boolean | null
          size?: string | null
          slug?: string
          sold_at?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          related_listing_id: string | null
          related_order_id: string | null
          related_user_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          related_listing_id?: string | null
          related_order_id?: string | null
          related_user_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          related_listing_id?: string | null
          related_order_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_listing_id_fkey"
            columns: ["related_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          metadata: Json | null
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          metadata?: Json | null
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          metadata?: Json | null
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          metadata: Json | null
          order_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          order_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          order_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          carrier: Database["public"]["Enums"]["shipping_carrier"]
          created_at: string | null
          events: Json | null
          id: string
          last_update: string | null
          order_id: string
          status: Database["public"]["Enums"]["tracking_status"] | null
          tracking_number: string
          tracking_url: string | null
        }
        Insert: {
          carrier: Database["public"]["Enums"]["shipping_carrier"]
          created_at?: string | null
          events?: Json | null
          id?: string
          last_update?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["tracking_status"] | null
          tracking_number: string
          tracking_url?: string | null
        }
        Update: {
          carrier?: Database["public"]["Enums"]["shipping_carrier"]
          created_at?: string | null
          events?: Json | null
          id?: string
          last_update?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["tracking_status"] | null
          tracking_number?: string
          tracking_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          buyer_id: string
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          discount_amount: number | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method_id: string | null
          seller_id: string
          shipped_at: string | null
          shipping_address_id: string | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          billing_address_id?: string | null
          buyer_id: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method_id?: string | null
          seller_id: string
          shipped_at?: string | null
          shipping_address_id?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          billing_address_id?: string | null
          buyer_id?: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method_id?: string | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address_id?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_payment_method"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_type: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          bank_routing_number: string | null
          capabilities: Json | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          payout_method: string | null
          paypal_email: string | null
          requirements: Json | null
          revtag: string | null
          stripe_account_id: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          account_type?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          payout_method?: string | null
          paypal_email?: string | null
          requirements?: Json | null
          revtag?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          account_type?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          payout_method?: string | null
          paypal_email?: string | null
          requirements?: Json | null
          revtag?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          metadata: Json | null
          stripe_payment_method_id: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          metadata?: Json | null
          stripe_payment_method_id?: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          metadata?: Json | null
          stripe_payment_method_id?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          order_id: string
          processor: string
          processor_response: Json | null
          processor_transaction_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          processor: string
          processor_response?: Json | null
          processor_transaction_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          processor?: string
          processor_response?: Json | null
          processor_transaction_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          listing_id: string
          name: string
          price: number
          quantity: number | null
          sku: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id: string
          name: string
          price: number
          quantity?: number | null
          sku?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id?: string
          name?: string
          price?: number
          quantity?: number | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_setup_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          step_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          account_type: string | null
          achievements: Json | null
          avatar_metadata: Json | null
          avatar_seed: string | null
          avatar_style: string | null
          avatar_url: string | null
          avatar_urls: Json | null
          backup_codes: string[] | null
          badges: Database["public"]["Enums"]["badge_type"][] | null
          bio: string | null
          brand_category: string | null
          brand_description: string | null
          brand_established_date: string | null
          brand_facebook: string | null
          brand_instagram: string | null
          brand_logo_url: string | null
          brand_mission: string | null
          brand_name: string | null
          brand_onboarding_completed: boolean | null
          brand_size: string | null
          brand_story: string | null
          brand_values: string | null
          brand_website: string | null
          business_info: Json | null
          buyer_rating: number | null
          buyer_rating_count: number | null
          company_name: string | null
          company_registration_number: string | null
          completion_percentage: number | null
          cover_metadata: Json | null
          cover_url: string | null
          cover_urls: Json | null
          created_at: string | null
          custom_avatar_url: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          email_notifications_enabled: boolean | null
          first_login_at: string | null
          follower_count: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          is_seller: boolean | null
          is_verified: boolean | null
          language_preference: string | null
          last_active: string | null
          last_login_at: string | null
          last_purchase_at: string | null
          last_sale_at: string | null
          listings_count: number | null
          location: Json | null
          login_count: number | null
          member_since: string | null
          metadata: Json | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          preferences: Json | null
          privacy_settings: Json | null
          profile_views: number | null
          push_notifications_enabled: boolean | null
          referral_code: string | null
          referred_by: string | null
          response_time_hours: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          security_questions: Json | null
          seller_level: number | null
          seller_rating: number | null
          seller_rating_count: number | null
          settings: Json | null
          setup_completed: boolean | null
          setup_completed_at: string | null
          setup_started_at: string | null
          sms_notifications_enabled: boolean | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          suspension_date: string | null
          suspension_lifted_date: string | null
          suspension_reason: string | null
          tax_info: Json | null
          total_earned: number | null
          total_earnings: number | null
          total_purchases: number | null
          total_sales: number | null
          total_sold: number | null
          total_spent: number | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          username: string
          vat_number: string | null
          verification_badges: Json | null
          votes_cast: number | null
          votes_received: number | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          achievements?: Json | null
          avatar_metadata?: Json | null
          avatar_seed?: string | null
          avatar_style?: string | null
          avatar_url?: string | null
          avatar_urls?: Json | null
          backup_codes?: string[] | null
          badges?: Database["public"]["Enums"]["badge_type"][] | null
          bio?: string | null
          brand_category?: string | null
          brand_description?: string | null
          brand_established_date?: string | null
          brand_facebook?: string | null
          brand_instagram?: string | null
          brand_logo_url?: string | null
          brand_mission?: string | null
          brand_name?: string | null
          brand_onboarding_completed?: boolean | null
          brand_size?: string | null
          brand_story?: string | null
          brand_values?: string | null
          brand_website?: string | null
          business_info?: Json | null
          buyer_rating?: number | null
          buyer_rating_count?: number | null
          company_name?: string | null
          company_registration_number?: string | null
          completion_percentage?: number | null
          cover_metadata?: Json | null
          cover_url?: string | null
          cover_urls?: Json | null
          created_at?: string | null
          custom_avatar_url?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email: string
          email_notifications_enabled?: boolean | null
          first_login_at?: string | null
          follower_count?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_admin?: boolean | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_active?: string | null
          last_login_at?: string | null
          last_purchase_at?: string | null
          last_sale_at?: string | null
          listings_count?: number | null
          location?: Json | null
          login_count?: number | null
          member_since?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_views?: number | null
          push_notifications_enabled?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          response_time_hours?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          security_questions?: Json | null
          seller_level?: number | null
          seller_rating?: number | null
          seller_rating_count?: number | null
          settings?: Json | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          setup_started_at?: string | null
          sms_notifications_enabled?: boolean | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          suspension_date?: string | null
          suspension_lifted_date?: string | null
          suspension_reason?: string | null
          tax_info?: Json | null
          total_earned?: number | null
          total_earnings?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          total_sold?: number | null
          total_spent?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username: string
          vat_number?: string | null
          verification_badges?: Json | null
          votes_cast?: number | null
          votes_received?: number | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          achievements?: Json | null
          avatar_metadata?: Json | null
          avatar_seed?: string | null
          avatar_style?: string | null
          avatar_url?: string | null
          avatar_urls?: Json | null
          backup_codes?: string[] | null
          badges?: Database["public"]["Enums"]["badge_type"][] | null
          bio?: string | null
          brand_category?: string | null
          brand_description?: string | null
          brand_established_date?: string | null
          brand_facebook?: string | null
          brand_instagram?: string | null
          brand_logo_url?: string | null
          brand_mission?: string | null
          brand_name?: string | null
          brand_onboarding_completed?: boolean | null
          brand_size?: string | null
          brand_story?: string | null
          brand_values?: string | null
          brand_website?: string | null
          business_info?: Json | null
          buyer_rating?: number | null
          buyer_rating_count?: number | null
          company_name?: string | null
          company_registration_number?: string | null
          completion_percentage?: number | null
          cover_metadata?: Json | null
          cover_url?: string | null
          cover_urls?: Json | null
          created_at?: string | null
          custom_avatar_url?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          email_notifications_enabled?: boolean | null
          first_login_at?: string | null
          follower_count?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_active?: string | null
          last_login_at?: string | null
          last_purchase_at?: string | null
          last_sale_at?: string | null
          listings_count?: number | null
          location?: Json | null
          login_count?: number | null
          member_since?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_views?: number | null
          push_notifications_enabled?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          response_time_hours?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          security_questions?: Json | null
          seller_level?: number | null
          seller_rating?: number | null
          seller_rating_count?: number | null
          settings?: Json | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          setup_started_at?: string | null
          sms_notifications_enabled?: boolean | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          suspension_date?: string | null
          suspension_lifted_date?: string | null
          suspension_reason?: string | null
          tax_info?: Json | null
          total_earned?: number | null
          total_earnings?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          total_sold?: number | null
          total_spent?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string
          vat_number?: string | null
          verification_badges?: Json | null
          votes_cast?: number | null
          votes_received?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      query_performance_log: {
        Row: {
          created_at: string | null
          execution_time_ms: number | null
          id: string
          query_hash: string
          query_text: string | null
          rows_affected: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          query_hash: string
          query_text?: string | null
          rows_affected?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          query_hash?: string
          query_text?: string | null
          rows_affected?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action: string
          attempted_at: string | null
          id: string
          identifier: string
          success: boolean | null
        }
        Insert: {
          action: string
          attempted_at?: string | null
          id?: string
          identifier: string
          success?: boolean | null
        }
        Update: {
          action?: string
          attempted_at?: string | null
          id?: string
          identifier?: string
          success?: boolean | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_at: string | null
          requested_by: string
          status: string | null
          stripe_refund_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_at?: string | null
          requested_by: string
          status?: string | null
          stripe_refund_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_at?: string | null
          requested_by?: string
          status?: string | null
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string
          order_item_id: string
          photos: Json | null
          reason: Database["public"]["Enums"]["return_reason"]
          refund_amount: number | null
          replacement_order_id: string | null
          requested_by: string
          return_number: string
          return_shipping_label: string | null
          status: Database["public"]["Enums"]["return_status"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id: string
          order_item_id: string
          photos?: Json | null
          reason: Database["public"]["Enums"]["return_reason"]
          refund_amount?: number | null
          replacement_order_id?: string | null
          requested_by: string
          return_number: string
          return_shipping_label?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string
          order_item_id?: string
          photos?: Json | null
          reason?: Database["public"]["Enums"]["return_reason"]
          refund_amount?: number | null
          replacement_order_id?: string | null
          requested_by?: string
          return_number?: string
          return_shipping_label?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_replacement_order_id_fkey"
            columns: ["replacement_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_payouts: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          initiated_at: string | null
          metadata: Json | null
          seller_id: string
          status: string
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          seller_id: string
          status: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          seller_id?: string
          status?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country_code: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
          postal_code: string
          state_province: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country_code: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
          postal_code: string
          state_province: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country_code?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string
          state_province?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_events: {
        Row: {
          carrier: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          order_id: string
          tracking_number: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          order_id: string
          tracking_number?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          order_id?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_labels: {
        Row: {
          carrier: Database["public"]["Enums"]["shipping_carrier"]
          cost: number | null
          created_at: string | null
          id: string
          label_url: string | null
          order_id: string
          tracking_number: string
        }
        Insert: {
          carrier: Database["public"]["Enums"]["shipping_carrier"]
          cost?: number | null
          created_at?: string | null
          id?: string
          label_url?: string | null
          order_id: string
          tracking_number: string
        }
        Update: {
          carrier?: Database["public"]["Enums"]["shipping_carrier"]
          cost?: number | null
          created_at?: string | null
          id?: string
          label_url?: string | null
          order_id?: string
          tracking_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_labels_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slow_queries: {
        Row: {
          created_at: string | null
          execution_time_ms: number
          id: string
          query_plan: string | null
          query_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms: number
          id?: string
          query_plan?: string | null
          query_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number
          id?: string
          query_plan?: string | null
          query_text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          created_at: string | null
          followers_count: number | null
          id: string
          is_verified: boolean | null
          platform: string
          updated_at: string | null
          url: string | null
          user_id: string
          username: string
          verification_data: Json | null
        }
        Insert: {
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          platform: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          username: string
          verification_data?: Json | null
        }
        Update: {
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          platform?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          username?: string
          verification_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_credits: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
          used_amount: number | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          used_amount?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          used_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_credits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          data: Json
          error: string | null
          id: string
          processed: boolean | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          error?: string | null
          id?: string
          processed?: boolean | null
          stripe_event_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          error?: string | null
          id?: string
          processed?: boolean | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          created_at: string | null
          description: string | null
          fee: number | null
          id: string
          metadata: Json | null
          net_amount: number
          order_id: string | null
          seller_id: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          created_at?: string | null
          description?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          net_amount: number
          order_id?: string | null
          seller_id?: string | null
          status: string
          type: string
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          created_at?: string | null
          description?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          order_id?: string | null
          seller_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string
          expires_at: string | null
          id: string
          level: number | null
          points: number | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string
          expires_at?: string | null
          id?: string
          level?: number | null
          points?: number | null
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string
          expires_at?: string | null
          id?: string
          level?: number | null
          points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          order_id: string
          rated_user_id: string
          rater_user_id: string
          rating: number
          type: Database["public"]["Enums"]["rating_type"]
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          rated_user_id: string
          rater_user_id: string
          rating: number
          type: Database["public"]["Enums"]["rating_type"]
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          rated_user_id?: string
          rater_user_id?: string
          rating?: number
          type?: Database["public"]["Enums"]["rating_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rater_user_id_fkey"
            columns: ["rater_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats_summary: {
        Row: {
          average_rating: number | null
          follower_count: number | null
          following_count: number | null
          last_active_at: string | null
          response_rate: number | null
          response_time_hours: number | null
          ship_time_hours: number | null
          total_earned: number | null
          total_purchases: number | null
          total_ratings: number | null
          total_sales: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          follower_count?: number | null
          following_count?: number | null
          last_active_at?: string | null
          response_rate?: number | null
          response_time_hours?: number | null
          ship_time_hours?: number | null
          total_earned?: number | null
          total_purchases?: number | null
          total_ratings?: number | null
          total_sales?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_rating?: number | null
          follower_count?: number | null
          following_count?: number | null
          last_active_at?: string | null
          response_rate?: number | null
          response_time_hours?: number | null
          ship_time_hours?: number | null
          total_earned?: number | null
          total_purchases?: number | null
          total_ratings?: number | null
          total_sales?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_verify_user_email: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      analyze_brin_effectiveness: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          index_name: string
          index_size: string
          table_size: string
          size_ratio: number
          estimated_bloat: number
        }[]
      }
      analyze_gin_index_sizes: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          index_name: string
          index_size: string
          index_type: string
        }[]
      }
      bulk_update_order_status: {
        Args: { p_order_ids: string[]; p_new_status: string; p_reason?: string }
        Returns: number
      }
      calculate_listing_priority: {
        Args: {
          seller_account_type: string
          seller_is_verified: boolean
          listing_created_at: string
        }
        Returns: number
      }
      calculate_platform_fee: {
        Args: { amount: number }
        Returns: number
      }
      calculate_profile_badges: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: Database["public"]["Enums"]["badge_type"][]
      }
      calculate_shipping_cost: {
        Args: { p_listing_id: string; p_destination_country: string }
        Returns: number
      }
      check_auth_rate_limit: {
        Args: {
          p_identifier: string
          p_action: string
          p_max_attempts?: number
          p_window_minutes?: number
          p_block_minutes?: number
        }
        Returns: Json
      }
      check_email_verification_bypass: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_auth_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_order_with_payment: {
        Args: {
          p_listing_id: string
          p_buyer_id: string
          p_payment_method_id: string
          p_shipping_address: Json
          p_metadata?: Json
        }
        Returns: string
      }
      delete_user_account: {
        Args: { p_user_id: string; p_reason?: string }
        Returns: boolean
      }
      export_user_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_brand_slug: {
        Args: { brand_name: string }
        Returns: string
      }
      generate_image_metadata: {
        Args: { original_url: string; bucket_name: string; file_path: string }
        Returns: Json
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_brand_sales_stats: {
        Args: { user_id_param: string; start_date?: string }
        Returns: {
          total_sales: number
          total_revenue: number
          avg_order_value: number
          total_orders: number
        }[]
      }
      get_brand_statistics: {
        Args: { brand_user_id: string }
        Returns: {
          total_listings: number
          active_listings: number
          total_sales: number
          total_reviews: number
          avg_rating: number
          total_views: number
          total_favorites: number
        }[]
      }
      get_category_top_sellers: {
        Args: {
          category_slug: string
          time_period?: string
          result_limit?: number
        }
        Returns: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          account_type: string
          is_verified: boolean
          category_sales: number
          category_revenue: number
          category_rating: number
          category_rating_count: number
        }[]
      }
      get_optimized_image_url: {
        Args: { base_url: string; size?: string }
        Returns: string
      }
      get_or_create_cart: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_popular_brands: {
        Args: { limit_count?: number }
        Returns: {
          brand: string
          count: number
        }[]
      }
      get_recent_reviews: {
        Args: { time_period?: string; page?: number; page_size?: number }
        Returns: {
          id: string
          order_id: string
          rater_user_id: string
          rater_username: string
          rater_full_name: string
          rater_avatar_url: string
          rated_user_id: string
          rated_username: string
          rated_full_name: string
          rated_avatar_url: string
          is_brand: boolean
          brand_name: string
          rating: number
          comment: string
          created_at: string
          listing_title: string
          listing_price: number
        }[]
      }
      get_recommended_listings: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          id: string
          title: string
          price: number
          images: Json
          seller_id: string
          score: number
        }[]
      }
      get_seller_analytics: {
        Args: {
          p_seller_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          total_views: number
          unique_viewers: number
          total_sales: number
          total_revenue: number
          avg_order_value: number
          conversion_rate: number
          top_categories: Json
          sales_by_day: Json
        }[]
      }
      get_seller_reviews: {
        Args: { seller_id?: string; page?: number; page_size?: number }
        Returns: {
          id: string
          order_id: string
          rater_user_id: string
          rater_username: string
          rater_full_name: string
          rater_avatar_url: string
          rated_user_id: string
          rated_username: string
          rated_full_name: string
          rated_avatar_url: string
          rating: number
          comment: string
          created_at: string
          listing_title: string
          listing_price: number
        }[]
      }
      get_slow_queries: {
        Args: { min_duration_ms?: number; limit_rows?: number }
        Returns: {
          query: string
          calls: number
          total_time: number
          mean_time: number
          max_time: number
          stddev_time: number
        }[]
      }
      get_top_brands: {
        Args: { time_period?: string; result_limit?: number }
        Returns: {
          id: string
          user_id: string
          brand_name: string
          brand_slug: string
          brand_logo_url: string
          verification_status: string
          total_sales: number
          total_revenue: number
          average_rating: number
          rating_count: number
          items_sold: number
        }[]
      }
      get_top_sellers: {
        Args: { time_period?: string; result_limit?: number }
        Returns: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          total_sales: number
          total_revenue: number
          average_rating: number
          rating_count: number
          items_sold: number
          account_type: string
          is_verified: boolean
        }[]
      }
      get_unverified_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string
          full_name: string
          email: string
          created_at: string
        }[]
      }
      get_user_stats: {
        Args: { user_id_param: string }
        Returns: {
          total_sales: number
          total_listings: number
          avg_rating: number
          total_reviews: number
        }[]
      }
      grant_user_achievement: {
        Args: {
          p_user_id: string
          p_achievement_type: string
          p_achievement_name: string
          p_achievement_description?: string
          p_points?: number
          p_level?: number
          p_achievement_data?: Json
        }
        Returns: {
          achievement_data: Json | null
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string
          expires_at: string | null
          id: string
          level: number | null
          points: number | null
          user_id: string
        }
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_listing_quantity: {
        Args: { listing_id: string; quantity_increment: number }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_profile_setup_complete: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_auth_event: {
        Args:
          | {
              p_user_id: string
              p_action: string
              p_ip_address?: unknown
              p_user_agent?: string
              p_success?: boolean
              p_error_message?: string
              p_metadata?: Json
            }
          | {
              p_user_id?: string
              p_action?: string
              p_success?: boolean
              p_error_message?: string
              p_metadata?: Json
            }
        Returns: string
      }
      process_refund: {
        Args: { p_order_id: string; p_reason: string; p_amount?: number }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      resend_confirmation_email: {
        Args: { user_email: string }
        Returns: Json
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      track_listing_view: {
        Args: {
          p_listing_id: string
          p_viewer_id?: string
          p_ip_address?: unknown
          p_session_id?: string
        }
        Returns: undefined
      }
      validate_coupon_code: {
        Args: { p_code: string; p_user_id: string; p_total_amount: number }
        Returns: {
          is_valid: boolean
          discount_amount: number
          discount_percentage: number
          message: string
        }[]
      }
      validate_social_media_url: {
        Args: { platform: string; url: string }
        Returns: boolean
      }
    }
    Enums: {
      achievement_type:
        | "first_sale"
        | "power_seller"
        | "top_rated"
        | "verified_seller"
        | "social_butterfly"
        | "quick_shipper"
        | "loyal_customer"
        | "trendsetter"
      badge_type:
        | "brand"
        | "top_seller"
        | "verified"
        | "power_seller"
        | "rising_star"
        | "admin"
      discount_type:
        | "percentage"
        | "fixed_amount"
        | "free_shipping"
        | "buy_x_get_y"
      dispute_status:
        | "open"
        | "awaiting_seller_response"
        | "awaiting_buyer_response"
        | "under_review"
        | "escalated"
        | "resolved"
        | "closed"
        | "cancelled"
      dispute_type:
        | "item_not_received"
        | "item_not_as_described"
        | "damaged_item"
        | "counterfeit_item"
        | "unauthorized_transaction"
        | "seller_not_responding"
        | "buyer_not_responding"
        | "payment_issue"
        | "other"
      notification_channel: "in_app" | "email" | "push"
      notification_type:
        | "order_placed"
        | "order_paid"
        | "order_shipped"
        | "order_delivered"
        | "order_cancelled"
        | "new_message"
        | "new_rating"
        | "new_follower"
        | "listing_favorited"
        | "listing_sold"
        | "price_drop"
        | "return_requested"
        | "payment_received"
        | "achievement_earned"
        | "promotion_alert"
      order_status:
        | "pending_payment"
        | "payment_processing"
        | "payment_failed"
        | "paid"
        | "preparing"
        | "shipped"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
        | "refunded"
      payment_method_type:
        | "card"
        | "bank"
        | "paypal"
        | "stripe_link"
        | "apple_pay"
        | "google_pay"
      payment_status:
        | "pending"
        | "processing"
        | "requires_action"
        | "succeeded"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      promotion_target: "all_items" | "category" | "seller" | "specific_items"
      rating_type: "seller" | "buyer"
      resolution_type:
        | "full_refund"
        | "partial_refund"
        | "replacement"
        | "return_and_refund"
        | "keep_item_partial_refund"
        | "no_action"
        | "cancelled_by_buyer"
        | "cancelled_by_seller"
      return_reason:
        | "defective"
        | "not_as_described"
        | "wrong_item"
        | "doesnt_fit"
        | "changed_mind"
        | "damaged_in_shipping"
        | "missing_parts"
        | "quality_issue"
        | "other"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "shipped_back"
        | "received"
        | "inspecting"
        | "refunded"
        | "replaced"
        | "closed"
      shipping_carrier: "ups" | "fedex" | "usps" | "dhl" | "local" | "other"
      tracking_status:
        | "label_created"
        | "picked_up"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "delivery_failed"
        | "returned_to_sender"
      user_role: "user" | "admin" | "moderator"
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
      achievement_type: [
        "first_sale",
        "power_seller",
        "top_rated",
        "verified_seller",
        "social_butterfly",
        "quick_shipper",
        "loyal_customer",
        "trendsetter",
      ],
      badge_type: [
        "brand",
        "top_seller",
        "verified",
        "power_seller",
        "rising_star",
        "admin",
      ],
      discount_type: [
        "percentage",
        "fixed_amount",
        "free_shipping",
        "buy_x_get_y",
      ],
      dispute_status: [
        "open",
        "awaiting_seller_response",
        "awaiting_buyer_response",
        "under_review",
        "escalated",
        "resolved",
        "closed",
        "cancelled",
      ],
      dispute_type: [
        "item_not_received",
        "item_not_as_described",
        "damaged_item",
        "counterfeit_item",
        "unauthorized_transaction",
        "seller_not_responding",
        "buyer_not_responding",
        "payment_issue",
        "other",
      ],
      notification_channel: ["in_app", "email", "push"],
      notification_type: [
        "order_placed",
        "order_paid",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "new_message",
        "new_rating",
        "new_follower",
        "listing_favorited",
        "listing_sold",
        "price_drop",
        "return_requested",
        "payment_received",
        "achievement_earned",
        "promotion_alert",
      ],
      order_status: [
        "pending_payment",
        "payment_processing",
        "payment_failed",
        "paid",
        "preparing",
        "shipped",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      payment_method_type: [
        "card",
        "bank",
        "paypal",
        "stripe_link",
        "apple_pay",
        "google_pay",
      ],
      payment_status: [
        "pending",
        "processing",
        "requires_action",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      promotion_target: ["all_items", "category", "seller", "specific_items"],
      rating_type: ["seller", "buyer"],
      resolution_type: [
        "full_refund",
        "partial_refund",
        "replacement",
        "return_and_refund",
        "keep_item_partial_refund",
        "no_action",
        "cancelled_by_buyer",
        "cancelled_by_seller",
      ],
      return_reason: [
        "defective",
        "not_as_described",
        "wrong_item",
        "doesnt_fit",
        "changed_mind",
        "damaged_in_shipping",
        "missing_parts",
        "quality_issue",
        "other",
      ],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "shipped_back",
        "received",
        "inspecting",
        "refunded",
        "replaced",
        "closed",
      ],
      shipping_carrier: ["ups", "fedex", "usps", "dhl", "local", "other"],
      tracking_status: [
        "label_created",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
        "returned_to_sender",
      ],
      user_role: ["user", "admin", "moderator"],
    },
  },
} as const
