-- ================================================
-- DRIPLO MARKETPLACE - STORAGE & INITIAL DATA
-- Phase 5: Storage Setup and Seed Data
-- ================================================
-- Run this after 004_indexes_performance.sql
-- This sets up storage buckets and inserts initial data

-- ================================================
-- STORAGE BUCKETS SETUP
-- ================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('listings', 'listings', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('documents', 'documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('brands', 'brands', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE RLS POLICIES
-- ================================================

-- Avatars bucket policies
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Listings bucket policies
CREATE POLICY "listings_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "listings_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listings' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "listings_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listings' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "listings_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listings' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Documents bucket policies (private)
CREATE POLICY "documents_select_own" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND is_admin = true
            )
        )
    );

CREATE POLICY "documents_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "documents_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Brands bucket policies
CREATE POLICY "brands_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'brands');

CREATE POLICY "brands_insert_admin" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'brands' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "brands_update_admin" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'brands' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ================================================
-- INITIAL CATEGORIES DATA
-- ================================================

INSERT INTO public.categories (name, slug, description, icon, display_order, is_active) VALUES
-- Main Categories
('Women', 'women', 'Women''s fashion and accessories', 'user-female', 1, true),
('Men', 'men', 'Men''s fashion and accessories', 'user-male', 2, true),
('Kids', 'kids', 'Children''s clothing and accessories', 'baby', 3, true),
('Accessories', 'accessories', 'Fashion accessories and jewelry', 'star', 4, true),
('Bags', 'bags', 'Handbags, backpacks, and luggage', 'shopping-bag', 5, true),
('Shoes', 'shoes', 'Footwear for all occasions', 'shoe-sneaker', 6, true),
('Beauty', 'beauty', 'Cosmetics and beauty products', 'heart', 7, true),
('Home', 'home', 'Home decor and lifestyle items', 'home', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Women's Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active)
SELECT 
    subcategory_name,
    subcategory_slug,
    subcategory_description,
    women_id,
    subcategory_order,
    true
FROM (
    SELECT id as women_id FROM public.categories WHERE slug = 'women'
) women_cat
CROSS JOIN (
    VALUES 
        ('Dresses', 'womens-dresses', 'Casual and formal dresses', 1),
        ('Tops', 'womens-tops', 'Blouses, t-shirts, and tops', 2),
        ('Bottoms', 'womens-bottoms', 'Jeans, pants, and skirts', 3),
        ('Outerwear', 'womens-outerwear', 'Coats, jackets, and blazers', 4),
        ('Activewear', 'womens-activewear', 'Sportswear and fitness clothing', 5),
        ('Intimates', 'womens-intimates', 'Lingerie and underwear', 6),
        ('Swimwear', 'womens-swimwear', 'Bikinis and swimsuits', 7)
) AS subcats(subcategory_name, subcategory_slug, subcategory_description, subcategory_order)
ON CONFLICT (slug) DO NOTHING;

-- Men's Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active)
SELECT 
    subcategory_name,
    subcategory_slug,
    subcategory_description,
    men_id,
    subcategory_order,
    true
FROM (
    SELECT id as men_id FROM public.categories WHERE slug = 'men'
) men_cat
CROSS JOIN (
    VALUES 
        ('T-Shirts', 'mens-tshirts', 'Casual and graphic tees', 1),
        ('Shirts', 'mens-shirts', 'Dress shirts and casual shirts', 2),
        ('Pants', 'mens-pants', 'Jeans, chinos, and trousers', 3),
        ('Outerwear', 'mens-outerwear', 'Jackets, coats, and hoodies', 4),
        ('Activewear', 'mens-activewear', 'Sportswear and fitness clothing', 5),
        ('Suits', 'mens-suits', 'Formal wear and business attire', 6),
        ('Underwear', 'mens-underwear', 'Underwear and undershirts', 7)
) AS subcats(subcategory_name, subcategory_slug, subcategory_description, subcategory_order)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- INITIAL BRANDS DATA
-- ================================================

INSERT INTO public.brands (name, slug, description, is_verified, is_popular) VALUES
-- Luxury Brands
('Gucci', 'gucci', 'Italian luxury fashion house', true, true),
('Louis Vuitton', 'louis-vuitton', 'French luxury fashion house', true, true),
('Chanel', 'chanel', 'French luxury fashion house', true, true),
('Hermès', 'hermes', 'French luxury goods manufacturer', true, true),
('Prada', 'prada', 'Italian luxury fashion house', true, true),
('Dior', 'dior', 'French luxury fashion house', true, true),
('Bottega Veneta', 'bottega-veneta', 'Italian luxury fashion house', true, true),
('Saint Laurent', 'saint-laurent', 'French luxury fashion house', true, true),

-- Premium Brands
('Balenciaga', 'balenciaga', 'Spanish luxury fashion house', true, true),
('Givenchy', 'givenchy', 'French luxury fashion house', true, true),
('Versace', 'versace', 'Italian luxury fashion company', true, true),
('Burberry', 'burberry', 'British luxury fashion house', true, true),
('Fendi', 'fendi', 'Italian luxury fashion house', true, true),
('Celine', 'celine', 'French luxury fashion house', true, true),
('Loewe', 'loewe', 'Spanish luxury fashion house', true, true),

-- Contemporary Brands
('Off-White', 'off-white', 'Italian luxury streetwear brand', true, true),
('Stone Island', 'stone-island', 'Italian luxury sportswear brand', true, true),
('Acne Studios', 'acne-studios', 'Swedish fashion house', true, true),
('Ganni', 'ganni', 'Danish contemporary fashion brand', true, true),
('Jacquemus', 'jacquemus', 'French fashion house', true, true),

-- Accessible Luxury
('COS', 'cos', 'Swedish fashion brand', true, false),
('& Other Stories', 'and-other-stories', 'Swedish fashion brand', true, false),
('Arket', 'arket', 'Swedish fashion brand', true, false),
('Zara', 'zara', 'Spanish fast fashion retailer', true, false),
('H&M', 'hm', 'Swedish multinational clothing retailer', true, false)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- INITIAL COUPONS DATA
-- ================================================

INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_amount, usage_limit, user_limit, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 50.00, 1000, 1, NOW() + INTERVAL '1 year', true),
('SUMMER20', 'Summer sale discount', 'percentage', 20.00, 100.00, 500, 2, NOW() + INTERVAL '3 months', true),
('FREESHIP', 'Free shipping on orders over €75', 'fixed', 5.00, 75.00, 2000, 3, NOW() + INTERVAL '6 months', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================
-- CREATE ADMIN USER FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find user by email
    SELECT au.id, p.id as profile_id
    INTO user_record
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE au.email = user_email;
    
    IF user_record.id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN false;
    END IF;
    
    -- Create profile if it doesn't exist
    IF user_record.profile_id IS NULL THEN
        INSERT INTO public.profiles (id, email, is_admin, account_type)
        VALUES (user_record.id, user_email, true, 'admin');
    ELSE
        -- Update existing profile
        UPDATE public.profiles 
        SET is_admin = true, 
            account_type = 'admin',
            updated_at = NOW()
        WHERE id = user_record.id;
    END IF;
    
    RAISE NOTICE 'User % has been made admin', user_email;
    RETURN true;
END;
$$;

-- ================================================
-- HELPER FUNCTIONS FOR INITIAL SETUP
-- ================================================

-- Function to generate referral codes for existing users
CREATE OR REPLACE FUNCTION public.generate_missing_referral_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER := 0;
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM public.profiles WHERE referral_code IS NULL
    LOOP
        UPDATE public.profiles 
        SET referral_code = substring(encode(gen_random_bytes(6), 'base64') from 1 for 8),
            updated_at = NOW()
        WHERE id = user_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$;

-- Function to initialize user stats for existing users
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    processed_count INTEGER := 0;
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM public.profiles 
        WHERE id NOT IN (SELECT id FROM public.user_stats_summary)
    LOOP
        INSERT INTO public.user_stats_summary (id) VALUES (user_record.id);
        PERFORM public.update_user_stats(user_record.id);
        
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$;

-- ================================================
-- MAINTENANCE FUNCTIONS
-- ================================================

-- Function to clean up expired items
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    rate_limits_deleted INTEGER;
    expired_carts_deleted INTEGER;
    old_auth_events_deleted INTEGER;
BEGIN
    -- Clean up old rate limit entries
    DELETE FROM public.auth_rate_limits
    WHERE (
        blocked_until IS NULL AND last_attempt < NOW() - INTERVAL '7 days'
    ) OR (
        blocked_until IS NOT NULL AND blocked_until < NOW() - INTERVAL '1 day'
    );
    GET DIAGNOSTICS rate_limits_deleted = ROW_COUNT;
    
    -- Clean up expired shopping carts
    DELETE FROM public.shopping_carts
    WHERE expires_at < NOW();
    GET DIAGNOSTICS expired_carts_deleted = ROW_COUNT;
    
    -- Clean up old auth events (keep last 90 days)
    DELETE FROM public.auth_events
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS old_auth_events_deleted = ROW_COUNT;
    
    result := jsonb_build_object(
        'rate_limits_deleted', rate_limits_deleted,
        'expired_carts_deleted', expired_carts_deleted,  
        'old_auth_events_deleted', old_auth_events_deleted,
        'cleaned_at', NOW()
    );
    
    RETURN result;
END;
$$;

-- ================================================
-- SCHEDULED CLEANUP (Run this manually or set up cron)
-- ================================================

-- Generate referral codes for any users missing them
SELECT public.generate_missing_referral_codes();

-- Initialize user stats for existing users
SELECT public.initialize_user_stats();

-- ================================================
-- FINAL SETUP INSTRUCTIONS
-- ================================================

-- To complete the setup:
-- 1. Run: SELECT public.make_user_admin('your-admin-email@example.com');
-- 2. Set up a cron job to run: SELECT public.cleanup_expired_data();
-- 3. Consider setting up pg_cron for automated maintenance:
--    SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT public.cleanup_expired_data();');

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
-- Phase 5 Complete: Storage buckets created and initial data inserted
-- Your Driplo marketplace database is now ready for production!
-- 
-- Next steps:
-- 1. Generate TypeScript types: npx supabase gen types typescript --project-id=your-project-id
-- 2. Test authentication flows
-- 3. Upload some test images to verify storage works
-- 4. Create your first admin user with: SELECT public.make_user_admin('your-email@example.com');