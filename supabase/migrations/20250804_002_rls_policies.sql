-- ROW LEVEL SECURITY POLICIES FOR DRIPLO MARKETPLACE
-- Run this after 001_complete_database_setup.sql

-- ================================================
-- PROFILES POLICIES
-- ================================================

-- Public profiles are viewable by everyone
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ================================================
-- CATEGORIES POLICIES
-- ================================================

-- Categories are public
CREATE POLICY "categories_select_public"
    ON public.categories FOR SELECT
    USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "categories_admin_all"
    ON public.categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ));

-- ================================================
-- BRANDS POLICIES
-- ================================================

-- Brands are public
CREATE POLICY "brands_select_public"
    ON public.brands FOR SELECT
    USING (true);

-- Only admins can manage brands
CREATE POLICY "brands_admin_all"
    ON public.brands FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ));

-- ================================================
-- LISTINGS POLICIES
-- ================================================

-- Public listings are viewable by everyone
CREATE POLICY "listings_select_public"
    ON public.listings FOR SELECT
    USING (NOT is_archived);

-- Users can create their own listings
CREATE POLICY "listings_insert_own"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "listings_update_own"
    ON public.listings FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "listings_delete_own"
    ON public.listings FOR DELETE
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
-- MESSAGES POLICIES
-- ================================================

-- Users can view messages they sent or received
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
    USING (
        auth.uid() = sender_id OR
        auth.uid() = recipient_id
    );

-- ================================================
-- USER RATINGS POLICIES
-- ================================================

-- Ratings are public
CREATE POLICY "ratings_select_public"
    ON public.user_ratings FOR SELECT
    USING (true);

-- Users can create ratings for completed orders
CREATE POLICY "ratings_insert_own"
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
CREATE POLICY "ratings_update_own"
    ON public.user_ratings FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- ================================================
-- FAVORITES POLICIES
-- ================================================

-- Users can view their own favorites
CREATE POLICY "favorites_select_own"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "favorites_insert_own"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "favorites_delete_own"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- FOLLOWS POLICIES
-- ================================================

-- Follows are public
CREATE POLICY "follows_select_public"
    ON public.follows FOR SELECT
    USING (true);

-- Users can follow others
CREATE POLICY "follows_insert_own"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "follows_delete_own"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- ================================================
-- CART ITEMS POLICIES
-- ================================================

-- Users can view their own cart
CREATE POLICY "cart_select_own"
    ON public.cart_items FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add to cart
CREATE POLICY "cart_insert_own"
    ON public.cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their cart
CREATE POLICY "cart_update_own"
    ON public.cart_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can remove from cart
CREATE POLICY "cart_delete_own"
    ON public.cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- PAYMENT ACCOUNTS POLICIES
-- ================================================

-- Users can view their own payment accounts
CREATE POLICY "payment_accounts_select_own"
    ON public.payment_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add payment accounts
CREATE POLICY "payment_accounts_insert_own"
    ON public.payment_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their payment accounts
CREATE POLICY "payment_accounts_update_own"
    ON public.payment_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their payment accounts
CREATE POLICY "payment_accounts_delete_own"
    ON public.payment_accounts FOR DELETE
    USING (auth.uid() = user_id);

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

-- No public access - handled by RPC functions
-- Service role only

-- ================================================
-- AUTH EVENTS POLICIES
-- ================================================

-- Users can view their own auth events
CREATE POLICY "auth_events_select_own"
    ON public.auth_events FOR SELECT
    USING (auth.uid() = user_id);

-- ================================================
-- LISTING VIEWS POLICIES
-- ================================================

-- Analytics are admin-only
CREATE POLICY "listing_views_admin_select"
    ON public.listing_views FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ));

-- Anyone can track views (for analytics)
CREATE POLICY "listing_views_insert_public"
    ON public.listing_views FOR INSERT
    WITH CHECK (true);

-- ================================================
-- BRAND PROFILES POLICIES
-- ================================================

-- Brand profiles are viewable by verified brands
CREATE POLICY "brand_profiles_select_verified"
    ON public.brand_profiles FOR SELECT
    USING (
        user_id = auth.uid() OR
        verified = true
    );

-- Users can create their own brand profile
CREATE POLICY "brand_profiles_insert_own"
    ON public.brand_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand profile
CREATE POLICY "brand_profiles_update_own"
    ON public.brand_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ================================================
-- LISTING DRAFTS POLICIES
-- ================================================

-- Users can view their own drafts
CREATE POLICY "drafts_select_own"
    ON public.listing_drafts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create drafts
CREATE POLICY "drafts_insert_own"
    ON public.listing_drafts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their drafts
CREATE POLICY "drafts_update_own"
    ON public.listing_drafts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their drafts
CREATE POLICY "drafts_delete_own"
    ON public.listing_drafts FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- DOCUMENTS POLICIES
-- ================================================

-- Users can view their own documents
CREATE POLICY "documents_select_own"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

-- Users can upload documents
CREATE POLICY "documents_insert_own"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their documents
CREATE POLICY "documents_delete_own"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- USER ACHIEVEMENTS POLICIES
-- ================================================

-- Achievements are public
CREATE POLICY "achievements_select_public"
    ON public.user_achievements FOR SELECT
    USING (true);

-- System creates achievements (via triggers/functions)
CREATE POLICY "achievements_insert_system"
    ON public.user_achievements FOR INSERT
    WITH CHECK (true);

-- ================================================
-- SOCIAL MEDIA ACCOUNTS POLICIES
-- ================================================

-- Social accounts are public if profile is public
CREATE POLICY "social_select_public"
    ON public.social_media_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = user_id
            AND (privacy_settings->>'profile_public')::boolean = true
        ) OR
        auth.uid() = user_id
    );

-- Users can manage their own social accounts
CREATE POLICY "social_insert_own"
    ON public.social_media_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_update_own"
    ON public.social_media_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "social_delete_own"
    ON public.social_media_accounts FOR DELETE
    USING (auth.uid() = user_id);