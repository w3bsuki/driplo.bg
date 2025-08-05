-- Enable Row Level Security on all tables
-- This is CRITICAL for production security

-- Core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- LISTINGS POLICIES
CREATE POLICY "listings_select_public" ON listings
    FOR SELECT USING (
        NOT is_draft 
        OR user_id = auth.uid()
    );

CREATE POLICY "listings_insert_authenticated" ON listings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "listings_update_own" ON listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_delete_own" ON listings
    FOR DELETE USING (auth.uid() = user_id);

-- FAVORITES POLICIES
CREATE POLICY "favorites_select_own" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_authenticated" ON favorites
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "favorites_delete_own" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- ORDERS POLICIES
CREATE POLICY "orders_select_involved" ON orders
    FOR SELECT USING (
        auth.uid() = buyer_id 
        OR auth.uid() = seller_id
    );

CREATE POLICY "orders_insert_as_buyer" ON orders
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "orders_update_involved" ON orders
    FOR UPDATE USING (
        auth.uid() = buyer_id 
        OR auth.uid() = seller_id
    );

-- MESSAGES POLICIES
CREATE POLICY "messages_select_in_conversation" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "messages_insert_in_conversation" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- CONVERSATIONS POLICIES
CREATE POLICY "conversations_select_involved" ON conversations
    FOR SELECT USING (
        auth.uid() = buyer_id 
        OR auth.uid() = seller_id
    );

CREATE POLICY "conversations_insert_as_buyer" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id
        AND auth.uid() IS NOT NULL
    );

-- USER_RATINGS POLICIES
CREATE POLICY "ratings_select_all" ON user_ratings
    FOR SELECT USING (true);

CREATE POLICY "ratings_insert_as_reviewer" ON user_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = rating_by
        AND auth.uid() IS NOT NULL
        -- Ensure user has completed order with the seller
        AND EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = user_ratings.order_id
            AND o.buyer_id = auth.uid()
            AND o.status = 'completed'
        )
    );

-- LISTING_VIEWS POLICIES
CREATE POLICY "listing_views_insert_authenticated" ON listing_views
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "listing_views_select_own" ON listing_views
    FOR SELECT USING (auth.uid() = user_id);

-- CART_ITEMS POLICIES
CREATE POLICY "cart_items_select_own" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_own" ON cart_items
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "cart_items_update_own" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_own" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- PAYMENT_ACCOUNTS POLICIES
CREATE POLICY "payment_accounts_select_own" ON payment_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_accounts_insert_own" ON payment_accounts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "payment_accounts_update_own" ON payment_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payment_accounts_delete_own" ON payment_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);