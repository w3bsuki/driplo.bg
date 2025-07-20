# CLAUDE CODE: EXECUTE THIS SUPABASE MIGRATION NOW

## YOUR MISSION
You are Claude Code. Execute this ENTIRE migration guide using Supabase MCP tools. Start immediately with Phase 1 and continue through all 17 phases. Do NOT stop until complete or encountering an error.

## EXECUTION INSTRUCTIONS
1. Use `mcp__supabase__apply_migration` for EACH phase
2. Run verification queries with `mcp__supabase__execute_sql` after each phase
3. If ANY error occurs, STOP and report the exact error
4. Create a todo list to track your progress through all phases
5. Mark each phase complete as you finish it

## CRITICAL REQUIREMENTS
- ✅ Execute phases IN ORDER (1-17)
- ✅ Verify each phase before proceeding
- ✅ Report any errors immediately
- ❌ Do NOT skip verification steps
- ❌ Do NOT proceed if verification fails

## MCP TOOL USAGE
```
For migrations: mcp__supabase__apply_migration
For queries: mcp__supabase__execute_sql
For security check: mcp__supabase__get_advisors
```

## START NOW WITH PHASE 1

## Phase 1: Extensions and Base Setup

### Best Practices
- Always create extensions BEFORE creating tables that depend on them
- Use `IF NOT EXISTS` to make migrations idempotent
- Order matters: uuid-ossp must be created before any UUID columns

### Avoid These Mistakes
- ❌ Creating tables before required extensions
- ❌ Using gen_random_uuid() before creating pgcrypto
- ❌ Forgetting to enable pg_trgm for text search

### Execute Migration

```sql
-- Migration: 01_extensions_and_base_setup
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption
```

### Verification
```sql
SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm', 'pgcrypto');
-- Should return 3 rows
```

## Phase 2: Custom Types (Enums)

### Best Practices
- Create all custom types before tables that reference them
- Use descriptive enum values that won't need changing
- Consider future extensibility when defining enums

### Avoid These Mistakes
- ❌ Creating tables before their enum dependencies
- ❌ Using CHECK constraints instead of enums for fixed sets
- ❌ Making enum values too restrictive

### Execute Migration

```sql
-- Migration: 02_custom_types_enums
-- Order Status
CREATE TYPE order_status AS ENUM (
    'pending_payment', 'payment_processing', 'payment_failed', 'paid',
    'preparing', 'shipped', 'in_transit', 'delivered', 'completed',
    'cancelled', 'refunded'
);

-- Payment Status
CREATE TYPE payment_status AS ENUM (
    'pending', 'processing', 'requires_action', 'succeeded',
    'failed', 'cancelled', 'refunded', 'partially_refunded'
);

-- Payment Method Types
CREATE TYPE payment_method_type AS ENUM (
    'card', 'bank', 'paypal', 'stripe_link', 'apple_pay', 'google_pay'
);

-- Notification Types
CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_paid', 'order_shipped', 'order_delivered',
    'order_cancelled', 'new_message', 'new_rating', 'new_follower',
    'listing_favorited', 'listing_sold', 'price_drop', 'return_requested',
    'payment_received', 'achievement_earned', 'promotion_alert'
);

-- Dispute Status
CREATE TYPE dispute_status AS ENUM (
    'open', 'awaiting_seller_response', 'awaiting_buyer_response',
    'under_review', 'escalated', 'resolved', 'closed', 'cancelled'
);

-- Dispute Types
CREATE TYPE dispute_type AS ENUM (
    'item_not_received', 'item_not_as_described', 'damaged_item',
    'counterfeit_item', 'unauthorized_transaction', 'seller_not_responding',
    'buyer_not_responding', 'payment_issue', 'other'
);

-- Return Status
CREATE TYPE return_status AS ENUM (
    'requested', 'approved', 'rejected', 'shipped_back',
    'received', 'inspecting', 'refunded', 'replaced', 'closed'
);

-- Return Reasons
CREATE TYPE return_reason AS ENUM (
    'defective', 'not_as_described', 'wrong_item', 'doesnt_fit',
    'changed_mind', 'damaged_in_shipping', 'missing_parts',
    'quality_issue', 'other'
);

-- Shipping Carriers
CREATE TYPE shipping_carrier AS ENUM (
    'ups', 'fedex', 'usps', 'dhl', 'local', 'other'
);

-- Tracking Status
CREATE TYPE tracking_status AS ENUM (
    'label_created', 'picked_up', 'in_transit', 'out_for_delivery',
    'delivered', 'delivery_failed', 'returned_to_sender'
);

-- Discount Types
CREATE TYPE discount_type AS ENUM (
    'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
);

-- Promotion Targets
CREATE TYPE promotion_target AS ENUM (
    'all_items', 'category', 'seller', 'specific_items'
);

-- Rating Types
CREATE TYPE rating_type AS ENUM ('seller', 'buyer');

-- Resolution Types
CREATE TYPE resolution_type AS ENUM (
    'full_refund', 'partial_refund', 'replacement', 'return_and_refund',
    'keep_item_partial_refund', 'no_action', 'cancelled_by_buyer',
    'cancelled_by_seller'
);

-- Achievement Types
CREATE TYPE achievement_type AS ENUM (
    'first_sale', 'power_seller', 'top_rated', 'verified_seller',
    'social_butterfly', 'quick_shipper', 'loyal_customer', 'trendsetter'
);

-- Notification Channels
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');

-- User Roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
```

### Verification
```sql
SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace;
-- Should return all custom types
```

## Phase 3: Core User Tables

### Best Practices
- Always reference auth.users for user relationships
- Include proper indexes on foreign keys and commonly queried columns
- Set appropriate default values and constraints

### Avoid These Mistakes
- ❌ Creating duplicate user tables instead of extending auth.users
- ❌ Forgetting to create indexes on foreign keys
- ❌ Missing ON DELETE CASCADE for user-related data

### Execute Migration

```sql
-- Migration: 03_core_user_tables
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    avatar_urls JSONB, -- Responsive image URLs {thumb, small, medium, large}
    cover_urls JSONB, -- Responsive image URLs {thumb, small, medium, large}
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    location JSONB DEFAULT '{}',
    is_seller BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    role user_role DEFAULT 'user',
    account_type VARCHAR(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'brand')),
    brand_name VARCHAR(100),
    brand_description TEXT,
    brand_logo_url TEXT,
    brand_size VARCHAR(20) CHECK (brand_size IN ('individual', 'small', 'medium', 'large', 'enterprise')),
    badges TEXT[] DEFAULT '{}',
    total_sales INTEGER DEFAULT 0,
    seller_rating DECIMAL(3,2),
    seller_rating_count INTEGER DEFAULT 0,
    setup_completed BOOLEAN DEFAULT false,
    setup_started_at TIMESTAMPTZ,
    setup_completed_at TIMESTAMPTZ,
    avatar_style VARCHAR(50) DEFAULT 'avataaars',
    avatar_seed TEXT,
    custom_avatar_url TEXT,
    stripe_customer_id VARCHAR(255),
    stripe_account_id VARCHAR(255),
    settings JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_seller ON profiles(is_seller) WHERE is_seller = true;
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_avatar_urls ON profiles USING gin(avatar_urls);
CREATE INDEX idx_profiles_cover_urls ON profiles USING gin(cover_urls);
CREATE INDEX idx_profiles_role ON profiles(role) WHERE role != 'user';

-- Auth sessions
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    remember_me BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for auth_sessions
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- Login history
CREATE TABLE auth_login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    failure_reason TEXT
);

-- Index for auth_login_history
CREATE INDEX idx_auth_login_history_user_id ON auth_login_history(user_id);
CREATE INDEX idx_auth_login_history_login_at ON auth_login_history(login_at DESC);
```

### Verification
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'auth_sessions', 'auth_login_history');
-- Should return 3 rows
```

## Phase 4: Onboarding and Brand Tables

### Best Practices
- Design onboarding tables to track user progress
- Include verification workflows for brand accounts
- Plan for admin approval processes

### Avoid These Mistakes
- ❌ Not tracking onboarding completion steps
- ❌ Missing unique constraints on user/step combinations
- ❌ Forgetting admin audit trails

### Execute Migration

```sql
-- Migration: 04_onboarding_and_brand_tables
-- Profile setup progress tracking
CREATE TABLE profile_setup_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    step_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, step_name)
);

-- Indexes for profile_setup_progress
CREATE INDEX idx_profile_setup_progress_user_id ON profile_setup_progress(user_id);

-- Brand verification requests
CREATE TABLE brand_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_name TEXT NOT NULL,
    brand_category TEXT NOT NULL,
    business_registration_number TEXT,
    tax_id TEXT,
    documents JSONB DEFAULT '[]',
    social_media_accounts JSONB DEFAULT '{}',
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'more_info_needed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for brand_verification_requests
CREATE INDEX idx_brand_verification_status ON brand_verification_requests(verification_status);

-- Social media accounts
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'pinterest', 'website')),
    username TEXT NOT NULL,
    url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_data JSONB,
    followers_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Indexes for social_media_accounts
CREATE INDEX idx_social_media_user_id ON social_media_accounts(user_id);

-- Admin approvals tracking
CREATE TABLE admin_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type TEXT NOT NULL CHECK (request_type IN ('brand_verification', 'product_approval', 'user_ban', 'user_promotion')),
    request_id UUID NOT NULL,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_info')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin_approvals
CREATE INDEX idx_admin_approvals_request ON admin_approvals(request_type, request_id);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profile_setup_progress', 'brand_verification_requests', 'social_media_accounts', 'admin_approvals');
-- Should return 4
```

## Phase 5: Product and Listing Tables

### Best Practices
- Use JSONB for flexible image storage with responsive URLs
- Include proper constraints for business logic
- Design for scalability with proper indexing

### Avoid These Mistakes
- ❌ Storing images as TEXT instead of JSONB for responsive URLs
- ❌ Missing GIN indexes on JSONB columns
- ❌ Not including slug for SEO-friendly URLs

### Execute Migration

```sql
-- Migration: 05_product_and_listing_tables
-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) DEFAULT '📦',
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    display_order INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    icon_url TEXT
);

-- Indexes for categories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    condition VARCHAR(20) DEFAULT 'new',
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    images JSONB DEFAULT '[]',
    image_urls JSONB DEFAULT '[]', -- Responsive image URLs array
    video_url TEXT,
    location JSONB DEFAULT '{}',
    shipping_info JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for listings
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_title_search ON listings USING gin(to_tsvector('english', title));
CREATE INDEX idx_listings_image_urls ON listings USING gin(image_urls);

-- Product variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product_variants
CREATE INDEX idx_product_variants_listing_id ON product_variants(listing_id);
CREATE UNIQUE INDEX idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;

-- Favorites
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'listings', 'product_variants', 'favorites');
-- Should return 4
```

## Phase 6: Shopping and Order Tables

### Best Practices
- Design for transactional integrity
- Include proper status tracking
- Plan for order lifecycle management

### Avoid These Mistakes
- ❌ Not tracking order status history
- ❌ Missing foreign key constraints
- ❌ Forgetting to handle cart expiration

### Execute Migration

```sql
-- Migration: 06_shopping_and_order_tables
-- Shopping carts
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Cart items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE
);

-- Indexes for cart_items
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE UNIQUE INDEX idx_cart_items_unique ON cart_items(cart_id, listing_id, variant_id);

-- Shipping addresses (moved here as orders depend on it)
CREATE TABLE shipping_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for shipping_addresses
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX idx_shipping_addresses_is_default ON shipping_addresses(is_default);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    status order_status NOT NULL DEFAULT 'pending_payment',
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address_id UUID REFERENCES shipping_addresses(id),
    billing_address_id UUID REFERENCES shipping_addresses(id),
    payment_method_id UUID, -- Will reference payment_methods table
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Indexes for orders
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_listing_id ON order_items(listing_id);

-- Order status history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for order_status_history
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Order tracking
CREATE TABLE order_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier shipping_carrier NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    tracking_url TEXT,
    status tracking_status DEFAULT 'label_created',
    last_update TIMESTAMPTZ DEFAULT NOW(),
    events JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Index for order_tracking
CREATE INDEX idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX idx_order_tracking_tracking_number ON order_tracking(tracking_number);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('shopping_carts', 'cart_items', 'shipping_addresses', 'orders', 'order_items', 'order_status_history', 'order_tracking');
-- Should return 7
```

## Phase 7: Payment Tables

### Best Practices
- Separate payment concerns (accounts, methods, transactions)
- Store Stripe IDs for integration
- Track payment history comprehensively

### Avoid These Mistakes
- ❌ Storing sensitive payment data directly
- ❌ Not tracking payment status changes
- ❌ Missing webhook event tracking

### Execute Migration

```sql
-- Migration: 07_payment_tables
-- Payment accounts (for sellers)
CREATE TABLE payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_account_id VARCHAR(255) UNIQUE,
    account_type VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    capabilities JSONB DEFAULT '{}',
    requirements JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment methods (for buyers)
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    stripe_payment_method_id VARCHAR(255),
    last4 VARCHAR(4),
    brand VARCHAR(50),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_methods
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

-- Add foreign key to orders table
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_payment_method 
FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'pending',
    processor VARCHAR(50) NOT NULL,
    processor_transaction_id VARCHAR(255),
    processor_response JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_transactions
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_processor_id ON payment_transactions(processor_transaction_id);

-- Store credits
CREATE TABLE store_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    reason TEXT,
    expires_at TIMESTAMPTZ,
    used_amount DECIMAL(10,2) DEFAULT 0 CHECK (used_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Index for store_credits
CREATE INDEX idx_store_credits_user_id ON store_credits(user_id);
CREATE INDEX idx_store_credits_expires_at ON store_credits(expires_at);

-- Stripe webhook events
CREATE TABLE stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for stripe_webhook_events
CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events(type);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- Legacy transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_accounts', 'payment_methods', 'payment_transactions', 'store_credits', 'stripe_webhook_events', 'transactions');
-- Should return 6
```

## Phase 8: Communication Tables

### Best Practices
- Design for real-time messaging capabilities
- Include unread counts for better UX
- Plan for dispute resolution workflows

### Avoid These Mistakes
- ❌ Not indexing conversation lookups
- ❌ Missing archival functionality
- ❌ Forgetting notification preferences

### Execute Migration

```sql
-- Migration: 08_communication_tables
-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    buyer_unread_count INTEGER DEFAULT 0,
    seller_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_by_buyer BOOLEAN DEFAULT false,
    archived_by_seller BOOLEAN DEFAULT false,
    UNIQUE(listing_id, buyer_id, seller_id)
);

-- Indexes for conversations
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_user_id UUID REFERENCES profiles(id),
    related_order_id UUID REFERENCES orders(id),
    related_listing_id UUID REFERENCES listings(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    initiated_by UUID NOT NULL REFERENCES profiles(id),
    respondent_id UUID NOT NULL REFERENCES profiles(id),
    type dispute_type NOT NULL,
    status dispute_status DEFAULT 'open',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    resolution resolution_type,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes for disputes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_initiated_by ON disputes(initiated_by);

-- Dispute messages
CREATE TABLE dispute_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_system_message BOOLEAN DEFAULT false,
    is_staff_message BOOLEAN DEFAULT false,
    is_private_note BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for dispute_messages
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'notifications', 'disputes', 'dispute_messages');
-- Should return 5
```

## Phase 9: Shipping and Returns Tables

### Best Practices
- Track shipping lifecycle comprehensively
- Include return workflow states
- Plan for label generation

### Avoid These Mistakes
- ❌ Not tracking shipping events
- ❌ Missing return authorization
- ❌ Forgetting refund tracking

### Execute Migration

```sql
-- Migration: 09_shipping_and_returns_tables
-- Shipping labels
CREATE TABLE shipping_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier shipping_carrier NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    label_url TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Returns
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    requested_by UUID NOT NULL REFERENCES profiles(id),
    reason return_reason NOT NULL,
    status return_status DEFAULT 'requested',
    description TEXT,
    photos JSONB DEFAULT '[]',
    return_shipping_label TEXT,
    refund_amount DECIMAL(10,2),
    replacement_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes for returns
CREATE INDEX idx_returns_order_id ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(status);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('shipping_labels', 'returns');
-- Should return 2
```

## Phase 10: Marketing Tables

### Best Practices
- Design flexible coupon system
- Track usage and effectiveness
- Include social features

### Avoid These Mistakes
- ❌ Not validating coupon usage limits
- ❌ Missing expiration handling
- ❌ Forgetting usage tracking

### Execute Migration

```sql
-- Migration: 10_marketing_tables
-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    buy_quantity INTEGER,
    get_quantity INTEGER,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    target_type promotion_target DEFAULT 'all_items',
    seller_id UUID REFERENCES profiles(id),
    category_ids UUID[] DEFAULT '{}',
    listing_ids UUID[] DEFAULT '{}',
    excluded_listing_ids UUID[] DEFAULT '{}',
    new_users_only BOOLEAN DEFAULT false,
    user_ids UUID[] DEFAULT '{}',
    minimum_account_age_days INTEGER,
    can_stack BOOLEAN DEFAULT false,
    total_discount_given DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- Coupon usage
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    order_amount DECIMAL(10,2),
    is_successful BOOLEAN DEFAULT true,
    failure_reason TEXT,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for coupon_usage
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);

-- User follows
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes for user_follows
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- User ratings
CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    rater_user_id UUID NOT NULL REFERENCES profiles(id),
    rated_user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    type rating_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, rater_user_id, type)
);

-- Indexes for user_ratings
CREATE INDEX idx_user_ratings_rated_user ON user_ratings(rated_user_id);
CREATE INDEX idx_user_ratings_order ON user_ratings(order_id);

-- User stats summary (materialized view alternative)
CREATE TABLE user_stats_summary (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2),
    response_time_hours DECIMAL(5,2),
    ship_time_hours DECIMAL(5,2),
    last_active_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coupons', 'coupon_usage', 'user_follows', 'user_ratings', 'user_stats_summary');
-- Should return 5
```

## Phase 11: Monitoring Tables

### Best Practices
- Include monitoring for production debugging
- Track admin actions for audit trails
- Plan for performance monitoring

### Avoid These Mistakes
- ❌ Exposing monitoring tables via API
- ❌ Not indexing query logs
- ❌ Missing audit trails

### Execute Migration

```sql
-- Migration: 11_monitoring_tables
-- Active user sessions (for tracking)
CREATE TABLE active_user_sessions (
    id UUID,
    user_id UUID,
    username VARCHAR(30),
    remember_me BOOLEAN,
    created_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

-- Index for active_user_sessions
CREATE INDEX idx_active_user_sessions_user_id ON active_user_sessions(user_id);

-- Seller payouts tracking
CREATE TABLE seller_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    stripe_payout_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for seller_payouts
CREATE INDEX idx_seller_payouts_seller_id ON seller_payouts(seller_id);
CREATE INDEX idx_seller_payouts_status ON seller_payouts(status);

-- Shipping events tracking
CREATE TABLE shipping_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    carrier VARCHAR(50),
    tracking_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for shipping_events
CREATE INDEX idx_shipping_events_order_id ON shipping_events(order_id);

-- Admin audit log
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin_audit_log
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- Query performance monitoring
CREATE TABLE query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT,
    execution_time_ms INTEGER,
    rows_affected INTEGER,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for query_performance_log
CREATE INDEX idx_query_performance_log_created_at ON query_performance_log(created_at DESC);

-- Database health metrics
CREATE TABLE database_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for database_health_metrics
CREATE INDEX idx_database_health_metrics_created_at ON database_health_metrics(created_at DESC);

-- Slow queries tracking
CREATE TABLE slow_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    query_plan TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slow_queries
CREATE INDEX idx_slow_queries_execution_time ON slow_queries(execution_time_ms DESC);

-- Refund requests
CREATE TABLE refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES profiles(id),
    processed_by UUID REFERENCES profiles(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    stripe_refund_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for refund_requests
CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('active_user_sessions', 'seller_payouts', 'shipping_events', 'admin_audit_log', 
                   'query_performance_log', 'database_health_metrics', 'slow_queries', 'refund_requests');
-- Should return 8
```

## Phase 12: Database Functions

### Best Practices
- Use SECURITY DEFINER sparingly and carefully
- Include proper search_path settings
- Design functions for performance

### Avoid These Mistakes
- ❌ Creating functions before their dependencies
- ❌ Forgetting to set search_path
- ❌ Not handling NULL values properly

### Execute Migration

```sql
-- Migration: 12_database_functions
-- Create private schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

-- Get or create cart
CREATE OR REPLACE FUNCTION get_or_create_cart(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    cart_uuid UUID;
BEGIN
    SELECT id INTO cart_uuid FROM shopping_carts 
    WHERE user_id = user_uuid 
    AND expires_at > NOW();
    
    IF cart_uuid IS NULL THEN
        INSERT INTO shopping_carts (user_id) 
        VALUES (user_uuid) 
        RETURNING id INTO cart_uuid;
    END IF;
    
    RETURN cart_uuid;
END;
$$ LANGUAGE plpgsql;

-- Handle new user (trigger function)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(SPLIT_PART(NEW.email, '@', 1))
    );
    
    INSERT INTO shopping_carts (user_id)
    VALUES (NEW.id);
    
    INSERT INTO user_stats_summary (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate platform fee
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    -- 5% platform fee
    RETURN ROUND(amount * 0.05, 2);
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Get optimized image URL
CREATE OR REPLACE FUNCTION get_optimized_image_url(
    base_url text,
    size text DEFAULT 'medium'
) RETURNS text AS $$
BEGIN
    -- If already a WebP with size suffix, return as is
    IF base_url LIKE '%_thumb.webp' OR 
       base_url LIKE '%_small.webp' OR 
       base_url LIKE '%_medium.webp' OR 
       base_url LIKE '%_large.webp' THEN
        RETURN base_url;
    END IF;
    
    -- If WebP without size suffix, add the size
    IF base_url LIKE '%.webp' THEN
        RETURN REPLACE(base_url, '.webp', '_' || size || '.webp');
    END IF;
    
    -- Return original URL if not WebP
    RETURN base_url;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if profile setup is complete
CREATE OR REPLACE FUNCTION is_profile_setup_complete(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND setup_completed = true
        AND username IS NOT NULL
        AND (account_type = 'personal' OR 
             (account_type = 'brand' AND EXISTS (
                SELECT 1 FROM brand_verification_requests 
                WHERE brand_verification_requests.user_id = user_id 
                AND verification_status = 'approved'
             )))
    );
END;
$$ LANGUAGE plpgsql;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS void AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get user ID from email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update user role to admin
    UPDATE profiles
    SET role = 'admin'
    WHERE id = target_user_id;
    
    -- Log the promotion
    INSERT INTO admin_approvals (
        request_type,
        request_id,
        admin_id,
        action,
        notes,
        metadata
    ) VALUES (
        'user_promotion',
        target_user_id,
        auth.uid(),
        'approve',
        'Promoted to admin role',
        jsonb_build_object('email', user_email, 'role', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update setup completion trigger
CREATE OR REPLACE FUNCTION update_setup_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if all required steps are completed
    IF NEW.step_name IN ('avatar_selected', 'profile_info_completed', 'account_type_selected') THEN
        -- Check if all basic steps are done
        IF EXISTS (
            SELECT 1 FROM profile_setup_progress
            WHERE user_id = NEW.user_id
            AND step_name = 'avatar_selected'
            AND completed = true
        ) AND EXISTS (
            SELECT 1 FROM profile_setup_progress
            WHERE user_id = NEW.user_id
            AND step_name = 'profile_info_completed'
            AND completed = true
        ) THEN
            -- Update profile setup_completed
            UPDATE profiles 
            SET setup_completed = true,
                setup_completed_at = now()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
-- Should return at least 10 functions
```

## Phase 13: Triggers

### Best Practices
- Name triggers descriptively
- Order trigger execution carefully
- Test trigger cascades

### Avoid These Mistakes
- ❌ Creating triggers before their functions
- ❌ Circular trigger dependencies
- ❌ Not handling NULL values in triggers

### Execute Migration

```sql
-- Migration: 13_triggers
-- Create all update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON shopping_carts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_accounts_updated_at BEFORE UPDATE ON payment_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create new user trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create setup completion trigger
CREATE TRIGGER trigger_update_setup_completion
AFTER INSERT OR UPDATE ON profile_setup_progress
FOR EACH ROW EXECUTE FUNCTION update_setup_completion();

-- Add updated_at triggers for onboarding tables
CREATE TRIGGER update_profile_setup_progress_updated_at BEFORE UPDATE ON profile_setup_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_verification_requests_updated_at BEFORE UPDATE ON brand_verification_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_accounts_updated_at BEFORE UPDATE ON social_media_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Verification
```sql
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_schema = 'public';
-- Should return at least 17 triggers
```

## Phase 14: Row Level Security Policies

### Best Practices
- Enable RLS on ALL tables (except monitoring tables)
- Use auth.uid() wrapped in SELECT for performance
- Test policies thoroughly with different roles

### Avoid These Mistakes
- ❌ Forgetting to enable RLS on tables
- ❌ Using auth.uid() directly without SELECT wrapper
- ❌ Creating policies that cause infinite recursion

### Execute Migration

```sql
-- Migration: 14_row_level_security
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_setup_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Note: Monitoring tables should NOT have RLS enabled for service access
-- query_performance_log, database_health_metrics, slow_queries

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone" ON listings
FOR SELECT USING (status IN ('active', 'sold', 'reserved'));

CREATE POLICY "Users can create their own listings" ON listings
FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON listings
FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON listings
FOR DELETE USING (auth.uid() = seller_id);

-- Shopping cart policies
CREATE POLICY "Users can view their own cart" ON shopping_carts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart" ON shopping_carts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON shopping_carts
FOR UPDATE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can manage their cart items" ON cart_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM shopping_carts
        WHERE shopping_carts.id = cart_items.cart_id
        AND shopping_carts.user_id = auth.uid()
    )
);

-- Orders policies
CREATE POLICY "Users can view their orders" ON orders
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can cancel pending orders" ON orders
FOR UPDATE USING (auth.uid() = buyer_id AND status IN ('pending_payment', 'payment_processing'));

CREATE POLICY "Sellers can update order status" ON orders
FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Profile setup progress policies
CREATE POLICY "Users can view own setup progress" ON profile_setup_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own setup progress" ON profile_setup_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setup progress" ON profile_setup_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Brand verification request policies
CREATE POLICY "Users can view own brand requests" ON brand_verification_requests
FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can create brand requests" ON brand_verification_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests" ON brand_verification_requests
FOR UPDATE USING (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "Admins can update any brand request" ON brand_verification_requests
FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Social media account policies
CREATE POLICY "Users can view social media accounts" ON social_media_accounts
FOR SELECT USING (true);

CREATE POLICY "Users can manage own social accounts" ON social_media_accounts
FOR ALL USING (auth.uid() = user_id);

-- Admin approval policies
CREATE POLICY "Only admins can view approvals" ON admin_approvals
FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can create approvals" ON admin_approvals
FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categories
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Favorites policies
CREATE POLICY "Users can view their favorites" ON favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorites" ON favorites
FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
FOR INSERT WITH CHECK (true); -- Will be restricted by service role

CREATE POLICY "Users can update their notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

-- Payment methods policies
CREATE POLICY "Users can view own payment methods" ON payment_methods
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods" ON payment_methods
FOR ALL USING (auth.uid() = user_id);

-- Shipping addresses policies
CREATE POLICY "Users can view own addresses" ON shipping_addresses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses" ON shipping_addresses
FOR ALL USING (auth.uid() = user_id);

-- User ratings policies
CREATE POLICY "Anyone can view ratings" ON user_ratings
FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for orders" ON user_ratings
FOR INSERT WITH CHECK (
    auth.uid() = rater_user_id AND
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = user_ratings.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
        AND orders.status = 'completed'
    )
);

-- User follows policies
CREATE POLICY "Anyone can view follows" ON user_follows
FOR SELECT USING (true);

CREATE POLICY "Users can manage their follows" ON user_follows
FOR ALL USING (auth.uid() = follower_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their conversations" ON conversations
FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON coupons
FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "Sellers can manage their coupons" ON coupons
FOR ALL USING (auth.uid() = seller_id OR auth.uid() = created_by);

-- Order items policies
CREATE POLICY "Users can view order items" ON order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
);

-- Product variants policies
CREATE POLICY "Anyone can view active variants" ON product_variants
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE listings.id = product_variants.listing_id
        AND listings.status IN ('active', 'sold', 'reserved')
    )
);

CREATE POLICY "Sellers can manage their variants" ON product_variants
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE listings.id = product_variants.listing_id
        AND listings.seller_id = auth.uid()
    )
);

-- Additional security policies for sensitive tables
-- Stripe webhook events (service role only)
CREATE POLICY "Service role only" ON stripe_webhook_events
FOR ALL USING (false) WITH CHECK (false);

-- Admin audit log (admins only)
CREATE POLICY "Only admins can view audit log" ON admin_audit_log
FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Monitoring tables (service role only)
CREATE POLICY "Service role only" ON query_performance_log
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "Service role only" ON database_health_metrics
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "Service role only" ON slow_queries
FOR ALL USING (false) WITH CHECK (false);
```

### Verification
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Should return many policies
```

## Phase 15: Storage Buckets

### Best Practices
- Create buckets with appropriate access levels
- Set file size limits to prevent abuse
- Restrict MIME types for security

### Avoid These Mistakes
- ❌ Making sensitive buckets public
- ❌ Not setting file size limits
- ❌ Allowing all MIME types

### Execute Migration

```sql
-- Migration: 15_storage_buckets
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- This migration documents the required buckets

-- Execute these through Supabase dashboard or API:
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('listings', 'listings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('returns', 'returns', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('disputes', 'disputes', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']);
*/

-- Create storage policies
-- Note: These need to be applied after bucket creation
/*
-- Avatars policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for other buckets...
*/
```

## Phase 16: Initial Data

### Best Practices
- Insert essential data only
- Use proper constraints
- Include data needed for testing

### Avoid These Mistakes
- ❌ Inserting test data in production
- ❌ Hard-coding IDs
- ❌ Missing required relationships

### Execute Migration

```sql
-- Migration: 16_initial_data
-- Insert default categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Electronics', 'electronics', '💻', 1),
    ('Fashion', 'fashion', '👗', 2),
    ('Home & Garden', 'home-garden', '🏡', 3),
    ('Sports & Outdoors', 'sports-outdoors', '⚽', 4),
    ('Toys & Games', 'toys-games', '🎮', 5),
    ('Books & Media', 'books-media', '📚', 6),
    ('Health & Beauty', 'health-beauty', '💄', 7),
    ('Automotive', 'automotive', '🚗', 8),
    ('Art & Collectibles', 'art-collectibles', '🎨', 9),
    ('Other', 'other', '📦', 10)
ON CONFLICT (name) DO NOTHING;

-- Create admin user function (to be called after first user signs up)
-- Use this to make specific users admin:
-- SELECT promote_to_admin('admin@example.com');
```

### Verification
```sql
SELECT COUNT(*) FROM categories;
-- Should return 10
```

## Phase 17: Security Advisors Check

### Best Practices
- Run security advisors after all migrations
- Address all HIGH severity issues
- Document any accepted risks

### Execute Check

```sql
-- Check for tables without RLS
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE pg_policies.schemaname = pg_tables.schemaname 
    AND pg_policies.tablename = pg_tables.tablename
)
AND tablename NOT IN ('query_performance_log', 'database_health_metrics', 'slow_queries', 'active_user_sessions');

-- Check for missing indexes on foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    'CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name || 
    ' ON ' || tc.table_name || '(' || kcu.column_name || ');' as suggested_index
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = tc.table_name
    AND indexdef LIKE '%(' || kcu.column_name || ')%'
);
```

## Final Verification Steps

1. **Check all tables created**:
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 45+ tables
```

2. **Check all custom types**:
```sql
SELECT COUNT(*) FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace;
-- Should return 18 enums
```

3. **Check RLS is enabled**:
```sql
SELECT COUNT(*) FROM pg_tables t
JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public';
-- Should return many policies
```

4. **Run Supabase Security Advisor**:
Use the MCP tool: `mcp__supabase__get_advisors` with type: 'security'

## Post-Migration Tasks

1. **Update application configuration**:
   - Update all environment variables
   - Update Supabase client initialization
   - Test authentication flow

2. **Create first admin user**:
   - Sign up with your admin email
   - Run: `SELECT promote_to_admin('your-email@example.com');`

3. **Configure storage buckets**:
   - Create buckets via Supabase Dashboard
   - Apply storage policies

4. **Test critical paths**:
   - User registration and profile setup
   - Creating and viewing listings
   - Cart and checkout flow
   - Messaging system

## Troubleshooting Common Issues

1. **Foreign key violations**: Check that referenced tables exist and have data
2. **RLS blocking access**: Verify auth.uid() is available and policies are correct
3. **Function errors**: Ensure required extensions are enabled
4. **Trigger failures**: Check function dependencies exist

## PHASE EXECUTION CHECKLIST FOR CLAUDE CODE

Track your progress by checking off each phase:

- [ ] Phase 1: Extensions and Base Setup
- [ ] Phase 2: Custom Types (Enums)
- [ ] Phase 3: Core User Tables
- [ ] Phase 4: Onboarding and Brand Tables
- [ ] Phase 5: Product and Listing Tables
- [ ] Phase 6: Shopping and Order Tables
- [ ] Phase 7: Payment Tables
- [ ] Phase 8: Communication Tables
- [ ] Phase 9: Shipping and Returns Tables
- [ ] Phase 10: Marketing Tables
- [ ] Phase 11: Monitoring Tables
- [ ] Phase 12: Database Functions
- [ ] Phase 13: Triggers
- [ ] Phase 14: Row Level Security Policies
- [ ] Phase 15: Storage Buckets
- [ ] Phase 16: Initial Data
- [ ] Phase 17: Security Advisors Check

## FINAL REPORT TEMPLATE

When complete, report:
```
MIGRATION STATUS: [SUCCESS/FAILED]
PHASES COMPLETED: X/17
TABLES CREATED: X
ERRORS ENCOUNTERED: [List any errors]
SECURITY ADVISORS: [Pass/Fail with issues]
```

## Migration Complete!

Once all phases are successfully executed and verified, your Supabase database is ready for use with the Driplo marketplace application.

## CLAUDE CODE FINAL INSTRUCTION
Execute this entire migration NOW. Start with Phase 1 and continue until all 17 phases are complete. Report your final status using the template above.