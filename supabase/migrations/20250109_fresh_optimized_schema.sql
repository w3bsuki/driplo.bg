-- =========================================================================
-- DRIPLO FRESH DATABASE - OPTIMIZED SCHEMA
-- =========================================================================
-- Clean, optimized migrations for a NEW Supabase project
-- Consolidates 63 migrations into one clean schema
-- Fixes all performance and security issues
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- CORE USER SYSTEM
-- =========================================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    phone TEXT,
    
    -- Preferences
    preferred_currency TEXT DEFAULT 'BGN',
    preferred_language TEXT DEFAULT 'bg',
    
    -- Payment
    has_payment_account BOOLEAN DEFAULT FALSE,
    payment_account_id TEXT,
    payment_type TEXT CHECK (payment_type IN ('bank_account', 'paypal', 'stripe')),
    payment_details JSONB DEFAULT '{}',
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_current_step INTEGER DEFAULT 1,
    
    -- Seller stats (denormalized for performance)
    is_seller BOOLEAN DEFAULT FALSE,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- MARKETPLACE CORE
-- =========================================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings (main product table)
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core info
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    currency TEXT DEFAULT 'BGN',
    condition TEXT NOT NULL CHECK (condition IN ('new_with_tags', 'like_new', 'very_good', 'good', 'fair')),
    size TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'reserved', 'deleted')),
    
    -- Relationships
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    brand TEXT, -- Fallback for unverified brands
    
    -- Media
    images TEXT[] DEFAULT '{}',
    primary_image TEXT,
    video_url TEXT,
    
    -- Details
    color TEXT,
    material TEXT,
    measurements JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Stats (denormalized for performance)
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- SEO
    slug TEXT UNIQUE,
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ
);

-- =========================================================================
-- TRANSACTIONS
-- =========================================================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
    
    -- Parties
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')),
    
    -- Money
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BGN',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    
    -- Shipping
    shipping_address JSONB,
    shipping_method TEXT,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tracking_number TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- =========================================================================
-- SOCIAL FEATURES
-- =========================================================================

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- User follows
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- User ratings
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_id, order_id)
);

-- =========================================================================
-- MESSAGING
-- =========================================================================

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1, participant2, listing_id),
    CHECK (participant1 != participant2)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'message', 'listing', 'follow', 'review', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ANALYTICS
-- =========================================================================

-- Listing views
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Web vitals
CREATE TABLE IF NOT EXISTS web_vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,3),
    page_path TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- OPTIMIZED INDEXES
-- =========================================================================

-- Foreign key indexes (CRITICAL for performance)
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_subcategory ON listings(subcategory_id) WHERE subcategory_id IS NOT NULL;
CREATE INDEX idx_listings_brand ON listings(brand_id) WHERE brand_id IS NOT NULL;
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_listing ON orders(listing_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_listing_views_listing ON listing_views(listing_id);

-- Composite indexes for common queries
CREATE INDEX idx_listings_active_recent ON listings(created_at DESC) 
    WHERE status = 'active';
CREATE INDEX idx_listings_seller_active ON listings(seller_id, status) 
    WHERE status = 'active';
CREATE INDEX idx_listings_category_active ON listings(category_id, created_at DESC) 
    WHERE status = 'active';
CREATE INDEX idx_orders_buyer_recent ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller_recent ON orders(seller_id, created_at DESC);
CREATE INDEX idx_messages_conversation_recent ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON user_notifications(user_id, created_at DESC) 
    WHERE is_read = FALSE;

-- Text search indexes
CREATE INDEX idx_listings_search ON listings USING gin(
    to_tsvector('simple', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, ''))
);
CREATE INDEX idx_profiles_username ON profiles(lower(username));

-- =========================================================================
-- RLS POLICIES (OPTIMIZED)
-- =========================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories & Brands (public read)
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (true);

-- Listings
CREATE POLICY "listings_public_active" ON listings FOR SELECT 
    USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "listings_own_insert" ON listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "listings_own_update" ON listings FOR UPDATE 
    USING (auth.uid() = seller_id);
CREATE POLICY "listings_own_delete" ON listings FOR DELETE 
    USING (auth.uid() = seller_id);

-- Orders
CREATE POLICY "orders_participants" ON orders FOR SELECT 
    USING (auth.uid() IN (buyer_id, seller_id));
CREATE POLICY "orders_buyer_insert" ON orders FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_participants_update" ON orders FOR UPDATE 
    USING (auth.uid() IN (buyer_id, seller_id));

-- Favorites
CREATE POLICY "favorites_own" ON favorites FOR ALL 
    USING (auth.uid() = user_id);

-- Conversations & Messages
CREATE POLICY "conversations_participants" ON conversations FOR SELECT 
    USING (auth.uid() IN (participant1, participant2));
CREATE POLICY "messages_participants" ON messages FOR SELECT 
    USING (auth.uid() IN (sender_id, recipient_id));
CREATE POLICY "messages_send" ON messages FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

-- Notifications
CREATE POLICY "notifications_own" ON user_notifications FOR ALL 
    USING (auth.uid() = user_id);

-- Ratings & Follows (public read)
CREATE POLICY "ratings_public_read" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "ratings_reviewer_insert" ON user_ratings FOR INSERT 
    WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "follows_public_read" ON user_follows FOR SELECT USING (true);
CREATE POLICY "follows_own_manage" ON user_follows FOR ALL 
    USING (auth.uid() = follower_id);

-- Analytics (write-only)
CREATE POLICY "listing_views_insert" ON listing_views FOR INSERT WITH CHECK (true);
CREATE POLICY "web_vitals_insert" ON web_vitals FOR INSERT WITH CHECK (true);

-- =========================================================================
-- FUNCTIONS & TRIGGERS
-- =========================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update listing stats on favorite
CREATE OR REPLACE FUNCTION update_listing_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings SET like_count = like_count + 1 WHERE id = NEW.listing_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listings SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.listing_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER favorites_update_stats
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_listing_stats();

-- Update seller stats on order completion
CREATE OR REPLACE FUNCTION update_seller_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE profiles
        SET 
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.total_amount
        WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER orders_update_seller_stats
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_seller_stats();

-- =========================================================================
-- INITIAL DATA
-- =========================================================================

INSERT INTO categories (name, slug, display_order) VALUES
    ('Women', 'women', 1),
    ('Men', 'men', 2),
    ('Kids', 'kids', 3),
    ('Accessories', 'accessories', 4),
    ('Shoes', 'shoes', 5),
    ('Bags', 'bags', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, is_verified) VALUES
    ('Gucci', 'gucci', true),
    ('Louis Vuitton', 'louis-vuitton', true),
    ('Chanel', 'chanel', true),
    ('Prada', 'prada', true),
    ('Versace', 'versace', true),
    ('Balenciaga', 'balenciaga', true),
    ('Dior', 'dior', true),
    ('Hermès', 'hermes', true),
    ('Saint Laurent', 'saint-laurent', true),
    ('Burberry', 'burberry', true)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- STORAGE SETUP
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('listings', 'listings', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('brands', 'brands', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "storage_avatars_public" ON storage.objects FOR SELECT 
    USING (bucket_id = 'avatars');
CREATE POLICY "storage_avatars_upload" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_listings_public" ON storage.objects FOR SELECT 
    USING (bucket_id = 'listings');
CREATE POLICY "storage_listings_upload" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'listings' AND auth.uid() IS NOT NULL);

-- =========================================================================
-- REALTIME
-- =========================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- =========================================================================
-- GRANTS
-- =========================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON categories, brands, listings TO anon;
GRANT INSERT ON listing_views, web_vitals TO anon;