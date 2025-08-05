-- Performance indexes for production
-- These are critical for application performance

-- LISTINGS INDEXES
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory_id ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at_desc ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_is_sold ON listings(is_sold) WHERE NOT is_sold;
CREATE INDEX IF NOT EXISTS idx_listings_is_archived ON listings(is_archived) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

CREATE INDEX IF NOT EXISTS idx_listings_by_category_active ON listings(category_id, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

-- FAVORITES INDEXES
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_listing ON favorites(user_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- ORDERS INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);

-- Composite index for user order history
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON orders(seller_id, status, created_at DESC);

-- MESSAGES INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Composite index for conversation messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- CONVERSATIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- USER_RATINGS INDEXES
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating_for ON user_ratings(rating_for);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating_by ON user_ratings(rating_by);
CREATE INDEX IF NOT EXISTS idx_user_ratings_order_id ON user_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON user_ratings(created_at DESC);

-- LISTING_VIEWS INDEXES
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_views_unique ON listing_views(listing_id, user_id);

-- CART_ITEMS INDEXES
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_listing ON cart_items(user_id, listing_id);

-- PROFILES INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- NOTIFICATIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE NOT read;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Full text search indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_title_fts ON listings USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_listings_description_fts ON listings USING gin(to_tsvector('english', description));

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE listings;
ANALYZE favorites;
ANALYZE orders;
ANALYZE messages;
ANALYZE conversations;
ANALYZE user_ratings;
ANALYZE listing_views;
ANALYZE cart_items;
ANALYZE notifications;