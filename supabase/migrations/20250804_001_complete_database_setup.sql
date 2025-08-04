-- COMPLETE DATABASE SETUP FOR DRIPLO MARKETPLACE
-- Run this in Supabase SQL Editor

-- ================================================
-- STEP 1: ENABLE EXTENSIONS
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================
-- STEP 2: CREATE CORE TABLES
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
    gender TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_brand BOOLEAN DEFAULT FALSE,
    brand_name TEXT,
    brand_bio TEXT,
    brand_website TEXT,
    stripe_customer_id TEXT,
    stripe_account_id TEXT,
    stripe_account_status TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    setup_completed BOOLEAN DEFAULT FALSE,
    account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'brand', 'admin')),
    language_preference TEXT DEFAULT 'en',
    currency_preference TEXT DEFAULT 'EUR',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_public": true, "show_ratings": true}'::jsonb,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    seller_rating DECIMAL(3,2),
    buyer_rating DECIMAL(3,2),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    listing_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    category_id UUID REFERENCES public.categories(id),
    subcategory_id UUID REFERENCES public.categories(id),
    brand_id UUID REFERENCES public.brands(id),
    condition TEXT CHECK (condition IN ('new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair')),
    size TEXT,
    color TEXT,
    materials TEXT[],
    tags TEXT[],
    images TEXT[] NOT NULL,
    thumbnail_url TEXT,
    location TEXT,
    country TEXT,
    shipping_price DECIMAL(10,2) DEFAULT 0,
    shipping_options JSONB DEFAULT '{"standard": true, "express": false}'::jsonb,
    is_sold BOOLEAN DEFAULT FALSE,
    is_reserved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_payout DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    tracking_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews/Ratings table
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_type TEXT NOT NULL CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, reviewer_id, review_type)
);

-- Favorites/Saved items table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
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

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing views analytics table
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    business_name TEXT,
    tax_id TEXT,
    address JSONB,
    verified BOOLEAN DEFAULT FALSE,
    verification_documents TEXT[],
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

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_data JSONB,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- Social media accounts table
CREATE TABLE IF NOT EXISTS public.social_media_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- ================================================
-- STEP 3: CREATE TRIGGER FUNCTIONS
-- ================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
        UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update profile stats function
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'listings' THEN
        UPDATE profiles
        SET listing_count = (SELECT COUNT(*) FROM listings WHERE user_id = NEW.user_id AND NOT is_archived)
        WHERE id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'follows' THEN
        UPDATE profiles
        SET follower_count = (SELECT COUNT(*) FROM follows WHERE following_id = NEW.following_id)
        WHERE id = NEW.following_id;
        
        UPDATE profiles
        SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = NEW.follower_id)
        WHERE id = NEW.follower_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- STEP 4: CREATE TRIGGERS
-- ================================================

-- Profile creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Profile stats triggers
CREATE TRIGGER update_profile_listing_count AFTER INSERT OR DELETE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

CREATE TRIGGER update_profile_follow_count AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- ================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 6: CREATE INDEXES
-- ================================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_brand ON public.profiles(is_brand);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified);

-- Listings indexes
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_brand_id ON public.listings(brand_id);
CREATE INDEX idx_listings_is_sold ON public.listings(is_sold);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_price ON public.listings(price);

-- Orders indexes
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_listing_id ON public.orders(listing_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Other indexes
CREATE INDEX idx_favorites_user_listing ON public.favorites(user_id, listing_id);
CREATE INDEX idx_follows_follower_following ON public.follows(follower_id, following_id);
CREATE INDEX idx_cart_items_user_listing ON public.cart_items(user_id, listing_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_auth_rate_limits_ip ON public.auth_rate_limits(ip_address);
CREATE INDEX idx_listing_views_listing ON public.listing_views(listing_id);