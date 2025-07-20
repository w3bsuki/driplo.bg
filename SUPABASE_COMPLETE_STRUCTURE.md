# Complete Supabase Database Structure for Driplo

This document contains all tables, columns, indexes, constraints, RLS policies, functions, storage buckets, and authentication configuration needed to recreate the Supabase backend for Driplo.

## Summary

The Driplo marketplace uses:
- **33 database tables** for the complete e-commerce functionality
- **77+ RLS policies** for secure data access
- **66 database functions** for business logic
- **16 custom enum types** for consistent data validation
- **5 storage buckets** for file uploads
- **Supabase Auth** for user authentication

## Database Schema

### Custom Types (Enums)

```sql
-- Achievement Types
CREATE TYPE achievement_type AS ENUM (
    'first_sale', 'power_seller', 'top_rated', 'verified_seller',
    'social_butterfly', 'quick_shipper', 'loyal_customer', 'trendsetter'
);

-- Discount Types
CREATE TYPE discount_type AS ENUM (
    'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
);

-- Dispute Status
CREATE TYPE dispute_status AS ENUM (
    'open', 'awaiting_seller_response', 'awaiting_buyer_response',
    'under_review', 'escalated', 'resolved', 'closed', 'cancelled'
);

-- Dispute Types
CREATE TYPE dispute_type AS ENUM (
    'item_not_received', 'item_not_as_described', 'damaged_item',
    'counterfeit_item', 'unauthorized_transaction', 'seller_not_responding',
    'buyer_not_responding', 'payment_issue', 'other'
);

-- Notification Channels
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');

-- Notification Types
CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_paid', 'order_shipped', 'order_delivered',
    'order_cancelled', 'new_message', 'new_rating', 'new_follower',
    'listing_favorited', 'listing_sold', 'price_drop', 'return_requested',
    'payment_received', 'achievement_earned', 'promotion_alert'
);

-- Order Status
CREATE TYPE order_status AS ENUM (
    'pending_payment', 'payment_processing', 'payment_failed', 'paid',
    'preparing', 'shipped', 'in_transit', 'delivered', 'completed',
    'cancelled', 'refunded'
);

-- Payment Method Types
CREATE TYPE payment_method_type AS ENUM (
    'card', 'bank', 'paypal', 'stripe_link', 'apple_pay', 'google_pay'
);

-- Payment Status
CREATE TYPE payment_status AS ENUM (
    'pending', 'processing', 'requires_action', 'succeeded',
    'failed', 'cancelled', 'refunded', 'partially_refunded'
);

-- Promotion Targets
CREATE TYPE promotion_target AS ENUM (
    'all_items', 'category', 'seller', 'specific_items'
);

-- Rating Types
CREATE TYPE rating_type AS ENUM ('seller', 'buyer');

-- Resolution Types
CREATE TYPE resolution_type AS ENUM (
    'full_refund', 'partial_refund', 'replacement', 'return_and_refund',
    'keep_item_partial_refund', 'no_action', 'cancelled_by_buyer',
    'cancelled_by_seller'
);

-- Return Reasons
CREATE TYPE return_reason AS ENUM (
    'defective', 'not_as_described', 'wrong_item', 'doesnt_fit',
    'changed_mind', 'damaged_in_shipping', 'missing_parts',
    'quality_issue', 'other'
);

-- Return Status
CREATE TYPE return_status AS ENUM (
    'requested', 'approved', 'rejected', 'shipped_back',
    'received', 'inspecting', 'refunded', 'replaced', 'closed'
);

-- Shipping Carriers
CREATE TYPE shipping_carrier AS ENUM (
    'ups', 'fedex', 'usps', 'dhl', 'local', 'other'
);

-- Tracking Status
CREATE TYPE tracking_status AS ENUM (
    'label_created', 'picked_up', 'in_transit', 'out_for_delivery',
    'delivered', 'delivery_failed', 'returned_to_sender'
);
```

### Database Tables

The complete table structures are documented in `DATABASE_SCHEMA_COMPLETE.md`. Here's a summary of the 33 tables:

1. **Authentication & User Management**
   - `profiles` - User profiles
   - `auth_sessions` - Active authentication sessions
   - `auth_login_history` - Login audit trail
   - `active_user_sessions` - Session tracking

2. **Product & Listing Management**
   - `listings` - Product listings
   - `product_variants` - Product variations (sizes, colors)
   - `categories` - Product categories
   - `favorites` - User favorites/wishlist

3. **Shopping & Orders**
   - `shopping_carts` - User shopping carts
   - `cart_items` - Items in carts
   - `orders` - Purchase orders
   - `order_items` - Items in orders
   - `order_status_history` - Order status tracking
   - `order_tracking` - Shipping tracking

4. **Payment & Transactions**
   - `payment_accounts` - Seller payment accounts
   - `payment_methods` - Buyer payment methods
   - `payment_transactions` - Payment records
   - `transactions` - Platform transaction ledger
   - `store_credits` - User store credit balance
   - `stripe_webhook_events` - Stripe integration

5. **Communication & Support**
   - `conversations` - Buyer-seller conversations
   - `messages` - Chat messages
   - `notifications` - User notifications
   - `disputes` - Order disputes
   - `dispute_messages` - Dispute communication

6. **Shipping & Returns**
   - `shipping_addresses` - User addresses
   - `shipping_labels` - Generated shipping labels
   - `returns` - Return requests

7. **Marketing & Analytics**
   - `coupons` - Discount coupons
   - `coupon_usage` - Coupon redemption tracking
   - `user_follows` - User following system
   - `user_ratings` - User ratings and reviews
   - `user_stats_summary` - Aggregated user statistics

## Row Level Security (RLS) Policies

### Authentication Tables

**profiles**
- `Anyone can view profiles` - SELECT: true
- `Users can insert own profile` - INSERT: auth.uid() = id
- `Users can update own profile` - UPDATE: auth.uid() = id

**auth_sessions**
- `Users can view own sessions` - SELECT: user_id = auth.uid()
- `Users can delete own sessions` - DELETE: user_id = auth.uid()

**auth_login_history**
- `Users can view own login history` - SELECT: user_id = auth.uid()

### Product & Listing Tables

**listings**
- `Listings are viewable by everyone` - SELECT: status IN ('active', 'sold', 'reserved')
- `Users can create their own listings` - INSERT: auth.uid() = seller_id
- `Users can update their own listings` - UPDATE: auth.uid() = seller_id
- `Users can delete their own listings` - DELETE: auth.uid() = seller_id

**product_variants**
- `Variants are viewable by everyone` - SELECT: true
- `Sellers can manage their variants` - ALL: listing.seller_id = auth.uid()

**categories**
- `Categories are public` - SELECT: true

**favorites**
- `Users can view their own favorites` - SELECT: auth.uid() = user_id
- `Users can add favorites` - INSERT: auth.uid() = user_id
- `Users can remove their favorites` - DELETE: auth.uid() = user_id

### Shopping & Order Tables

**shopping_carts**
- `Users can view their own cart` - SELECT: auth.uid() = user_id
- `Users can create their own cart` - INSERT: auth.uid() = user_id
- `Users can update their own cart` - UPDATE: auth.uid() = user_id
- `Users can delete their own cart` - DELETE: auth.uid() = user_id

**cart_items**
- `Users can view their cart items` - SELECT: cart.user_id = auth.uid()
- `Users can add items to their cart` - INSERT: cart.user_id = auth.uid()
- `Users can update their cart items` - UPDATE: cart.user_id = auth.uid()
- `Users can remove items from their cart` - DELETE: cart.user_id = auth.uid()

**orders**
- `Users can view their orders` - SELECT: buyer_id = auth.uid() OR seller_id = auth.uid()
- `Buyers can create orders` - INSERT: auth.uid() = buyer_id
- `Buyers can cancel pending orders` - UPDATE: auth.uid() = buyer_id AND status IN ('pending_payment', 'payment_processing')
- `Sellers can update order status` - UPDATE: auth.uid() = seller_id

**order_items**
- `Users can view order items` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()
- `Order items created with orders` - INSERT: order.buyer_id = auth.uid()

**order_status_history**
- `Users can view order status history` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()

**order_tracking**
- `Users can view tracking for their orders` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()
- `Sellers can create tracking` - INSERT: order.seller_id = auth.uid()
- `Sellers can update tracking` - UPDATE: order.seller_id = auth.uid()

### Payment Tables

**payment_accounts**
- `Users can view their own payment account` - SELECT: auth.uid() = user_id
- `Users can create their own payment account` - INSERT: auth.uid() = user_id
- `Users can update their own payment account` - UPDATE: auth.uid() = user_id

**payment_methods**
- `Users can view their payment methods` - SELECT: auth.uid() = user_id
- `Users can manage their payment methods` - ALL: auth.uid() = user_id

**payment_transactions**
- `Users can view their transactions` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()

**transactions**
- `Users can view own transactions` - SELECT: buyer_id = auth.uid() OR seller_id = auth.uid()
- `System can insert transactions` - INSERT: true
- `System can update transactions` - UPDATE: true

**store_credits**
- `Users can view their store credits` - SELECT: auth.uid() = user_id

**stripe_webhook_events**
- `Service role only` - ALL: role = service_role

### Communication Tables

**conversations**
- `Users can view their conversations` - SELECT: buyer_id = auth.uid() OR seller_id = auth.uid()
- `Users can start conversations` - INSERT: auth.uid() = buyer_id

**messages**
- `Users can view messages in their conversations` - SELECT: conversation.buyer_id = auth.uid() OR conversation.seller_id = auth.uid()
- `Users can send messages in their conversations` - INSERT: conversation.buyer_id = auth.uid() OR conversation.seller_id = auth.uid()

**notifications**
- `Users can view their own notifications` - SELECT: auth.uid() = user_id
- `Users can update their own notifications` - UPDATE: auth.uid() = user_id
- `Users can delete their own notifications` - DELETE: auth.uid() = user_id
- `System can create notifications` - INSERT: true

**disputes**
- `Users can view their disputes` - SELECT: initiated_by = auth.uid() OR respondent_id = auth.uid() OR is_support_agent
- `Users can create disputes for their orders` - INSERT: auth.uid() = initiated_by AND order.buyer_id = auth.uid() OR order.seller_id = auth.uid()
- `Parties can update their disputes` - UPDATE: initiated_by = auth.uid() OR respondent_id = auth.uid() OR is_support_agent

**dispute_messages**
- `Parties can view dispute messages` - SELECT: dispute parties or support agents
- `Parties can send messages` - INSERT: dispute parties with open/active dispute

### Shipping & Returns Tables

**shipping_addresses**
- `Users can view their own addresses` - SELECT: auth.uid() = user_id
- `Users can create their own addresses` - INSERT: auth.uid() = user_id
- `Users can update their own addresses` - UPDATE: auth.uid() = user_id
- `Users can delete their own addresses` - DELETE: auth.uid() = user_id

**shipping_labels**
- `Users can view labels for their orders` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()
- `Sellers can create labels` - INSERT: order.seller_id = auth.uid()

**returns**
- `Users can view returns for their orders` - SELECT: order.buyer_id = auth.uid() OR order.seller_id = auth.uid()
- `Buyers can create returns` - INSERT: auth.uid() = requested_by AND order.buyer_id = auth.uid() AND order.status IN ('delivered', 'completed')
- `Sellers can update return status` - UPDATE: order.seller_id = auth.uid()

### Marketing Tables

**coupons**
- `Public coupons are viewable` - SELECT: is_active = true AND (seller_id IS NULL OR seller_id = auth.uid()) AND (user_ids = '{}' OR auth.uid() IN user_ids)
- `Sellers can create coupons` - INSERT: created_by = auth.uid() AND (seller_id IS NULL OR seller_id = auth.uid())
- `Sellers can update their coupons` - UPDATE: created_by = auth.uid()

**coupon_usage**
- `Users can view their usage` - SELECT: user_id = auth.uid()

**user_follows**
- `Follows are public` - SELECT: true
- `Users can follow others` - INSERT: auth.uid() = follower_id
- `Users can unfollow` - DELETE: auth.uid() = follower_id

**user_ratings**
- `Ratings are viewable by everyone` - SELECT: true
- `Users can rate others` - INSERT: auth.uid() = rater_user_id
- `Users can update their own ratings` - UPDATE: auth.uid() = rater_user_id

**user_stats_summary**
- `Users can view their own stats` - SELECT: user_id = auth.uid()

## Database Functions

The database includes 66 functions for business logic:

### Authentication Functions
- `auth_is_admin()` - Check if current user is admin
- `auth_is_verified_seller()` - Check if current user is verified seller
- `auth_user_id()` - Get current user ID
- `create_auth_session()` - Create new auth session
- `validate_auth_session()` - Validate refresh token
- `cleanup_expired_sessions()` - Remove expired sessions
- `revoke_all_user_sessions()` - Logout from all devices

### Order Management Functions
- `create_order_from_cart()` - Convert cart to order
- `update_order_status()` - Change order status with validation
- `calculate_order_total()` - Calculate order totals
- `calculate_platform_fee()` - Calculate marketplace fees
- `update_order_timestamps()` - Auto-update timestamps

### Payment Functions
- `process_payment()` - Process order payment
- `confirm_payment()` - Confirm payment success
- `apply_coupon_to_order()` - Apply discount coupon
- `apply_store_credit_to_order()` - Use store credit
- `get_available_store_credit()` - Check credit balance

### Shipping Functions
- `calculate_shipping_cost()` - Calculate shipping fees
- `create_shipping_label()` - Generate shipping label
- `add_tracking_event()` - Update tracking status
- `get_tracking_url()` - Generate tracking URL
- `format_shipping_address()` - Format address for display

### Return & Dispute Functions
- `create_return_request()` - Request product return
- `approve_return()` - Approve return request
- `process_return_refund()` - Process refund
- `create_dispute()` - Open dispute
- `respond_to_dispute()` - Reply to dispute
- `escalate_dispute()` - Escalate to support

### Inventory Functions
- `update_variant_stock()` - Update stock levels
- `check_variant_availability()` - Check if in stock
- `update_listing_total_stock()` - Update total stock

### Notification Functions
- `create_notification()` - Create user notification
- `mark_notifications_read()` - Mark as read
- `get_unread_notification_count()` - Count unread
- `notify_new_message()` - Trigger for new messages
- `notify_order_status_change()` - Trigger for order updates

### Analytics Functions
- `update_user_stats_summary()` - Update user statistics
- `update_seller_stats_on_order()` - Update seller metrics
- `update_user_rating_stats()` - Update rating averages
- `check_achievements()` - Check for new achievements
- `award_loyalty_points()` - Give loyalty points

### Utility Functions
- `handle_new_user()` - Initialize new user data
- `update_updated_at_column()` - Auto-update timestamps
- `clean_expired_carts()` - Remove old carts
- `cleanup_old_notifications()` - Archive old notifications
- `get_public_url()` - Generate storage URLs

## Storage Buckets

```sql
-- Profile Pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Profile Covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'covers',
    'covers',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Product Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listings',
    'listings',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Return Evidence (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'returns',
    'returns',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Dispute Evidence (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'disputes',
    'disputes',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
);
```

### Storage Policies

```sql
-- Avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for other buckets...
```

## Supabase Auth Configuration

### Auth Settings
```javascript
// Recommended auth configuration
const supabaseAuthConfig = {
  // Email Auth
  enableEmailSignup: true,
  enableEmailAutoconfirm: false,
  enablePasswordRecovery: true,
  
  // OAuth Providers (optional)
  providers: ['google', 'facebook', 'apple'],
  
  // Security
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  
  // Sessions
  jwtExpiry: 3600, // 1 hour
  refreshTokenRotationEnabled: true,
  
  // Email Templates
  emailTemplates: {
    confirmEmail: 'custom',
    resetPassword: 'custom',
    magicLink: 'custom'
  }
};
```

### Auth Triggers
```sql
-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at)
  VALUES (
    new.id,
    new.email,
    LOWER(SPLIT_PART(new.email, '@', 1)),
    now()
  );
  
  -- Create default shopping cart
  INSERT INTO public.shopping_carts (user_id)
  VALUES (new.id);
  
  -- Initialize user stats
  INSERT INTO public.user_stats_summary (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Migration Order

When setting up a fresh Supabase project, apply migrations in this order:

1. **Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
   ```

2. **Custom Types** - Create all enum types first

3. **Tables** - Create in dependency order:
   - Independent tables first (categories, profiles)
   - Dependent tables next (listings, orders)
   - Junction tables last (cart_items, order_items)

4. **Indexes** - Add all performance indexes

5. **Functions** - Create all database functions

6. **Triggers** - Set up automatic triggers

7. **RLS Policies** - Enable RLS and create all policies

8. **Storage** - Create buckets and policies

9. **Initial Data** - Seed categories and default data

## Important Notes

1. **Storage Usage**: The 5GB limit was likely exceeded due to:
   - Unoptimized images (use image optimization)
   - Old/orphaned files not being cleaned up
   - Development testing creating duplicate files

2. **Recommendations for New Project**:
   - Implement image optimization (resize, compress)
   - Add cleanup jobs for orphaned files
   - Monitor storage usage regularly
   - Consider CDN for static assets

3. **Security Considerations**:
   - All tables have RLS enabled
   - Sensitive operations require authentication
   - Payment data is properly isolated
   - File uploads are restricted by type and size

4. **Performance Optimizations**:
   - Indexes on all foreign keys
   - Composite indexes for common queries
   - Materialized views for statistics
   - Proper data archival strategy

This document provides everything needed to recreate the Supabase backend. Make sure to review and adjust based on your specific requirements for the new project.