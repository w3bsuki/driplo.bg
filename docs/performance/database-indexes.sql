-- Database Indexes for Performance Optimization
-- Run these in Supabase SQL Editor for better query performance

-- Listings table indexes (most critical)
CREATE INDEX IF NOT EXISTS idx_listings_status_created 
ON listings (status, created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_category_status 
ON listings (category, status, created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_seller_status 
ON listings (seller_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_price_range 
ON listings (price) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_search_text 
ON listings USING gin(to_tsvector('english', title || ' ' || description))
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_condition 
ON listings (condition, status, created_at DESC) 
WHERE status = 'active';

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
ON users (LOWER(username));

CREATE INDEX IF NOT EXISTS idx_users_email_lower 
ON users (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users (created_at DESC);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
ON user_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_seller_rating 
ON user_profiles (seller_rating DESC) 
WHERE seller_rating IS NOT NULL;

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
ON messages (sender_id, receiver_id, created_at DESC);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing 
ON favorites (user_id, listing_id);

CREATE INDEX IF NOT EXISTS idx_favorites_listing_count 
ON favorites (listing_id);

-- Categories table indexes  
CREATE INDEX IF NOT EXISTS idx_categories_parent_name 
ON categories (parent_category, name);

CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON categories (slug);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_status 
ON transactions (buyer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_seller_status 
ON transactions (seller_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_listing_status 
ON transactions (listing_id, status);

-- Brand profiles table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_status 
ON brand_profiles (user_id, verification_status);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
ON notification_preferences (user_id);

-- Images table indexes (for listing images)
CREATE INDEX IF NOT EXISTS idx_images_listing_order 
ON images (listing_id, sort_order);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_seller_rating 
ON reviews (seller_id, rating, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_buyer 
ON reviews (buyer_id, created_at DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_listings_complex_browse 
ON listings (category, condition, status, price, created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_seller_active_count 
ON listings (seller_id, status) 
WHERE status = 'active';

-- Full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_listings_fulltext_search 
ON listings USING gin(
    (setweight(to_tsvector('english', title), 'A') || 
     setweight(to_tsvector('english', description), 'B') || 
     setweight(to_tsvector('english', brand), 'C'))
) WHERE status = 'active';

-- Partial indexes for frequently filtered data
CREATE INDEX IF NOT EXISTS idx_listings_featured 
ON listings (created_at DESC) 
WHERE featured = true AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_recent_active 
ON listings (created_at DESC) 
WHERE status = 'active' AND created_at > (NOW() - INTERVAL '30 days');

-- Statistics for query planner
ANALYZE listings;
ANALYZE users;
ANALYZE user_profiles;
ANALYZE messages;
ANALYZE favorites;
ANALYZE categories;
ANALYZE transactions;

-- Show index usage statistics (for monitoring)
-- Run this query periodically to check if indexes are being used:
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
*/