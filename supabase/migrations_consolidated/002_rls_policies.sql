-- ================================================
-- DRIPLO MARKETPLACE - ROW LEVEL SECURITY POLICIES
-- Phase 2: Comprehensive RLS Policies
-- ================================================
-- Run this after 001_core_database_setup.sql
-- This secures all tables with proper RLS policies

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================

-- Everyone can view profiles
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ================================================
-- CATEGORIES POLICIES
-- ================================================

-- Everyone can view active categories
CREATE POLICY "categories_select_public"
    ON public.categories FOR SELECT
    USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "categories_admin_insert"
    ON public.categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "categories_admin_update"
    ON public.categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "categories_admin_delete"
    ON public.categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- BRANDS POLICIES
-- ================================================

-- Everyone can view brands
CREATE POLICY "brands_select_public"
    ON public.brands FOR SELECT
    USING (true);

-- Only admins can manage brands
CREATE POLICY "brands_admin_all"
    ON public.brands FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- LISTINGS POLICIES
-- ================================================

-- Everyone can view non-archived, non-draft listings
CREATE POLICY "listings_select_public"
    ON public.listings FOR SELECT
    USING (NOT is_archived AND NOT is_draft);

-- Users can view their own drafts
CREATE POLICY "listings_select_own_drafts"
    ON public.listings FOR SELECT
    USING (auth.uid() = user_id AND is_draft = true);

-- Users can create their own listings
CREATE POLICY "listings_insert_own"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "listings_update_own"
    ON public.listings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings (only if not sold)
CREATE POLICY "listings_delete_own"
    ON public.listings FOR DELETE
    USING (auth.uid() = user_id AND is_sold = false);

-- ================================================
-- LISTING DRAFTS POLICIES
-- ================================================

-- Users can view their own drafts
CREATE POLICY "listing_drafts_select_own"
    ON public.listing_drafts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "listing_drafts_insert_own"
    ON public.listing_drafts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "listing_drafts_update_own"
    ON public.listing_drafts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "listing_drafts_delete_own"
    ON public.listing_drafts FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- ORDERS POLICIES
-- ================================================

-- Users can view their own orders (as buyer or seller)
CREATE POLICY "orders_select_own"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id
    );

-- Users can create orders as buyers
CREATE POLICY "orders_insert_buyer"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Users can update their own orders
CREATE POLICY "orders_update_own"
    ON public.orders FOR UPDATE
    USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id
    );

-- ================================================
-- PAYMENT ACCOUNTS POLICIES
-- ================================================

-- Users can view their own payment accounts
CREATE POLICY "payment_accounts_select_own"
    ON public.payment_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own payment accounts
CREATE POLICY "payment_accounts_insert_own"
    ON public.payment_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment accounts
CREATE POLICY "payment_accounts_update_own"
    ON public.payment_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own payment accounts
CREATE POLICY "payment_accounts_delete_own"
    ON public.payment_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- PAYMENT METHODS POLICIES
-- ================================================

-- Users can view their own payment methods
CREATE POLICY "payment_methods_select_own"
    ON public.payment_methods FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own payment methods
CREATE POLICY "payment_methods_insert_own"
    ON public.payment_methods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "payment_methods_update_own"
    ON public.payment_methods FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "payment_methods_delete_own"
    ON public.payment_methods FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- CONVERSATIONS POLICIES
-- ================================================

-- Users can view their own conversations
CREATE POLICY "conversations_select_own"
    ON public.conversations FOR SELECT
    USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

-- Users can create conversations they're part of
CREATE POLICY "conversations_insert_own"
    ON public.conversations FOR INSERT
    WITH CHECK (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

-- Users can update their own conversations
CREATE POLICY "conversations_update_own"
    ON public.conversations FOR UPDATE
    USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

-- ================================================
-- MESSAGES POLICIES
-- ================================================

-- Users can view messages in their conversations
CREATE POLICY "messages_select_own"
    ON public.messages FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Users can send messages
CREATE POLICY "messages_insert_own"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages
CREATE POLICY "messages_update_own"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- ================================================
-- USER RATINGS POLICIES
-- ================================================

-- Everyone can view ratings
CREATE POLICY "user_ratings_select_public"
    ON public.user_ratings FOR SELECT
    USING (true);

-- Users can create ratings for completed orders
CREATE POLICY "user_ratings_insert_own"
    ON public.user_ratings FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id 
            AND status = 'delivered'
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can update their own ratings
CREATE POLICY "user_ratings_update_own"
    ON public.user_ratings FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- ================================================
-- FAVORITES POLICIES
-- ================================================

-- Users can view their own favorites
CREATE POLICY "favorites_select_own"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "favorites_insert_own"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "favorites_delete_own"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- USER FOLLOWS POLICIES
-- ================================================

-- Everyone can view follows (for follower counts)
CREATE POLICY "user_follows_select_public"
    ON public.user_follows FOR SELECT
    USING (true);

-- Users can create their own follows
CREATE POLICY "user_follows_insert_own"
    ON public.user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "user_follows_delete_own"
    ON public.user_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- ================================================
-- CART ITEMS POLICIES
-- ================================================

-- Users can view their own cart
CREATE POLICY "cart_items_select_own"
    ON public.cart_items FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add to their own cart
CREATE POLICY "cart_items_insert_own"
    ON public.cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "cart_items_update_own"
    ON public.cart_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can remove from their own cart
CREATE POLICY "cart_items_delete_own"
    ON public.cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- SHOPPING CARTS POLICIES
-- ================================================

-- Users can view their own shopping carts
CREATE POLICY "shopping_carts_select_own"
    ON public.shopping_carts FOR SELECT
    USING (
        auth.uid() = user_id OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Users can create shopping carts
CREATE POLICY "shopping_carts_insert"
    ON public.shopping_carts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Users can update their own shopping carts
CREATE POLICY "shopping_carts_update_own"
    ON public.shopping_carts FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- ================================================
-- NOTIFICATIONS POLICIES
-- ================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- System can create notifications (using service role)
CREATE POLICY "notifications_insert_system"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- AUTH RATE LIMITS POLICIES
-- ================================================

-- Only system can manage rate limits (service role)
CREATE POLICY "auth_rate_limits_system"
    ON public.auth_rate_limits FOR ALL
    USING (false)
    WITH CHECK (false);

-- ================================================
-- AUTH EVENTS POLICIES
-- ================================================

-- Users can view their own auth events
CREATE POLICY "auth_events_select_own"
    ON public.auth_events FOR SELECT
    USING (auth.uid() = user_id);

-- Only system can create auth events
CREATE POLICY "auth_events_insert_system"
    ON public.auth_events FOR INSERT
    WITH CHECK (false);

-- ================================================
-- AUTH SESSIONS POLICIES
-- ================================================

-- Users can view their own sessions
CREATE POLICY "auth_sessions_select_own"
    ON public.auth_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- System manages sessions
CREATE POLICY "auth_sessions_system"
    ON public.auth_sessions FOR ALL
    USING (false)
    WITH CHECK (false);

-- ================================================
-- LISTING VIEWS POLICIES
-- ================================================

-- Everyone can create listing views (for analytics)
CREATE POLICY "listing_views_insert_public"
    ON public.listing_views FOR INSERT
    WITH CHECK (true);

-- Only listing owners can view their analytics
CREATE POLICY "listing_views_select_owner"
    ON public.listing_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id 
            AND user_id = auth.uid()
        )
    );

-- ================================================
-- USER STATS SUMMARY POLICIES
-- ================================================

-- Everyone can view user stats (public profiles)
CREATE POLICY "user_stats_summary_select_public"
    ON public.user_stats_summary FOR SELECT
    USING (true);

-- System updates stats (via triggers/functions)
CREATE POLICY "user_stats_summary_system"
    ON public.user_stats_summary FOR ALL
    USING (false)
    WITH CHECK (false);

-- ================================================
-- BRAND PROFILES POLICIES
-- ================================================

-- Everyone can view verified brand profiles
CREATE POLICY "brand_profiles_select_public"
    ON public.brand_profiles FOR SELECT
    USING (verified = true);

-- Users can view their own brand profile
CREATE POLICY "brand_profiles_select_own"
    ON public.brand_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own brand profile
CREATE POLICY "brand_profiles_insert_own"
    ON public.brand_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand profile
CREATE POLICY "brand_profiles_update_own"
    ON public.brand_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ================================================
-- SOCIAL MEDIA ACCOUNTS POLICIES
-- ================================================

-- Users can view their own social accounts
CREATE POLICY "social_media_accounts_select_own"
    ON public.social_media_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Public can view verified accounts
CREATE POLICY "social_media_accounts_select_verified"
    ON public.social_media_accounts FOR SELECT
    USING (verified = true);

-- Users can manage their own social accounts
CREATE POLICY "social_media_accounts_insert_own"
    ON public.social_media_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_media_accounts_update_own"
    ON public.social_media_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "social_media_accounts_delete_own"
    ON public.social_media_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- DOCUMENTS POLICIES
-- ================================================

-- Users can view their own documents
CREATE POLICY "documents_select_own"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all documents
CREATE POLICY "documents_select_admin"
    ON public.documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can upload their own documents
CREATE POLICY "documents_insert_own"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "documents_update_own"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

-- ================================================
-- DISPUTES POLICIES
-- ================================================

-- Users can view disputes they're involved in
CREATE POLICY "disputes_select_involved"
    ON public.disputes FOR SELECT
    USING (
        auth.uid() = initiated_by OR
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can create disputes for their orders
CREATE POLICY "disputes_insert_own"
    ON public.disputes FOR INSERT
    WITH CHECK (
        auth.uid() = initiated_by AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users and admins can update disputes
CREATE POLICY "disputes_update"
    ON public.disputes FOR UPDATE
    USING (
        auth.uid() = initiated_by OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- REFUND REQUESTS POLICIES
-- ================================================

-- Users can view their own refund requests
CREATE POLICY "refund_requests_select_own"
    ON public.refund_requests FOR SELECT
    USING (
        auth.uid() = requested_by OR
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can create refund requests for their orders
CREATE POLICY "refund_requests_insert_own"
    ON public.refund_requests FOR INSERT
    WITH CHECK (
        auth.uid() = requested_by AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND buyer_id = auth.uid()
        )
    );

-- Admins can update refund requests
CREATE POLICY "refund_requests_update_admin"
    ON public.refund_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- ADMIN AUDIT LOG POLICIES
-- ================================================

-- Only admins can view audit logs
CREATE POLICY "admin_audit_log_select_admin"
    ON public.admin_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- System creates audit logs
CREATE POLICY "admin_audit_log_insert_system"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- COUPONS POLICIES
-- ================================================

-- Everyone can view active coupons
CREATE POLICY "coupons_select_active"
    ON public.coupons FOR SELECT
    USING (
        is_active = true AND 
        (valid_until IS NULL OR valid_until > NOW())
    );

-- Admins can manage coupons
CREATE POLICY "coupons_admin_all"
    ON public.coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- COUPON USAGE POLICIES
-- ================================================

-- Users can view their own coupon usage
CREATE POLICY "coupon_usage_select_own"
    ON public.coupon_usage FOR SELECT
    USING (auth.uid() = user_id);

-- Users can use coupons
CREATE POLICY "coupon_usage_insert_own"
    ON public.coupon_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ================================================
-- USER ACHIEVEMENTS POLICIES
-- ================================================

-- Everyone can view achievements (for profiles)
CREATE POLICY "user_achievements_select_public"
    ON public.user_achievements FOR SELECT
    USING (true);

-- System grants achievements
CREATE POLICY "user_achievements_insert_system"
    ON public.user_achievements FOR INSERT
    WITH CHECK (false);

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
-- Phase 2 Complete: All RLS policies applied successfully
-- Next: Run 003_rpc_functions.sql to create server functions