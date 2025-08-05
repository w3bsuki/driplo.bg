-- Add missing columns that the application expects

-- Add is_admin column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add email_verified column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add missing columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create or replace the increment_listing_views function
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE listings 
    SET view_count = COALESCE(view_count, 0) + 1,
        views = COALESCE(views, 0) + 1
    WHERE id = listing_id;
END;
$$;

-- Create function to get user's favorite status for listings
CREATE OR REPLACE FUNCTION get_user_favorites(user_id UUID)
RETURNS TABLE(listing_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT f.listing_id 
    FROM favorites f
    WHERE f.user_id = get_user_favorites.user_id;
END;
$$;

-- Create function to safely delete user data (for GDPR compliance)
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in order of dependencies
    DELETE FROM notifications WHERE user_id = delete_user_data.user_id;
    DELETE FROM listing_views WHERE user_id = delete_user_data.user_id;
    DELETE FROM user_ratings WHERE rating_by = delete_user_data.user_id OR rating_for = delete_user_data.user_id;
    DELETE FROM messages WHERE sender_id = delete_user_data.user_id;
    DELETE FROM conversations WHERE buyer_id = delete_user_data.user_id OR seller_id = delete_user_data.user_id;
    DELETE FROM cart_items WHERE user_id = delete_user_data.user_id;
    DELETE FROM favorites WHERE user_id = delete_user_data.user_id;
    DELETE FROM orders WHERE buyer_id = delete_user_data.user_id OR seller_id = delete_user_data.user_id;
    DELETE FROM listings WHERE user_id = delete_user_data.user_id;
    DELETE FROM payment_accounts WHERE user_id = delete_user_data.user_id;
    DELETE FROM profiles WHERE id = delete_user_data.user_id;
END;
$$;

-- Create trigger to sync email_verified from auth.users
CREATE OR REPLACE FUNCTION sync_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET email_verified = (NEW.email_confirmed_at IS NOT NULL)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_email_verified_trigger ON auth.users;

-- Create trigger
CREATE TRIGGER sync_email_verified_trigger
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_email_verified();

-- Create view for active listings with user favorites
CREATE OR REPLACE VIEW active_listings_with_favorites AS
SELECT 
    l.*,
    p.username as seller_username,
    p.avatar_url as seller_avatar,
    p.account_type as seller_account_type,
    COALESCE(fav_count.count, 0) as favorite_count
FROM listings l
JOIN profiles p ON l.user_id = p.id
LEFT JOIN (
    SELECT listing_id, COUNT(*) as count
    FROM favorites
    GROUP BY listing_id
) fav_count ON l.id = fav_count.listing_id
WHERE NOT l.is_sold 
    AND NOT l.is_archived 
    AND NOT l.is_draft;

-- Grant permissions on the view
GRANT SELECT ON active_listings_with_favorites TO authenticated;
GRANT SELECT ON active_listings_with_favorites TO anon;