-- ⚠️ WARNING: This will DELETE ALL DATA from your database!
-- Make sure to backup your database before running this script
-- Run: pg_dump -h [host] -U [user] -d [database] > backup.sql

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete all data in dependency order
TRUNCATE TABLE 
    notifications,
    listing_views,
    user_ratings,
    messages,
    conversations,
    cart_items,
    favorites,
    orders,
    listings,
    payment_accounts,
    social_media_accounts,
    brand_profiles,
    profiles
CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset all sequences
ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS listing_views_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_ratings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS favorites_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS listings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payment_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS social_media_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS brand_profiles_id_seq RESTART WITH 1;

-- Clean up auth.users (BE VERY CAREFUL WITH THIS!)
-- This will delete ALL users from your auth system
-- DELETE FROM auth.users;

-- Alternatively, delete all users except specific emails:
-- DELETE FROM auth.users WHERE email NOT IN ('w3bsuki@gmail.com');

-- Vacuum to reclaim space
VACUUM ANALYZE;