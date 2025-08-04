-- ================================================
-- DRIPLO MARKETPLACE - INDEXES & PERFORMANCE
-- Phase 4: Database Optimization
-- ================================================
-- Run this after 003_rpc_functions.sql
-- This creates all necessary indexes for optimal performance

-- ================================================
-- PROFILES TABLE INDEXES
-- ================================================

-- Username lookup (unique already creates index)
-- Email lookup (unique already creates index)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_brand ON public.profiles(is_brand) WHERE is_brand = true;
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

-- ================================================
-- CATEGORIES TABLE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug); -- Already unique

-- ================================================
-- BRANDS TABLE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_brands_is_verified ON public.brands(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_brands_is_popular ON public.brands(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON public.brands USING gin(name gin_trgm_ops);

-- ================================================
-- LISTINGS TABLE INDEXES (CRITICAL FOR PERFORMANCE)
-- ================================================

-- Core foreign keys
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_subcategory_id ON public.listings(subcategory_id) WHERE subcategory_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_brand_id ON public.listings(brand_id) WHERE brand_id IS NOT NULL;

-- Status flags for filtering
CREATE INDEX IF NOT EXISTS idx_listings_is_sold ON public.listings(is_sold);
CREATE INDEX IF NOT EXISTS idx_listings_is_archived ON public.listings(is_archived);
CREATE INDEX IF NOT EXISTS idx_listings_is_draft ON public.listings(is_draft);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON public.listings(is_featured) WHERE is_featured = true;

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_currency ON public.listings(currency);

-- Search and filtering
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_size ON public.listings(size) WHERE size IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_color ON public.listings(color) WHERE color IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_country ON public.listings(country) WHERE country IS NOT NULL;

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON public.listings USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm ON public.listings USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_tags_gin ON public.listings USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_listings_materials_gin ON public.listings USING gin(materials);

-- Sorting and pagination
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_updated_at ON public.listings(updated_at);
CREATE INDEX IF NOT EXISTS idx_listings_view_count ON public.listings(view_count);
CREATE INDEX IF NOT EXISTS idx_listings_like_count ON public.listings(like_count);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_active_by_category ON public.listings(category_id, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

CREATE INDEX IF NOT EXISTS idx_listings_active_by_brand ON public.listings(brand_id, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

CREATE INDEX IF NOT EXISTS idx_listings_active_by_user ON public.listings(user_id, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

CREATE INDEX IF NOT EXISTS idx_listings_price_range ON public.listings(price, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft;

CREATE INDEX IF NOT EXISTS idx_listings_featured_active ON public.listings(is_featured, created_at DESC) 
    WHERE NOT is_sold AND NOT is_archived AND NOT is_draft AND is_featured = true;

-- ================================================
-- LISTING DRAFTS TABLE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_listing_drafts_user_id ON public.listing_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_created_at ON public.listing_drafts(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_updated_at ON public.listing_drafts(updated_at);

-- ================================================
-- ORDERS TABLE INDEXES
-- ================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.orders(listing_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Payment tracking
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_charge_id ON public.orders(stripe_charge_id) WHERE stripe_charge_id IS NOT NULL;

-- Timestamps for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON public.orders(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at) WHERE shipped_at IS NOT NULL;

-- Composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON public.orders(buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON public.orders(seller_id, status, created_at DESC);

-- ================================================
-- PAYMENT ACCOUNTS & METHODS INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON public.payment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_provider ON public.payment_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_is_default ON public.payment_accounts(user_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id) WHERE stripe_payment_method_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(user_id, is_default) WHERE is_default = true;

-- ================================================
-- MESSAGING INDEXES
-- ================================================

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- Composite for user conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_recent ON public.conversations(participant1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_recent ON public.conversations(participant2_id, last_message_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(recipient_id, is_read) WHERE NOT is_read;

-- Composite for conversation messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON public.messages(conversation_id, created_at DESC);

-- ================================================
-- SOCIAL FEATURES INDEXES
-- ================================================

-- User ratings
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewer_id ON public.user_ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewed_id ON public.user_ratings(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_order_id ON public.user_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON public.user_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON public.user_ratings(created_at);

-- Composite for user profile ratings
CREATE INDEX IF NOT EXISTS idx_user_ratings_profile ON public.user_ratings(reviewed_id, rating, created_at DESC);

-- Favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at);

-- User follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at);

-- ================================================
-- CART & SHOPPING INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON public.cart_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON public.cart_items(added_at);

CREATE INDEX IF NOT EXISTS idx_shopping_carts_session_id ON public.shopping_carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON public.shopping_carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_carts_expires_at ON public.shopping_carts(expires_at);

-- ================================================
-- NOTIFICATIONS INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Composite for user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_recent ON public.notifications(user_id, created_at DESC);

-- ================================================
-- AUTH & SECURITY INDEXES
-- ================================================

-- Auth rate limits
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_ip_action ON public.auth_rate_limits(ip_address, action);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_user_id ON public.auth_rate_limits(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_last_attempt ON public.auth_rate_limits(last_attempt);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until ON public.auth_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Auth events
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON public.auth_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON public.auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_events_ip_address ON public.auth_events(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.auth_events(created_at);

-- Auth sessions
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash ON public.auth_sessions(token_hash); -- Already unique
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON public.auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_activity ON public.auth_sessions(last_activity);

-- ================================================
-- ANALYTICS INDEXES
-- ================================================

-- Listing views
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewer_id ON public.listing_views(viewer_id) WHERE viewer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON public.listing_views(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_views_ip_address ON public.listing_views(ip_address) WHERE ip_address IS NOT NULL;

-- Composite for analytics queries
CREATE INDEX IF NOT EXISTS idx_listing_views_analytics ON public.listing_views(listing_id, created_at DESC);

-- User stats summary (already has PK on id)
CREATE INDEX IF NOT EXISTS idx_user_stats_summary_last_calculated ON public.user_stats_summary(last_calculated);

-- ================================================
-- BRAND & VERIFICATION INDEXES
-- ================================================

-- Brand profiles
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON public.brand_profiles(user_id); -- Already unique
CREATE INDEX IF NOT EXISTS idx_brand_profiles_verified ON public.brand_profiles(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_brand_profiles_verification_status ON public.brand_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_brand_name_trgm ON public.brand_profiles USING gin(brand_name gin_trgm_ops);

-- Social media accounts
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_user_id ON public.social_media_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform ON public.social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_verified ON public.social_media_accounts(verified) WHERE verified = true;

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_verified_by ON public.documents(verified_by) WHERE verified_by IS NOT NULL;

-- ================================================
-- DISPUTES & REFUNDS INDEXES
-- ================================================

-- Disputes
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON public.disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_resolved_by ON public.disputes(resolved_by) WHERE resolved_by IS NOT NULL;

-- Refund requests
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON public.refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_by ON public.refund_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_processed_by ON public.refund_requests(processed_by) WHERE processed_by IS NOT NULL;

-- ================================================
-- ADMIN & AUDIT INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_type ON public.admin_audit_log(target_type) WHERE target_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);

-- ================================================
-- COUPONS & PROMOTIONS INDEXES
-- ================================================

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code); -- Already unique
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON public.coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON public.coupons(created_by) WHERE created_by IS NOT NULL;

-- Coupon usage
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupon_usage_used_at ON public.coupon_usage(used_at);

-- ================================================
-- ACHIEVEMENTS & GAMIFICATION INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);

-- ================================================
-- BRIN INDEXES FOR LARGE TIME-SERIES DATA
-- ================================================

-- For very large tables with time-based queries, BRIN indexes are more efficient
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at_brin ON public.listing_views USING brin(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at_brin ON public.auth_events USING brin(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_brin ON public.messages USING brin(created_at);

-- ================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ================================================

-- Active sellers (users with active listings)
CREATE INDEX IF NOT EXISTS idx_active_sellers ON public.profiles(id, seller_rating) 
    WHERE EXISTS (
        SELECT 1 FROM public.listings 
        WHERE user_id = profiles.id 
        AND NOT is_sold 
        AND NOT is_archived 
        AND NOT is_draft
    );

-- High-value orders
CREATE INDEX IF NOT EXISTS idx_high_value_orders ON public.orders(amount, created_at DESC) 
    WHERE amount > 100;

-- Recent unread messages
CREATE INDEX IF NOT EXISTS idx_recent_unread_messages ON public.messages(recipient_id, created_at DESC) 
    WHERE NOT is_read AND created_at > NOW() - INTERVAL '30 days';

-- ================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ================================================

-- Update table statistics for the query planner
ANALYZE public.profiles;
ANALYZE public.categories;
ANALYZE public.brands;
ANALYZE public.listings;
ANALYZE public.orders;
ANALYZE public.messages;
ANALYZE public.conversations;
ANALYZE public.user_ratings;
ANALYZE public.favorites;
ANALYZE public.user_follows;
ANALYZE public.notifications;
ANALYZE public.listing_views;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
-- Phase 4 Complete: All performance indexes created successfully
-- Next: Run 005_storage_initial_data.sql to set up storage and seed data