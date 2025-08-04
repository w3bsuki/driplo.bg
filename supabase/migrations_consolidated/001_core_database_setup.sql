-- ================================================
-- DRIPLO MARKETPLACE - COMPLETE DATABASE SETUP
-- Phase 1: Core Database Tables
-- ================================================
-- Run this first in Supabase SQL Editor
-- This creates all core tables with proper relationships

-- ================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================
-- STEP 2: CREATE CORE USER TABLES
-- ================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Verification & Account Type
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_brand BOOLEAN DEFAULT FALSE,
    account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'brand', 'admin')),
    
    -- Brand Fields
    brand_name TEXT,
    brand_bio TEXT,
    brand_website TEXT,
    brand_verified BOOLEAN DEFAULT FALSE,
    brand_verification_date TIMESTAMPTZ,
    
    -- Payment Integration
    stripe_customer_id TEXT,
    stripe_account_id TEXT,
    stripe_account_status TEXT,
    
    -- Onboarding & Setup
    onboarding_completed BOOLEAN DEFAULT FALSE,
    setup_completed BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    language_preference TEXT DEFAULT 'en',
    currency_preference TEXT DEFAULT 'EUR',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_public": true, "show_ratings": true}'::jsonb,
    
    -- Referral System
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    
    -- Statistics
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    seller_rating DECIMAL(3,2),
    buyer_rating DECIMAL(3,2),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    listing_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    
    -- Timestamps
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 3: CREATE PRODUCT RELATED TABLES
-- ================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    
    -- Categories & Brand
    category_id UUID REFERENCES public.categories(id),
    subcategory_id UUID REFERENCES public.categories(id),
    brand_id UUID REFERENCES public.brands(id),
    
    -- Product Details
    condition TEXT CHECK (condition IN ('new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair')),
    size TEXT,
    color TEXT,
    materials TEXT[],
    tags TEXT[],
    
    -- Images
    images TEXT[] NOT NULL,
    thumbnail_url TEXT,
    
    -- Location & Shipping
    location TEXT,
    country TEXT,
    shipping_price DECIMAL(10,2) DEFAULT 0,
    shipping_options JSONB DEFAULT '{"standard": true, "express": false}'::jsonb,
    
    -- Status Flags
    is_sold BOOLEAN DEFAULT FALSE,
    is_reserved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    
    -- Timestamps
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing drafts table
CREATE TABLE IF NOT EXISTS public.listing_drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    draft_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 4: CREATE ORDER & PAYMENT TABLES
-- ================================================

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE,
    
    -- Parties
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    
    -- Payment Details
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_payout DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    
    -- Addresses
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Tracking
    tracking_number TEXT,
    tracking_url TEXT,
    carrier TEXT,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Additional
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment accounts table
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'revolut')),
    account_id TEXT NOT NULL,
    account_status TEXT,
    account_data JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider, account_id)
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE,
    type TEXT NOT NULL,
    last4 TEXT,
    brand TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 5: CREATE MESSAGING TABLES
-- ================================================

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    participant1_unread_count INTEGER DEFAULT 0,
    participant2_unread_count INTEGER DEFAULT 0,
    is_archived_by_participant1 BOOLEAN DEFAULT FALSE,
    is_archived_by_participant2 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id, listing_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    read_at TIMESTAMPTZ,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 6: CREATE SOCIAL FEATURES TABLES
-- ================================================

-- User ratings table
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_type TEXT NOT NULL CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, reviewer_id, review_type)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Follows table (renamed from user_follows to avoid confusion)
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ================================================
-- STEP 7: CREATE CART & WISHLIST TABLES
-- ================================================

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Shopping carts table (for guest/session carts)
CREATE TABLE IF NOT EXISTS public.shopping_carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 8: CREATE NOTIFICATION SYSTEM TABLES
-- ================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 9: CREATE AUTH & SECURITY TABLES
-- ================================================

-- Auth rate limits table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address INET NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMPTZ DEFAULT NOW(),
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth events table
CREATE TABLE IF NOT EXISTS public.auth_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth sessions table
CREATE TABLE IF NOT EXISTS public.auth_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 10: CREATE ANALYTICS TABLES
-- ================================================

-- Listing views table
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats summary table (for caching)
CREATE TABLE IF NOT EXISTS public.user_stats_summary (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_listings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    sold_listings INTEGER DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    avg_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 11: CREATE BRAND & VERIFICATION TABLES
-- ================================================

-- Brand profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    brand_name TEXT NOT NULL,
    business_name TEXT,
    tax_id TEXT,
    vat_number TEXT,
    business_address JSONB,
    business_email TEXT,
    business_phone TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected')),
    verification_date TIMESTAMPTZ,
    verification_documents TEXT[],
    rejection_reason TEXT,
    
    -- Brand Details
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website TEXT,
    established_year INTEGER,
    company_size TEXT,
    
    -- Social & Stats
    social_links JSONB DEFAULT '{}'::jsonb,
    statistics JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media accounts table
CREATE TABLE IF NOT EXISTS public.social_media_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'pinterest', 'linkedin')),
    username TEXT NOT NULL,
    url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('id_verification', 'business_license', 'tax_certificate', 'bank_statement', 'utility_bill', 'other')),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 12: CREATE DISPUTE & REFUND TABLES
-- ================================================

-- Disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    initiated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    evidence_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refund requests table
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    requested_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    stripe_refund_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 13: CREATE ADMIN TABLES
-- ================================================

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 14: CREATE COUPON & PROMOTION TABLES
-- ================================================

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon usage table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_id, order_id)
);

-- ================================================
-- STEP 15: CREATE ACHIEVEMENT & GAMIFICATION TABLES
-- ================================================

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_data JSONB DEFAULT '{}'::jsonb,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- ================================================
-- STEP 16: ADD UPDATED_AT TRIGGERS
-- ================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON public.%I 
            FOR EACH ROW 
            EXECUTE FUNCTION public.update_updated_at_column()',
            t, t);
    END LOOP;
END;
$$;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
-- Phase 1 Complete: All core tables created successfully
-- Next: Run 002_rls_policies.sql to secure your tables