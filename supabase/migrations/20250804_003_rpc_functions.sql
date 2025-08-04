-- RPC FUNCTIONS FOR DRIPLO MARKETPLACE
-- Run this after 002_rls_policies.sql

-- ================================================
-- AUTH FUNCTIONS
-- ================================================

-- Check auth rate limit
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
    p_action TEXT,
    p_ip_address INET,
    p_user_id UUID DEFAULT NULL,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_attempts INTEGER;
    v_blocked_until TIMESTAMPTZ;
BEGIN
    -- Check if IP is blocked
    SELECT attempts, blocked_until
    INTO v_attempts, v_blocked_until
    FROM public.auth_rate_limits
    WHERE ip_address = p_ip_address
      AND action = p_action
      AND last_attempt > NOW() - INTERVAL '1 minute' * p_window_minutes
    ORDER BY last_attempt DESC
    LIMIT 1;

    -- If blocked
    IF v_blocked_until IS NOT NULL AND v_blocked_until > NOW() THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'blocked',
            'blocked_until', v_blocked_until,
            'attempts', v_attempts
        );
    END IF;

    -- If no recent attempts
    IF v_attempts IS NULL THEN
        INSERT INTO public.auth_rate_limits (ip_address, user_id, action, attempts)
        VALUES (p_ip_address, p_user_id, p_action, 1);
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts', 1,
            'remaining', p_max_attempts - 1
        );
    END IF;

    -- If under limit
    IF v_attempts < p_max_attempts THEN
        UPDATE public.auth_rate_limits
        SET attempts = attempts + 1,
            last_attempt = NOW()
        WHERE ip_address = p_ip_address
          AND action = p_action
          AND last_attempt > NOW() - INTERVAL '1 minute' * p_window_minutes;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts', v_attempts + 1,
            'remaining', p_max_attempts - v_attempts - 1
        );
    ELSE
        -- Block the IP
        UPDATE public.auth_rate_limits
        SET blocked_until = NOW() + INTERVAL '1 hour',
            attempts = attempts + 1,
            last_attempt = NOW()
        WHERE ip_address = p_ip_address
          AND action = p_action;
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'rate_limit_exceeded',
            'blocked_until', NOW() + INTERVAL '1 hour',
            'attempts', v_attempts + 1
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log auth event
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.auth_events (
        user_id,
        event_type,
        event_data,
        ip_address,
        user_agent,
        success,
        error_message
    )
    VALUES (
        p_user_id,
        p_event_type,
        p_event_data,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- LISTING FUNCTIONS
-- ================================================

-- Get listings with filters
CREATE OR REPLACE FUNCTION public.get_listings_filtered(
    p_category_id UUID DEFAULT NULL,
    p_subcategory_id UUID DEFAULT NULL,
    p_brand_id UUID DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_condition TEXT DEFAULT NULL,
    p_size TEXT DEFAULT NULL,
    p_color TEXT DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'DESC',
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    images TEXT[],
    thumbnail_url TEXT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.images,
        l.thumbnail_url,
        l.user_id,
        p.username,
        p.avatar_url,
        p.is_verified,
        l.created_at
    FROM public.listings l
    JOIN public.profiles p ON l.user_id = p.id
    WHERE 
        l.is_sold = false
        AND l.is_archived = false
        AND (p_category_id IS NULL OR l.category_id = p_category_id)
        AND (p_subcategory_id IS NULL OR l.subcategory_id = p_subcategory_id)
        AND (p_brand_id IS NULL OR l.brand_id = p_brand_id)
        AND (p_min_price IS NULL OR l.price >= p_min_price)
        AND (p_max_price IS NULL OR l.price <= p_max_price)
        AND (p_condition IS NULL OR l.condition = p_condition)
        AND (p_size IS NULL OR l.size = p_size)
        AND (p_color IS NULL OR l.color = p_color)
        AND (p_search_query IS NULL OR 
             l.title ILIKE '%' || p_search_query || '%' OR
             l.description ILIKE '%' || p_search_query || '%')
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'price' AND p_sort_order = 'ASC' THEN l.price
            WHEN p_sort_by = 'price' AND p_sort_order = 'DESC' THEN -l.price
            WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN EXTRACT(EPOCH FROM l.created_at)
            WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN -EXTRACT(EPOCH FROM l.created_at)
        END
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Track listing view
CREATE OR REPLACE FUNCTION public.track_listing_view(
    p_listing_id UUID,
    p_viewer_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert view record
    INSERT INTO public.listing_views (
        listing_id,
        viewer_id,
        ip_address,
        user_agent,
        referrer
    )
    VALUES (
        p_listing_id,
        p_viewer_id,
        p_ip_address,
        p_user_agent,
        p_referrer
    );
    
    -- Update listing view count
    UPDATE public.listings
    SET view_count = view_count + 1
    WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get top category sellers
CREATE OR REPLACE FUNCTION public.get_top_category_sellers(
    p_category_uuid UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    seller_id UUID,
    username TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN,
    total_sales BIGINT,
    avg_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS seller_id,
        p.username,
        p.avatar_url,
        p.is_verified,
        COUNT(DISTINCT o.id) AS total_sales,
        AVG(r.rating) AS avg_rating
    FROM public.profiles p
    JOIN public.listings l ON l.user_id = p.id
    JOIN public.orders o ON o.listing_id = l.id AND o.status = 'delivered'
    LEFT JOIN public.user_ratings r ON r.reviewed_id = p.id
    WHERE 
        l.category_id = p_category_uuid
        AND l.is_sold = true
    GROUP BY p.id, p.username, p.avatar_url, p.is_verified
    ORDER BY total_sales DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- USER FUNCTIONS
-- ================================================

-- Get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COUNT(DISTINCT l.id),
        'sold_items', COUNT(DISTINCT CASE WHEN l.is_sold THEN l.id END),
        'total_sales', COALESCE(SUM(CASE WHEN l.is_sold THEN l.price END), 0),
        'total_purchases', (
            SELECT COUNT(*) FROM public.orders 
            WHERE buyer_id = p_user_id AND status = 'delivered'
        ),
        'avg_seller_rating', (
            SELECT AVG(rating) FROM public.user_ratings 
            WHERE reviewed_id = p_user_id AND review_type = 'buyer_to_seller'
        ),
        'avg_buyer_rating', (
            SELECT AVG(rating) FROM public.user_ratings 
            WHERE reviewed_id = p_user_id AND review_type = 'seller_to_buyer'
        ),
        'follower_count', (
            SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id
        ),
        'following_count', (
            SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id
        )
    ) INTO v_stats
    FROM public.listings l
    WHERE l.user_id = p_user_id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE;

-- Export user data (GDPR)
CREATE OR REPLACE FUNCTION public.export_user_data(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_data JSONB;
BEGIN
    -- Check if user is requesting their own data
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only export your own data';
    END IF;
    
    SELECT jsonb_build_object(
        'profile', (SELECT row_to_json(p.*) FROM public.profiles p WHERE p.id = p_user_id),
        'listings', (SELECT jsonb_agg(row_to_json(l.*)) FROM public.listings l WHERE l.user_id = p_user_id),
        'orders', (SELECT jsonb_agg(row_to_json(o.*)) FROM public.orders o WHERE o.buyer_id = p_user_id OR o.seller_id = p_user_id),
        'messages', (SELECT jsonb_agg(row_to_json(m.*)) FROM public.messages m WHERE m.sender_id = p_user_id OR m.recipient_id = p_user_id),
        'ratings_given', (SELECT jsonb_agg(row_to_json(r.*)) FROM public.user_ratings r WHERE r.reviewer_id = p_user_id),
        'ratings_received', (SELECT jsonb_agg(row_to_json(r.*)) FROM public.user_ratings r WHERE r.reviewed_id = p_user_id),
        'favorites', (SELECT jsonb_agg(row_to_json(f.*)) FROM public.favorites f WHERE f.user_id = p_user_id),
        'follows', (SELECT jsonb_agg(row_to_json(f.*)) FROM public.follows f WHERE f.follower_id = p_user_id),
        'followers', (SELECT jsonb_agg(row_to_json(f.*)) FROM public.follows f WHERE f.following_id = p_user_id)
    ) INTO v_data;
    
    RETURN v_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ORDER FUNCTIONS
-- ================================================

-- Create order with payment
CREATE OR REPLACE FUNCTION public.create_order_with_payment(
    p_buyer_id UUID,
    p_listing_id UUID,
    p_payment_intent_id TEXT,
    p_shipping_address JSONB,
    p_billing_address JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_listing RECORD;
    v_platform_fee DECIMAL;
    v_seller_payout DECIMAL;
BEGIN
    -- Get listing details
    SELECT * INTO v_listing
    FROM public.listings
    WHERE id = p_listing_id
    FOR UPDATE;
    
    -- Check if listing is available
    IF v_listing.is_sold OR v_listing.is_archived THEN
        RAISE EXCEPTION 'Listing is not available';
    END IF;
    
    -- Calculate fees (10% platform fee)
    v_platform_fee := v_listing.price * 0.10;
    v_seller_payout := v_listing.price - v_platform_fee;
    
    -- Create order
    INSERT INTO public.orders (
        buyer_id,
        seller_id,
        listing_id,
        status,
        payment_status,
        payment_intent_id,
        amount,
        shipping_amount,
        platform_fee,
        seller_payout,
        currency,
        shipping_address,
        billing_address
    )
    VALUES (
        p_buyer_id,
        v_listing.user_id,
        p_listing_id,
        'pending',
        'processing',
        p_payment_intent_id,
        v_listing.price,
        v_listing.shipping_price,
        v_platform_fee,
        v_seller_payout,
        v_listing.currency,
        p_shipping_address,
        COALESCE(p_billing_address, p_shipping_address)
    )
    RETURNING id INTO v_order_id;
    
    -- Mark listing as sold
    UPDATE public.listings
    SET is_sold = true,
        sold_at = NOW()
    WHERE id = p_listing_id;
    
    -- Remove from all carts
    DELETE FROM public.cart_items
    WHERE listing_id = p_listing_id;
    
    -- Create notification for seller
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    VALUES (
        v_listing.user_id,
        'new_order',
        'New Order!',
        'You have a new order for ' || v_listing.title,
        jsonb_build_object('order_id', v_order_id, 'listing_id', p_listing_id)
    );
    
    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ANALYTICS FUNCTIONS
-- ================================================

-- Get seller analytics
CREATE OR REPLACE FUNCTION public.get_seller_analytics(
    p_seller_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    -- Check if user is requesting their own analytics or is admin
    IF auth.uid() != p_seller_id AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    SELECT jsonb_build_object(
        'total_revenue', COALESCE(SUM(o.seller_payout), 0),
        'total_orders', COUNT(DISTINCT o.id),
        'total_listings', COUNT(DISTINCT l.id),
        'active_listings', COUNT(DISTINCT CASE WHEN NOT l.is_sold AND NOT l.is_archived THEN l.id END),
        'sold_listings', COUNT(DISTINCT CASE WHEN l.is_sold THEN l.id END),
        'avg_order_value', AVG(o.amount),
        'conversion_rate', 
            CASE 
                WHEN COUNT(DISTINCT l.id) > 0 
                THEN (COUNT(DISTINCT CASE WHEN l.is_sold THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id) * 100)
                ELSE 0 
            END,
        'total_views', SUM(l.view_count),
        'avg_rating', (
            SELECT AVG(rating) FROM public.user_ratings 
            WHERE reviewed_id = p_seller_id AND review_type = 'buyer_to_seller'
        ),
        'top_categories', (
            SELECT jsonb_agg(jsonb_build_object(
                'category_id', c.id,
                'category_name', c.name,
                'sales_count', cat_sales.count
            ))
            FROM (
                SELECT l2.category_id, COUNT(*) as count
                FROM public.listings l2
                JOIN public.orders o2 ON o2.listing_id = l2.id
                WHERE l2.user_id = p_seller_id
                AND o2.status = 'delivered'
                GROUP BY l2.category_id
                ORDER BY count DESC
                LIMIT 5
            ) cat_sales
            JOIN public.categories c ON c.id = cat_sales.category_id
        )
    ) INTO v_analytics
    FROM public.listings l
    LEFT JOIN public.orders o ON o.listing_id = l.id AND o.status = 'delivered'
    WHERE l.user_id = p_seller_id
    AND (p_start_date IS NULL OR l.created_at >= p_start_date)
    AND (p_end_date IS NULL OR l.created_at <= p_end_date);
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SEARCH FUNCTIONS
-- ================================================

-- Full text search
CREATE OR REPLACE FUNCTION public.search_listings(
    p_query TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    images TEXT[],
    thumbnail_url TEXT,
    user_id UUID,
    username TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.images,
        l.thumbnail_url,
        l.user_id,
        p.username,
        ts_rank(
            to_tsvector('english', COALESCE(l.title, '') || ' ' || COALESCE(l.description, '')),
            plainto_tsquery('english', p_query)
        ) AS rank
    FROM public.listings l
    JOIN public.profiles p ON l.user_id = p.id
    WHERE 
        l.is_sold = false
        AND l.is_archived = false
        AND to_tsvector('english', COALESCE(l.title, '') || ' ' || COALESCE(l.description, ''))
            @@ plainto_tsquery('english', p_query)
    ORDER BY rank DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- MESSAGING FUNCTIONS
-- ================================================

-- Get conversations
CREATE OR REPLACE FUNCTION public.get_conversations(
    p_user_id UUID
)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_username TEXT,
    other_avatar_url TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH conversations AS (
        SELECT DISTINCT
            conversation_id,
            CASE 
                WHEN sender_id = p_user_id THEN recipient_id
                ELSE sender_id
            END AS other_user_id
        FROM public.messages
        WHERE sender_id = p_user_id OR recipient_id = p_user_id
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.content AS last_message,
            m.created_at AS last_message_time
        FROM public.messages m
        JOIN conversations c ON c.conversation_id = m.conversation_id
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    unread_counts AS (
        SELECT 
            m.conversation_id,
            COUNT(*) AS unread_count
        FROM public.messages m
        JOIN conversations c ON c.conversation_id = m.conversation_id
        WHERE m.recipient_id = p_user_id AND m.is_read = false
        GROUP BY m.conversation_id
    )
    SELECT 
        c.conversation_id,
        c.other_user_id,
        p.username AS other_username,
        p.avatar_url AS other_avatar_url,
        lm.last_message,
        lm.last_message_time,
        COALESCE(uc.unread_count, 0) AS unread_count
    FROM conversations c
    JOIN public.profiles p ON p.id = c.other_user_id
    JOIN last_messages lm ON lm.conversation_id = c.conversation_id
    LEFT JOIN unread_counts uc ON uc.conversation_id = c.conversation_id
    ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- ADMIN FUNCTIONS
-- ================================================

-- Get platform stats (admin only)
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles),
        'verified_users', (SELECT COUNT(*) FROM public.profiles WHERE is_verified = true),
        'brand_accounts', (SELECT COUNT(*) FROM public.profiles WHERE is_brand = true),
        'total_listings', (SELECT COUNT(*) FROM public.listings),
        'active_listings', (SELECT COUNT(*) FROM public.listings WHERE is_sold = false AND is_archived = false),
        'sold_listings', (SELECT COUNT(*) FROM public.listings WHERE is_sold = true),
        'total_orders', (SELECT COUNT(*) FROM public.orders),
        'completed_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered'),
        'total_revenue', (SELECT SUM(platform_fee) FROM public.orders WHERE status = 'delivered'),
        'total_gmv', (SELECT SUM(amount) FROM public.orders WHERE status = 'delivered'),
        'avg_order_value', (SELECT AVG(amount) FROM public.orders WHERE status = 'delivered'),
        'active_users_today', (SELECT COUNT(*) FROM public.profiles WHERE last_active > NOW() - INTERVAL '24 hours'),
        'new_users_today', (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '24 hours'),
        'orders_today', (SELECT COUNT(*) FROM public.orders WHERE created_at > NOW() - INTERVAL '24 hours')
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;