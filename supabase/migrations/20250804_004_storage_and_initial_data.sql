-- STORAGE BUCKETS AND INITIAL DATA FOR DRIPLO MARKETPLACE
-- Run this after 003_rpc_functions.sql

-- ================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard Storage section)
-- ================================================
-- Note: Storage buckets must be created via Supabase Dashboard or Management API
-- Navigate to Storage section and create these buckets:
-- 1. avatars (public)
-- 2. listings (public)
-- 3. brands (public)
-- 4. documents (private)
-- 5. chat-attachments (private)

-- Storage policies will be created automatically when buckets are created

-- ================================================
-- INITIAL CATEGORIES DATA
-- ================================================

-- Main categories
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Women', 'women', 'Women''s fashion', 1),
    ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Men', 'men', 'Men''s fashion', 2),
    ('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Kids', 'kids', 'Children''s fashion', 3),
    ('d4e5f6a7-b8c9-0123-defa-456789012345', 'Accessories', 'accessories', 'Fashion accessories', 4),
    ('e5f6a7b8-c9d0-1234-efab-567890123456', 'Shoes', 'shoes', 'Footwear', 5),
    ('f6a7b8c9-d0e1-2345-fabc-678901234567', 'Bags', 'bags', 'Bags and luggage', 6)
ON CONFLICT (id) DO NOTHING;

-- Women's subcategories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Dresses', 'women-dresses', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1),
    ('Tops', 'women-tops', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2),
    ('Bottoms', 'women-bottoms', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3),
    ('Outerwear', 'women-outerwear', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4),
    ('Activewear', 'women-activewear', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5),
    ('Swimwear', 'women-swimwear', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6),
    ('Lingerie', 'women-lingerie', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7),
    ('Suits', 'women-suits', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8)
ON CONFLICT (slug) DO NOTHING;

-- Men's subcategories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Shirts', 'men-shirts', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 1),
    ('T-Shirts', 'men-tshirts', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 2),
    ('Pants', 'men-pants', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 3),
    ('Jeans', 'men-jeans', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 4),
    ('Outerwear', 'men-outerwear', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 5),
    ('Suits', 'men-suits', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 6),
    ('Activewear', 'men-activewear', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 7),
    ('Underwear', 'men-underwear', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 8)
ON CONFLICT (slug) DO NOTHING;

-- Kids' subcategories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Girls', 'kids-girls', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 1),
    ('Boys', 'kids-boys', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 2),
    ('Baby', 'kids-baby', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 3),
    ('School Uniforms', 'kids-uniforms', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 4)
ON CONFLICT (slug) DO NOTHING;

-- Accessories subcategories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Jewelry', 'accessories-jewelry', 'd4e5f6a7-b8c9-0123-defa-456789012345', 1),
    ('Watches', 'accessories-watches', 'd4e5f6a7-b8c9-0123-defa-456789012345', 2),
    ('Belts', 'accessories-belts', 'd4e5f6a7-b8c9-0123-defa-456789012345', 3),
    ('Hats', 'accessories-hats', 'd4e5f6a7-b8c9-0123-defa-456789012345', 4),
    ('Scarves', 'accessories-scarves', 'd4e5f6a7-b8c9-0123-defa-456789012345', 5),
    ('Sunglasses', 'accessories-sunglasses', 'd4e5f6a7-b8c9-0123-defa-456789012345', 6),
    ('Wallets', 'accessories-wallets', 'd4e5f6a7-b8c9-0123-defa-456789012345', 7)
ON CONFLICT (slug) DO NOTHING;

-- Shoes subcategories  
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Sneakers', 'shoes-sneakers', 'e5f6a7b8-c9d0-1234-efab-567890123456', 1),
    ('Boots', 'shoes-boots', 'e5f6a7b8-c9d0-1234-efab-567890123456', 2),
    ('Heels', 'shoes-heels', 'e5f6a7b8-c9d0-1234-efab-567890123456', 3),
    ('Flats', 'shoes-flats', 'e5f6a7b8-c9d0-1234-efab-567890123456', 4),
    ('Sandals', 'shoes-sandals', 'e5f6a7b8-c9d0-1234-efab-567890123456', 5),
    ('Loafers', 'shoes-loafers', 'e5f6a7b8-c9d0-1234-efab-567890123456', 6),
    ('Athletic', 'shoes-athletic', 'e5f6a7b8-c9d0-1234-efab-567890123456', 7)
ON CONFLICT (slug) DO NOTHING;

-- Bags subcategories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
    ('Handbags', 'bags-handbags', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 1),
    ('Backpacks', 'bags-backpacks', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 2),
    ('Clutches', 'bags-clutches', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 3),
    ('Tote Bags', 'bags-totes', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 4),
    ('Crossbody', 'bags-crossbody', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 5),
    ('Luggage', 'bags-luggage', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 6),
    ('Briefcases', 'bags-briefcases', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 7)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- INITIAL BRANDS DATA
-- ================================================

INSERT INTO public.brands (name, slug, is_verified, is_popular) VALUES
    -- Luxury brands
    ('Gucci', 'gucci', true, true),
    ('Louis Vuitton', 'louis-vuitton', true, true),
    ('Chanel', 'chanel', true, true),
    ('Hermès', 'hermes', true, true),
    ('Prada', 'prada', true, true),
    ('Dior', 'dior', true, true),
    ('Balenciaga', 'balenciaga', true, true),
    ('Saint Laurent', 'saint-laurent', true, true),
    ('Versace', 'versace', true, true),
    ('Burberry', 'burberry', true, true),
    ('Bottega Veneta', 'bottega-veneta', true, true),
    ('Valentino', 'valentino', true, true),
    ('Givenchy', 'givenchy', true, true),
    ('Fendi', 'fendi', true, true),
    ('Celine', 'celine', true, true),
    
    -- Premium brands
    ('Coach', 'coach', true, true),
    ('Michael Kors', 'michael-kors', true, true),
    ('Marc Jacobs', 'marc-jacobs', true, true),
    ('Tory Burch', 'tory-burch', true, true),
    ('Kate Spade', 'kate-spade', true, true),
    ('Ralph Lauren', 'ralph-lauren', true, true),
    ('Tommy Hilfiger', 'tommy-hilfiger', true, true),
    ('Calvin Klein', 'calvin-klein', true, true),
    ('Hugo Boss', 'hugo-boss', true, true),
    ('Armani', 'armani', true, true),
    
    -- Streetwear & Contemporary
    ('Supreme', 'supreme', true, true),
    ('Off-White', 'off-white', true, true),
    ('Stone Island', 'stone-island', true, true),
    ('Stussy', 'stussy', true, true),
    ('Palace', 'palace', true, true),
    ('A Bathing Ape', 'bape', true, true),
    ('Fear of God', 'fear-of-god', true, true),
    ('Kith', 'kith', true, true),
    
    -- Sportswear
    ('Nike', 'nike', true, true),
    ('Adidas', 'adidas', true, true),
    ('Puma', 'puma', true, true),
    ('New Balance', 'new-balance', true, true),
    ('Under Armour', 'under-armour', true, true),
    ('Lululemon', 'lululemon', true, true),
    ('The North Face', 'the-north-face', true, true),
    ('Patagonia', 'patagonia', true, true),
    
    -- Fast Fashion
    ('Zara', 'zara', true, true),
    ('H&M', 'hm', true, true),
    ('Uniqlo', 'uniqlo', true, true),
    ('Mango', 'mango', true, true),
    ('COS', 'cos', true, true),
    ('& Other Stories', 'and-other-stories', true, false),
    ('Massimo Dutti', 'massimo-dutti', true, false),
    
    -- Other Popular
    ('Acne Studios', 'acne-studios', true, false),
    ('Ganni', 'ganni', true, false),
    ('Reformation', 'reformation', true, false),
    ('AllSaints', 'allsaints', true, false),
    ('Diesel', 'diesel', true, false),
    ('Guess', 'guess', true, false),
    ('Levis', 'levis', true, true),
    ('Dr. Martens', 'dr-martens', true, true),
    ('Converse', 'converse', true, true),
    ('Vans', 'vans', true, true)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- CREATE ADMIN USER (Replace with your email)
-- ================================================
-- Note: Run this after creating your first user account
-- UPDATE public.profiles 
-- SET is_admin = true, is_verified = true 
-- WHERE email = 'your-admin-email@example.com';

-- ================================================
-- PERFORMANCE OPTIMIZATIONS
-- ================================================

-- Create text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_search 
    ON public.listings 
    USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_brands_search 
    ON public.brands 
    USING gin(to_tsvector('english', name));

-- Create BRIN indexes for time-series data
CREATE INDEX IF NOT EXISTS idx_orders_created_at_brin 
    ON public.orders 
    USING brin(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_created_at_brin 
    ON public.messages 
    USING brin(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at_brin 
    ON public.notifications 
    USING brin(created_at);

-- ================================================
-- FINAL SETUP NOTES
-- ================================================

-- 1. Create storage buckets in Supabase Dashboard:
--    - avatars (public)
--    - listings (public)  
--    - brands (public)
--    - documents (private)
--    - chat-attachments (private)

-- 2. Configure Auth settings in Supabase Dashboard:
--    - Enable Email provider
--    - Set up email templates
--    - Configure redirect URLs
--    - Enable RLS on auth.users if needed

-- 3. Set up Edge Functions for:
--    - Image optimization
--    - Email notifications
--    - Webhook handlers

-- 4. Configure environment variables in your app:
--    - PUBLIC_SUPABASE_URL
--    - PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY

-- 5. Generate TypeScript types:
--    npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

-- 6. Test the setup:
--    - Create a test user
--    - Create a test listing
--    - Test auth flow
--    - Test RLS policies