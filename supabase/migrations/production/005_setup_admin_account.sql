-- Setup admin account after creating user through Supabase Auth
-- First create the user account through the application or Supabase dashboard:
-- Email: w3bsuki@gmail.com
-- Password: 12345678

-- Then run this script to set up admin privileges

-- Update profile with admin privileges
UPDATE profiles
SET 
    username = 'admin',
    full_name = 'Admin User',
    account_type = 'personal',
    is_admin = true,
    onboarding_completed = true,
    setup_completed = true,
    email_verified = true,
    bio = 'Platform Administrator',
    website_url = 'https://driplo.bg',
    location_city = 'Sofia',
    location_country = 'Bulgaria',
    updated_at = now()
WHERE email = 'w3bsuki@gmail.com';

-- Create an admin role if using custom roles
-- First check if the user exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'w3bsuki@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Update the user's metadata to include admin role
        UPDATE auth.users
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            '{"role": "admin", "is_admin": true}'::jsonb
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin privileges granted to user %', admin_user_id;
    ELSE
        RAISE EXCEPTION 'User with email w3bsuki@gmail.com not found. Please create the account first.';
    END IF;
END $$;

-- Create admin-only policies for sensitive operations
-- Policy to allow admins to view all orders
CREATE POLICY "admins_view_all_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Policy to allow admins to view all messages (for moderation)
CREATE POLICY "admins_view_all_messages" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Policy to allow admins to update any listing (for moderation)
CREATE POLICY "admins_update_any_listing" ON listings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Policy to allow admins to delete any listing (for moderation)
CREATE POLICY "admins_delete_any_listing" ON listings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND is_admin = true
    );
END;
$$;

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM listings WHERE NOT is_draft) as total_listings,
    (SELECT COUNT(*) FROM listings WHERE created_at >= NOW() - INTERVAL '30 days' AND NOT is_draft) as new_listings_30d,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days') as new_orders_30d,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM listings WHERE is_sold) as total_sold,
    (SELECT COUNT(DISTINCT buyer_id) FROM orders) as total_buyers,
    (SELECT COUNT(DISTINCT user_id) FROM listings) as total_sellers;

-- Grant access to admin view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Log admin setup completion
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    id,
    'system',
    'Admin Account Setup Complete',
    'Your admin account has been successfully configured with full platform privileges.',
    '{"setup_date": "' || NOW()::text || '"}'::jsonb
FROM profiles
WHERE email = 'w3bsuki@gmail.com';