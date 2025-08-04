-- ================================================
-- DRIPLO MARKETPLACE - RPC FUNCTIONS
-- Phase 3: Server-Side Functions
-- ================================================
-- Run this after 002_rls_policies.sql
-- This creates all required RPC functions for the application

-- ================================================
-- AUTH & SECURITY FUNCTIONS
-- ================================================

-- Check authentication rate limit
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
    p_action TEXT,
    p_ip_address INET,
    p_user_id UUID DEFAULT NULL,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Log authentication event
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Cleanup old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_auth_rate_limit()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.auth_rate_limits
    WHERE (
        blocked_until IS NULL AND last_attempt < NOW() - INTERVAL '1 day'
    ) OR (
        blocked_until IS NOT NULL AND blocked_until < NOW() - INTERVAL '1 day'
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- ================================================
-- USER & PROFILE FUNCTIONS
-- ================================================

-- Create profile on signup
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        username,
        referral_code,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', ''),
        substring(encode(gen_random_bytes(6), 'base64') from 1 for 8),
        NOW(),
        NOW()
    );
    
    -- Create user stats summary
    INSERT INTO public.user_stats_summary (id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$;

-- Get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COALESCE(total_listings, 0),
        'active_listings', COALESCE(active_listings, 0),
        'sold_listings', COALESCE(sold_listings, 0),
        'total_sales', COALESCE(total_sales, 0),
        'total_purchases', COALESCE(total_purchases, 0),
        'avg_rating', COALESCE(avg_rating, 0),
        'total_reviews', COALESCE(total_reviews, 0),
        'follower_count', COALESCE(follower_count, 0),
        'following_count', COALESCE(following_count, 0)
    )
    INTO v_stats
    FROM public.user_stats_summary
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$;

-- Update user statistics
CREATE OR REPLACE FUNCTION public.update_user_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_stats_summary (
        id,
        total_listings,
        active_listings,
        sold_listings,
        total_sales,
        avg_rating,
        total_reviews,
        follower_count,
        following_count,
        last_calculated
    )
    SELECT 
        p_user_id,
        COUNT(l.id),
        COUNT(l.id) FILTER (WHERE NOT l.is_sold AND NOT l.is_archived),
        COUNT(l.id) FILTER (WHERE l.is_sold),
        COALESCE(SUM(o.amount) FILTER (WHERE o.seller_id = p_user_id AND o.status = 'delivered'), 0),
        COALESCE(AVG(r.rating) FILTER (WHERE r.reviewed_id = p_user_id), 0),
        COUNT(r.id) FILTER (WHERE r.reviewed_id = p_user_id),
        COUNT(f1.id),
        COUNT(f2.id),
        NOW()
    FROM public.profiles p
    LEFT JOIN public.listings l ON l.user_id = p.id
    LEFT JOIN public.orders o ON o.seller_id = p.id OR o.buyer_id = p.id
    LEFT JOIN public.user_ratings r ON r.reviewed_id = p.id
    LEFT JOIN public.user_follows f1 ON f1.following_id = p.id
    LEFT JOIN public.user_follows f2 ON f2.follower_id = p.id
    WHERE p.id = p_user_id
    GROUP BY p.id
    ON CONFLICT (id) DO UPDATE SET
        total_listings = EXCLUDED.total_listings,
        active_listings = EXCLUDED.active_listings,
        sold_listings = EXCLUDED.sold_listings,
        total_sales = EXCLUDED.total_sales,
        avg_rating = EXCLUDED.avg_rating,
        total_reviews = EXCLUDED.total_reviews,
        follower_count = EXCLUDED.follower_count,
        following_count = EXCLUDED.following_count,
        last_calculated = EXCLUDED.last_calculated,
        updated_at = NOW();
END;
$$;

-- ================================================
-- LISTING FUNCTIONS
-- ================================================

-- Track listing view
CREATE OR REPLACE FUNCTION public.track_listing_view(
    p_listing_id UUID,
    p_viewer_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert view record
    INSERT INTO public.listing_views (
        listing_id,
        viewer_id,
        ip_address,
        user_agent,
        referrer,
        session_id
    )
    VALUES (
        p_listing_id,
        p_viewer_id,
        p_ip_address,
        p_user_agent,
        p_referrer,
        p_session_id
    );
    
    -- Update listing view count
    UPDATE public.listings
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = p_listing_id;
END;
$$;

-- Get recommended listings
CREATE OR REPLACE FUNCTION public.get_recommended_listings(
    p_user_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    price DECIMAL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.price,
        l.thumbnail_url,
        l.created_at
    FROM public.listings l
    WHERE NOT l.is_sold 
      AND NOT l.is_archived 
      AND NOT l.is_draft
      AND (p_category_id IS NULL OR l.category_id = p_category_id)
      AND (p_user_id IS NULL OR l.user_id != p_user_id)
    ORDER BY 
        CASE 
            WHEN p_user_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.user_follows 
                WHERE follower_id = p_user_id AND following_id = l.user_id
            ) THEN 0 
            ELSE 1 
        END,
        l.view_count DESC,
        RANDOM()
    LIMIT p_limit;
END;
$$;

-- ================================================
-- ORDER FUNCTIONS
-- ================================================

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_number TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_order_number := 'DR' || LPAD(floor(random() * 1000000)::TEXT, 6, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM public.orders WHERE order_number = v_order_number
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_order_number;
END;
$$;

-- Create order with payment
CREATE OR REPLACE FUNCTION public.create_order_with_payment(
    p_buyer_id UUID,
    p_listing_id UUID,
    p_amount DECIMAL,
    p_shipping_amount DECIMAL DEFAULT 0,
    p_payment_intent_id TEXT DEFAULT NULL,
    p_shipping_address JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_seller_id UUID;
    v_platform_fee DECIMAL;
    v_seller_payout DECIMAL;
BEGIN
    -- Get seller from listing
    SELECT user_id INTO v_seller_id
    FROM public.listings
    WHERE id = p_listing_id;
    
    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION 'Listing not found';
    END IF;
    
    IF v_seller_id = p_buyer_id THEN
        RAISE EXCEPTION 'Cannot buy your own listing';
    END IF;
    
    -- Calculate fees (5% platform fee)
    v_platform_fee := p_amount * 0.05;
    v_seller_payout := p_amount - v_platform_fee;
    
    -- Create order
    INSERT INTO public.orders (
        order_number,
        buyer_id,
        seller_id,
        listing_id,
        amount,
        shipping_amount,
        platform_fee,
        seller_payout,
        payment_intent_id,
        shipping_address,
        status,
        payment_status
    )
    VALUES (
        public.generate_order_number(),
        p_buyer_id,
        v_seller_id,
        p_listing_id,
        p_amount,
        p_shipping_amount,
        v_platform_fee,
        v_seller_payout,
        p_payment_intent_id,
        p_shipping_address,
        'pending',
        'pending'
    )
    RETURNING id INTO v_order_id;
    
    RETURN v_order_id;
END;
$$;

-- ================================================
-- MESSAGING FUNCTIONS
-- ================================================

-- Get or create conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
    p_user1_id UUID,
    p_user2_id UUID,
    p_listing_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation_id UUID;
    v_participant1_id UUID;
    v_participant2_id UUID;
BEGIN
    -- Ensure consistent ordering of participants
    IF p_user1_id < p_user2_id THEN
        v_participant1_id := p_user1_id;
        v_participant2_id := p_user2_id;
    ELSE
        v_participant1_id := p_user2_id;
        v_participant2_id := p_user1_id;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE participant1_id = v_participant1_id
      AND participant2_id = v_participant2_id
      AND (listing_id = p_listing_id OR (listing_id IS NULL AND p_listing_id IS NULL));
    
    -- Create if doesn't exist
    IF v_conversation_id IS NULL THEN
        INSERT INTO public.conversations (
            participant1_id,
            participant2_id,
            listing_id
        )
        VALUES (
            v_participant1_id,
            v_participant2_id,
            p_listing_id
        )
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$;

-- ================================================
-- ANALYTICS FUNCTIONS
-- ================================================

-- Get seller analytics
CREATE OR REPLACE FUNCTION public.get_seller_analytics(p_seller_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COUNT(l.id),
        'active_listings', COUNT(l.id) FILTER (WHERE NOT l.is_sold AND NOT l.is_archived),
        'sold_listings', COUNT(l.id) FILTER (WHERE l.is_sold),
        'total_views', COALESCE(SUM(l.view_count), 0),
        'total_likes', COALESCE(SUM(l.like_count), 0),
        'total_sales', COALESCE(SUM(o.amount) FILTER (WHERE o.status = 'delivered'), 0),
        'avg_rating', COALESCE(AVG(r.rating), 0),
        'total_reviews', COUNT(r.id),
        'follower_count', (
            SELECT COUNT(*) FROM public.user_follows 
            WHERE following_id = p_seller_id
        )
    )
    INTO v_analytics
    FROM public.listings l
    LEFT JOIN public.orders o ON o.listing_id = l.id AND o.seller_id = p_seller_id
    LEFT JOIN public.user_ratings r ON r.reviewed_id = p_seller_id
    WHERE l.user_id = p_seller_id;
    
    RETURN v_analytics;
END;
$$;

-- Get brand statistics
CREATE OR REPLACE FUNCTION public.get_brand_statistics(p_brand_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COUNT(l.id),
        'active_listings', COUNT(l.id) FILTER (WHERE NOT l.is_sold AND NOT l.is_archived),
        'avg_price', COALESCE(AVG(l.price), 0),
        'total_views', COALESCE(SUM(l.view_count), 0),
        'popularity_score', COALESCE(SUM(l.view_count + l.like_count * 2), 0)
    )
    INTO v_stats
    FROM public.listings l
    WHERE l.brand_id = p_brand_id;
    
    RETURN v_stats;
END;
$$;

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Validate coupon code
CREATE OR REPLACE FUNCTION public.validate_coupon_code(
    p_code TEXT,
    p_user_id UUID,
    p_order_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon RECORD;
    v_usage_count INTEGER;
    v_discount_amount DECIMAL;
BEGIN
    -- Get coupon details
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = p_code
      AND is_active = true
      AND (valid_until IS NULL OR valid_until > NOW())
      AND valid_from <= NOW();
    
    IF v_coupon IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Invalid or expired coupon code'
        );
    END IF;
    
    -- Check usage limits
    SELECT COUNT(*) INTO v_usage_count
    FROM public.coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    
    IF v_usage_count >= v_coupon.user_limit THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Coupon usage limit exceeded'
        );
    END IF;
    
    IF v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Coupon usage limit reached'
        );
    END IF;
    
    -- Check minimum amount
    IF v_coupon.minimum_amount IS NOT NULL AND p_order_amount < v_coupon.minimum_amount THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Order amount does not meet minimum requirement'
        );
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount_amount := p_order_amount * (v_coupon.discount_value / 100);
    ELSE
        v_discount_amount := v_coupon.discount_value;
    END IF;
    
    -- Apply maximum discount limit
    IF v_coupon.maximum_discount IS NOT NULL AND v_discount_amount > v_coupon.maximum_discount THEN
        v_discount_amount := v_coupon.maximum_discount;
    END IF;
    
    RETURN jsonb_build_object(
        'valid', true,
        'coupon_id', v_coupon.id,
        'discount_amount', v_discount_amount,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value
    );
END;
$$;

-- ================================================
-- TRIGGERS
-- ================================================

-- Create the trigger for profile creation
CREATE TRIGGER create_profile_on_signup_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_on_signup();

-- Update listing counts when listings change
CREATE OR REPLACE FUNCTION public.update_listing_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Update stats for the listing owner
        PERFORM public.update_user_stats(NEW.user_id);
    ELSIF TG_OP = 'INSERT' THEN
        -- Update stats for the new listing owner
        PERFORM public.update_user_stats(NEW.user_id);
    ELSIF TG_OP = 'DELETE' THEN
        -- Update stats for the deleted listing owner
        PERFORM public.update_user_stats(OLD.user_id);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger for listing stats updates
CREATE TRIGGER update_listing_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_listing_counts();

-- Update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        participant1_unread_count = CASE 
            WHEN participant1_id = NEW.recipient_id THEN participant1_unread_count + 1 
            ELSE participant1_unread_count 
        END,
        participant2_unread_count = CASE 
            WHEN participant2_id = NEW.recipient_id THEN participant2_unread_count + 1 
            ELSE participant2_unread_count 
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for conversation updates
CREATE TRIGGER update_conversation_on_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_on_message();

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
-- Phase 3 Complete: All RPC functions created successfully
-- Next: Run 004_indexes_performance.sql for optimal query performance