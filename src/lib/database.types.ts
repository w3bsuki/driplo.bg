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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
      auth_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt: string | null
          id: string
          ip_address: unknown
          last_attempt: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          ip_address: unknown
          last_attempt?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_activity: string | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          banner_url: string | null
          brand_name: string
          business_address: Json | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          company_size: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          id: string
          logo_url: string | null
          rejection_reason: string | null
          social_links: Json | null
          statistics: Json | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
          verification_date: string | null
          verification_documents: string[] | null
          verification_status: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          brand_name: string
          business_address?: Json | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          logo_url?: string | null
          rejection_reason?: string | null
          social_links?: Json | null
          statistics?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
          verification_date?: string | null
          verification_documents?: string[] | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          brand_name?: string
          business_address?: Json | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          logo_url?: string | null
          rejection_reason?: string | null
          social_links?: Json | null
          statistics?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
          verification_date?: string | null
          verification_documents?: string[] | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_popular: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_popular?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string | null
          id: string
          listing_id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          listing_id: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          listing_id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
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
          created_at: string | null
          id: string
          is_archived_by_participant1: boolean | null
          is_archived_by_participant2: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          listing_id: string | null
          participant1_id: string
          participant1_unread_count: number | null
          participant2_id: string
          participant2_unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived_by_participant1?: boolean | null
          is_archived_by_participant2?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          listing_id?: string | null
          participant1_id: string
          participant1_unread_count?: number | null
          participant2_id: string
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived_by_participant1?: boolean | null
          is_archived_by_participant2?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          listing_id?: string | null
          participant1_id?: string
          participant1_unread_count?: number | null
          participant2_id?: string
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant2_id_fkey"
            columns: ["participant2_id"]
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
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
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
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount: number | null
          minimum_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          user_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          minimum_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          minimum_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_limit?: number | null
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
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          initiated_by: string
          order_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          initiated_by: string
          order_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          initiated_by?: string
          order_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
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
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          rejection_reason: string | null
          size: number | null
          status: string | null
          type: string
          updated_at: string | null
          url: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          rejection_reason?: string | null
          size?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          url: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          rejection_reason?: string | null
          size?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
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
          draft_data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draft_data: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          draft_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          listing_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          listing_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          listing_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
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
          brand_id: string | null
          category_id: string | null
          color: string | null
          condition: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          images: string[]
          is_archived: boolean | null
          is_draft: boolean | null
          is_featured: boolean | null
          is_reserved: boolean | null
          is_sold: boolean | null
          like_count: number | null
          location: string | null
          materials: string[] | null
          original_price: number | null
          price: number
          quantity: number | null
          save_count: number | null
          seller_id: string
          shipping_options: Json | null
          shipping_price: number | null
          size: string | null
          sold_at: string | null
          status: string | null
          subcategory_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images: string[]
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_reserved?: boolean | null
          is_sold?: boolean | null
          like_count?: number | null
          location?: string | null
          materials?: string[] | null
          original_price?: number | null
          price: number
          quantity?: number | null
          save_count?: number | null
          seller_id: string
          shipping_options?: Json | null
          shipping_price?: number | null
          size?: string | null
          sold_at?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[]
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_reserved?: boolean | null
          is_sold?: boolean | null
          like_count?: number | null
          location?: string | null
          materials?: string[] | null
          original_price?: number | null
          price?: number
          quantity?: number | null
          save_count?: number | null
          seller_id?: string
          shipping_options?: Json | null
          shipping_price?: number | null
          size?: string | null
          sold_at?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
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
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          created_at: string | null
          data: Json | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          billing_address: Json | null
          buyer_id: string
          cancelled_at: string | null
          carrier: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          id: string
          listing_id: string
          metadata: Json | null
          notes: string | null
          order_number: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          platform_fee: number | null
          refunded_at: string | null
          seller_id: string
          seller_payout: number | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string | null
          stripe_charge_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_address?: Json | null
          buyer_id: string
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          listing_id: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          refunded_at?: string | null
          seller_id: string
          seller_payout?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          stripe_charge_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_address?: Json | null
          buyer_id?: string
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          listing_id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          refunded_at?: string | null
          seller_id?: string
          seller_payout?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          stripe_charge_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_data: Json | null
          account_id: string
          account_status: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_data?: Json | null
          account_id: string
          account_status?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_data?: Json | null
          account_id?: string
          account_status?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
          stripe_payment_method_id: string | null
          type: string
          updated_at: string | null
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
          stripe_payment_method_id?: string | null
          type: string
          updated_at?: string | null
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
          stripe_payment_method_id?: string | null
          type?: string
          updated_at?: string | null
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
      profiles: {
        Row: {
          account_status: string | null
          account_type: string | null
          achievements: Json | null
          avatar_url: string | null
          backup_codes: string[] | null
          bio: string | null
          brand_bio: string | null
          brand_mission: string | null
          brand_name: string | null
          brand_onboarding_completed: boolean | null
          brand_story: string | null
          brand_values: string | null
          brand_verification_date: string | null
          brand_verified: boolean | null
          brand_website: string | null
          business_info: Json | null
          buyer_rating: number | null
          buyer_rating_count: number | null
          company_name: string | null
          company_registration_number: string | null
          completion_percentage: number | null
          created_at: string | null
          currency_preference: string | null
          date_of_birth: string | null
          email: string | null
          email_notifications_enabled: boolean | null
          follower_count: number | null
          following_count: number | null
          full_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          is_brand: boolean | null
          is_verified: boolean | null
          language_preference: string | null
          last_active: string | null
          listing_count: number | null
          location: string | null
          needs_username_setup: boolean | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          payment_methods: Json | null
          paypal_tag: string | null
          phone: string | null
          privacy_settings: Json | null
          push_notifications_enabled: boolean | null
          referral_code: string | null
          referred_by: string | null
          response_time_hours: number | null
          revolut_tag: string | null
          security_questions: Json | null
          seller_level: number | null
          seller_rating: number | null
          setup_completed: boolean | null
          sms_notifications_enabled: boolean | null
          social_links: Json | null
          sold_count: number | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_customer_id: string | null
          suspension_date: string | null
          suspension_lifted_date: string | null
          suspension_reason: string | null
          tax_info: Json | null
          total_earnings: number | null
          total_purchases: number | null
          total_sales: number | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          username: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          achievements?: Json | null
          avatar_url?: string | null
          backup_codes?: string[] | null
          bio?: string | null
          brand_bio?: string | null
          brand_mission?: string | null
          brand_name?: string | null
          brand_onboarding_completed?: boolean | null
          brand_story?: string | null
          brand_values?: string | null
          brand_verification_date?: string | null
          brand_verified?: boolean | null
          brand_website?: string | null
          business_info?: Json | null
          buyer_rating?: number | null
          buyer_rating_count?: number | null
          company_name?: string | null
          company_registration_number?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          currency_preference?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_admin?: boolean | null
          is_brand?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_active?: string | null
          listing_count?: number | null
          location?: string | null
          needs_username_setup?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          payment_methods?: Json | null
          paypal_tag?: string | null
          phone?: string | null
          privacy_settings?: Json | null
          push_notifications_enabled?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          response_time_hours?: number | null
          revolut_tag?: string | null
          security_questions?: Json | null
          seller_level?: number | null
          seller_rating?: number | null
          setup_completed?: boolean | null
          sms_notifications_enabled?: boolean | null
          social_links?: Json | null
          sold_count?: number | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_customer_id?: string | null
          suspension_date?: string | null
          suspension_lifted_date?: string | null
          suspension_reason?: string | null
          tax_info?: Json | null
          total_earnings?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          achievements?: Json | null
          avatar_url?: string | null
          backup_codes?: string[] | null
          bio?: string | null
          brand_bio?: string | null
          brand_mission?: string | null
          brand_name?: string | null
          brand_onboarding_completed?: boolean | null
          brand_story?: string | null
          brand_values?: string | null
          brand_verification_date?: string | null
          brand_verified?: boolean | null
          brand_website?: string | null
          business_info?: Json | null
          buyer_rating?: number | null
          buyer_rating_count?: number | null
          company_name?: string | null
          company_registration_number?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          currency_preference?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_brand?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_active?: string | null
          listing_count?: number | null
          location?: string | null
          needs_username_setup?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          payment_methods?: Json | null
          paypal_tag?: string | null
          phone?: string | null
          privacy_settings?: Json | null
          push_notifications_enabled?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          response_time_hours?: number | null
          revolut_tag?: string | null
          security_questions?: Json | null
          seller_level?: number | null
          seller_rating?: number | null
          setup_completed?: boolean | null
          sms_notifications_enabled?: boolean | null
          social_links?: Json | null
          sold_count?: number | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_customer_id?: string | null
          suspension_date?: string | null
          suspension_lifted_date?: string | null
          suspension_reason?: string | null
          tax_info?: Json | null
          total_earnings?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          vat_number?: string | null
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
      refund_requests: {
        Row: {
          approved_amount: number | null
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_amount: number
          requested_by: string
          status: string | null
          stripe_refund_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_amount: number
          requested_by: string
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_amount?: number
          requested_by?: string
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
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
      shopping_carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          items: Json | null
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          items?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          items?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_accounts: {
        Row: {
          created_at: string | null
          follower_count: number | null
          id: string
          metadata: Json | null
          platform: string
          updated_at: string | null
          url: string | null
          user_id: string
          username: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          platform: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          username: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          platform?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          username?: string
          verified?: boolean | null
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
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_name: string
          achievement_type: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_name: string
          achievement_type: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_name?: string
          achievement_type?: string
          id?: string
          unlocked_at?: string | null
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
      user_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          order_id: string
          rating: number
          review_text: string | null
          review_type: string
          reviewed_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id: string
          rating: number
          review_text?: string | null
          review_type: string
          reviewed_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string
          rating?: number
          review_text?: string | null
          review_type?: string
          reviewed_id?: string
          reviewer_id?: string
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
            foreignKeyName: "user_ratings_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats_summary: {
        Row: {
          active_listings: number | null
          avg_rating: number | null
          created_at: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          last_calculated: string | null
          sold_listings: number | null
          total_listings: number | null
          total_purchases: number | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          active_listings?: number | null
          avg_rating?: number | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          id: string
          last_calculated?: string | null
          sold_listings?: number | null
          total_listings?: number | null
          total_purchases?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          active_listings?: number | null
          avg_rating?: number | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          last_calculated?: string | null
          sold_listings?: number | null
          total_listings?: number | null
          total_purchases?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_summary_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web_vitals: {
        Row: {
          connection_info: Json | null
          created_at: string | null
          delta: number
          id: string
          metric_id: string
          name: string
          rating: string
          timestamp: string
          url: string
          user_id: string | null
          value: number
        }
        Insert: {
          connection_info?: Json | null
          created_at?: string | null
          delta: number
          id?: string
          metric_id: string
          name: string
          rating: string
          timestamp: string
          url: string
          user_id?: string | null
          value: number
        }
        Update: {
          connection_info?: Json | null
          created_at?: string | null
          delta?: number
          id?: string
          metric_id?: string
          name?: string
          rating?: string
          timestamp?: string
          url?: string
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "web_vitals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      calculate_profile_completion: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: number
      }
      check_auth_rate_limit: {
        Args: {
          p_action: string
          p_ip_address: unknown
          p_user_id?: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      cleanup_auth_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      complete_user_onboarding: {
        Args: {
          p_user_id: string
          p_username: string
          p_full_name: string
          p_account_type?: string
        }
        Returns: boolean
      }
      create_order_with_payment: {
        Args: {
          p_buyer_id: string
          p_listing_id: string
          p_amount: number
          p_shipping_amount?: number
          p_payment_intent_id?: string
          p_shipping_address?: Json
        }
        Returns: string
      }
      debug_listing_insert: {
        Args: { p_user_id: string }
        Returns: {
          current_auth_uid: string
          provided_user_id: string
          auth_matches: boolean
          profile_exists: boolean
        }[]
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_brand_statistics: {
        Args: { p_brand_id: string }
        Returns: Json
      }
      get_or_create_conversation: {
        Args: { p_user1_id: string; p_user2_id: string; p_listing_id?: string }
        Returns: string
      }
      get_recommended_listings: {
        Args: { p_user_id?: string; p_category_id?: string; p_limit?: number }
        Returns: {
          id: string
          title: string
          price: number
          thumbnail_url: string
          created_at: string
        }[]
      }
      get_seller_analytics: {
        Args: { p_seller_id: string }
        Returns: Json
      }
      get_seller_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_sellers: {
        Args: { time_period?: string; result_limit?: number }
        Returns: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          seller_rating: number
          total_sales: number
          total_earnings: number
          listings_count: number
          buyer_rating_count: number
          seller_level: number
          created_at: string
          updated_at: string
          account_type: string
        }[]
      }
      get_user_onboarding_status: {
        Args: { user_id: string }
        Returns: {
          needs_onboarding: boolean
          onboarding_step: number
          completion_percentage: number
          needs_username_setup: boolean
          setup_completed: boolean
        }[]
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      log_auth_event: {
        Args: {
          p_event_type: string
          p_user_id?: string
          p_event_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_success?: boolean
          p_error_message?: string
        }
        Returns: string
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      reset_user_onboarding: {
        Args: { user_id: string }
        Returns: boolean
      }
      track_listing_view: {
        Args: {
          p_listing_id: string
          p_viewer_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_referrer?: string
          p_session_id?: string
        }
        Returns: undefined
      }
      update_onboarding_step: {
        Args: { user_id: string; step: number; step_data?: Json }
        Returns: boolean
      }
      update_user_stats: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      user_needs_onboarding: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_coupon_code: {
        Args: { p_code: string; p_user_id: string; p_order_amount: number }
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