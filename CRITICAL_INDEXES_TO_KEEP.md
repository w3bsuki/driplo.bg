# Critical Indexes to KEEP for Production

## Overview
While Supabase reports these indexes as "unused", many are CRITICAL for production performance. The "unused" status likely indicates you haven't had significant production traffic yet.

## MUST KEEP Indexes (DO NOT DROP)

### 1. Transaction & Payment Processing (CRITICAL)
These indexes are essential for payment processing and order management:

```sql
-- Payment transaction queries
public.idx_transactions_order -- Finding transactions by order
public.idx_transactions_status -- Filtering by status (pending, completed, failed)
public.idx_transactions_processor -- Filtering by payment processor
archive.idx_transactions_stripe_payment_intent_id -- Stripe webhook processing

-- Payment methods
public.idx_payment_methods_user -- User's payment methods
public.idx_payment_methods_default -- Default payment method lookups

-- Payment accounts
public.idx_payment_accounts_user_id -- Seller payment accounts
public.idx_payment_accounts_verified -- Verified account filtering
```

### 2. Order Management (CRITICAL)
Essential for order queries and admin dashboards:

```sql
-- Order filtering and searching
public.idx_orders_buyer -- Buyer's order history
public.idx_orders_seller -- Seller's orders dashboard
public.idx_orders_status -- Order status filtering
public.idx_orders_created -- Date range queries
public.idx_orders_number -- Order number lookups
public.idx_orders_buyer_status -- Composite index for buyer + status
public.idx_orders_seller_status -- Composite index for seller + status

-- Order items
public.idx_order_items_order -- Items in an order
public.idx_order_items_listing -- Orders for a listing

-- Order tracking
public.idx_tracking_order -- Tracking by order
public.idx_tracking_number -- Tracking number lookups
public.idx_tracking_status -- Status filtering
```

### 3. User Experience (CRITICAL)
Core user features that will be heavily used:

```sql
-- Shopping cart
public.idx_cart_items_cart -- Items in cart
public.idx_cart_items_listing -- Cart items by listing
public.idx_carts_user -- User's cart

-- Favorites/Wishlist
public.idx_favorites_user_listing -- User's favorites
public.idx_favorites_listing -- Who favorited a listing

-- Messaging
public.idx_messages_conversation -- Messages in conversation
public.idx_messages_created -- Message ordering

-- Notifications
public.idx_notifications_user_unread -- Unread notifications count
public.idx_notifications_type -- Filter by type
public.idx_notifications_related_order -- Order notifications
```

### 4. Search & Discovery (CRITICAL)
Essential for product search and browsing:

```sql
-- Listing search
public.idx_listings_search -- Full-text search
public.idx_listings_search_active -- Active listings search
public.idx_listings_price -- Price range filtering
public.idx_listings_seller_active -- Seller's active listings

-- Categories
public.idx_listings_subcategory -- Category filtering
```

### 5. Admin & Support (IMPORTANT)
Needed for admin dashboards and support:

```sql
-- Disputes
public.idx_disputes_status -- Filter by dispute status
public.idx_disputes_order -- Find disputes by order

-- Returns
public.idx_returns_order -- Returns by order
public.idx_returns_status -- Filter by return status

-- Coupons
public.idx_coupons_code -- Coupon code lookups
public.idx_coupons_valid -- Active coupons
```

## Indexes That Can Be Safely Dropped

These are genuinely redundant or unnecessary:

```sql
-- Redundant user indexes (covered by other indexes)
public.idx_profiles_role
public.idx_profiles_last_active
public.idx_profiles_verification

-- Overly specific indexes
public.idx_orders_created_date -- Covered by idx_orders_created
public.idx_messages_conversation_created -- Covered by separate indexes

-- Archive indexes (less critical)
archive.idx_listing_views_listing
archive.idx_profile_views_profile
archive.idx_activities_user
```

## Revised Migration Strategy

### Phase 1: Add ALL Foreign Key Indexes (KEEP AS IS)
Your migrations 001 and 002 are perfect - foreign key indexes are essential.

### Phase 2: Selective Index Removal
Instead of dropping all 105 indexes, only drop truly redundant ones:

```sql
-- Create new migration: 003_drop_only_redundant_indexes.sql
-- Only drop ~30-40 truly redundant indexes
-- Keep all critical production indexes
```

### Phase 3: Monitor and Optimize
After going live:
1. Monitor actual query patterns for 30 days
2. Identify which indexes are truly unused
3. Create targeted removal migrations

## Production Readiness Checklist

Before going live, ensure these indexes exist:

- [ ] All foreign key indexes (migrations 001 & 002)
- [ ] Transaction status and processor indexes
- [ ] Order status and filtering indexes
- [ ] User cart and favorites indexes
- [ ] Search and price filtering indexes
- [ ] Notification filtering indexes
- [ ] Payment method lookup indexes

## Query Examples That Need These Indexes

```sql
-- Transaction status queries (NEEDS idx_transactions_status)
SELECT * FROM payment_transactions 
WHERE status = 'pending' AND created_at > NOW() - INTERVAL '1 hour';

-- Order dashboard (NEEDS idx_orders_seller_status)
SELECT * FROM orders 
WHERE seller_id = ? AND status IN ('pending', 'processing')
ORDER BY created_at DESC;

-- Cart queries (NEEDS idx_cart_items_cart)
SELECT * FROM cart_items 
WHERE cart_id = ? AND deleted_at IS NULL;

-- Notification badge (NEEDS idx_notifications_user_unread)
SELECT COUNT(*) FROM notifications 
WHERE user_id = ? AND read = false;
```

## Recommendation

1. **DO NOT** apply migrations 003, 004, and 005 as currently written
2. Create a new, more selective index removal migration
3. Keep all indexes related to core business operations
4. Only remove truly redundant or overly specific indexes
5. Monitor production for 30+ days before removing any more indexes

Remember: It's much safer to have a few extra indexes than to miss a critical one that causes production slowdowns!