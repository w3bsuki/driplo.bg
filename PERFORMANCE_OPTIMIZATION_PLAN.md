# Supabase Performance Optimization Plan

## Overview
This document outlines a comprehensive plan to fix all performance issues identified by Supabase's advisory system. We have **149 performance issues** to address:
- **44 unindexed foreign keys** that need indexes
- **105 unused indexes** that should be dropped

## Priority Strategy
We'll tackle these issues in phases to minimize risk and ensure smooth execution:

### Phase 1: Critical Foreign Key Indexes (High Priority)
Add indexes for foreign keys that are likely to be used in JOINs and lookups frequently.

### Phase 2: Archive Table Indexes (Medium Priority)
Add indexes for archive schema tables (lower traffic but still important).

### Phase 3: Unused Index Cleanup (Low Priority)
Drop unused indexes to reduce storage overhead and improve write performance.

## Detailed Analysis

### 1. Unindexed Foreign Keys (44 issues)

#### Public Schema - Critical (27 issues)
These are in the main public schema and likely affect active queries:

**User-related tables:**
- `messages.sender_id_fkey` - Critical for message queries
- `notifications.related_user_id_fkey` - Critical for notification lookups
- `notifications.related_message_id_fkey` - Message reference lookups
- `payment_methods.billing_address_id_fkey` - Payment processing
- `profiles.default_billing_address_id_fkey` - User profile queries

**Order-related tables:**
- `orders.shipping_address_id_fkey` - Order fulfillment queries
- `order_items.variant_id_fkey` - Product variant lookups
- `order_status_history.changed_by_fkey` - Audit trail queries
- `order_tracking.created_by_fkey` - Tracking history

**Product-related tables:**
- `cart_items.variant_id_fkey` - Shopping cart queries
- `listings.seller_payment_account_id_fkey` - Seller payment processing
- `categories.parent_id_fkey` - Category hierarchy queries

**Payment & Transaction tables:**
- `payment_transactions.payment_method_id_fkey` - Payment processing
- `shipping_labels.tracking_id_fkey` - Shipping label lookups

**Dispute-related tables:**
- `disputes.respondent_id_fkey` - Dispute party lookups
- `disputes.resolved_by_fkey` - Resolution tracking
- `disputes.support_agent_id_fkey` - Support agent assignment
- `dispute_messages.sender_id_fkey` - Dispute communication

**Return & Refund tables:**
- `returns.order_item_id_fkey` - Return item tracking
- `returns.requested_by_fkey` - Return requester
- `returns.approved_by_fkey` - Return approval tracking
- `returns.inspected_by_fkey` - Return inspection
- `returns.refund_transaction_id_fkey` - Refund linking

**Other tables:**
- `coupons.seller_id_fkey` - Seller coupon lookups
- `coupons.created_by_fkey` - Coupon creator tracking
- `store_credits.issued_by_fkey` - Store credit issuer

#### Archive Schema (17 issues)
These are in the archive schema (lower priority):

- `dispute_evidence.submitted_by_fkey`
- `dispute_evidence.verified_by_fkey`
- `dispute_history.actor_id_fkey`
- `flash_sales.created_by_fkey`
- `flash_sales.seller_id_fkey`
- `inventory_logs.created_by_fkey`
- `listing_views.viewer_id_fkey`
- `payment_refunds.initiated_by_fkey`
- `points_transactions.order_id_fkey`
- `profile_views.viewer_id_fkey`
- `return_messages.sender_id_fkey`
- `seller_payouts.processed_by_fkey`
- `store_credit_usage.order_id_fkey`
- `transactions.buyer_id_fkey`
- `transactions.listing_id_fkey`
- `transactions.seller_id_fkey`

### 2. Unused Indexes (105 issues)

These indexes have never been used and are candidates for removal:

#### Listing-related (10 indexes)
- `idx_listings_slug`
- `idx_listings_subcategory`
- `idx_listings_search_active`
- `idx_listings_seller_active`
- `idx_listings_price`
- `idx_listings_search`
- `idx_listings_tags`
- `idx_listing_views_listing`
- `idx_listing_views_created`
- `idx_listing_views_viewer`

#### Order-related (15 indexes)
- `idx_orders_seller_status`
- `idx_orders_buyer_status`
- `idx_orders_created_date`
- `idx_orders_buyer`
- `idx_orders_seller`
- `idx_orders_status`
- `idx_orders_created`
- `idx_orders_number`
- `idx_order_items_order`
- `idx_order_items_listing`
- `idx_order_status_history_order`
- `idx_tracking_order`
- `idx_tracking_number`
- `idx_tracking_status`
- `idx_tracking_delivery`

#### User & Profile-related (18 indexes)
- `idx_profiles_role`
- `idx_profiles_seller_rating`
- `idx_profiles_last_active`
- `idx_profiles_verification`
- `idx_user_ratings_rated_user`
- `idx_user_ratings_rater_user`
- `idx_user_ratings_listing`
- `idx_user_ratings_type_rating`
- `idx_user_stats_last_calc`
- `idx_follows_follower`
- `idx_follows_following`
- `idx_achievements_user`
- `idx_achievements_type`
- `idx_achievements_earned`
- `idx_activities_user`
- `idx_activities_public`
- `idx_activities_type`
- `idx_profile_views_profile`
- `idx_profile_views_date`
- `idx_profile_views_viewer`

#### Cart & Shopping (7 indexes)
- `idx_cart_items_cart_listing`
- `idx_carts_user`
- `idx_carts_expires`
- `idx_cart_items_cart`
- `idx_cart_items_listing`
- `idx_favorites_user_listing`
- `idx_favorites_listing`
- `idx_favorites_created`

#### Payment & Transaction (10 indexes)
- `idx_payment_methods_user`
- `idx_payment_methods_default`
- `idx_transactions_order`
- `idx_transactions_status`
- `idx_transactions_processor`
- `idx_transactions_stripe_payment_intent_id`
- `idx_refunds_transaction`
- `idx_refunds_order`
- `idx_payment_accounts_user_id`
- `idx_payment_accounts_verified`

#### Messaging & Notifications (9 indexes)
- `idx_messages_conversation_created`
- `idx_messages_conversation`
- `idx_messages_created`
- `idx_conversations_listing`
- `idx_notifications_user_unread`
- `idx_notifications_created`
- `idx_notifications_type`
- `idx_notifications_expires`
- `idx_notifications_related_order`
- `idx_notifications_related_listing`

#### Other (36 indexes)
Various other unused indexes across different tables...

## Implementation Plan

### Step 1: Create Migration Files
We'll create separate migration files for each phase:

1. `001_add_critical_foreign_key_indexes.sql` - Public schema FK indexes
2. `002_add_archive_foreign_key_indexes.sql` - Archive schema FK indexes  
3. `003_drop_unused_indexes_phase1.sql` - Drop first batch of unused indexes
4. `004_drop_unused_indexes_phase2.sql` - Drop second batch of unused indexes
5. `005_drop_unused_indexes_phase3.sql` - Drop remaining unused indexes

### Step 2: Testing Strategy
1. Apply migrations to development branch first
2. Run performance tests to ensure no regressions
3. Monitor query performance for 24-48 hours
4. Rollback if any issues detected

### Step 3: Production Deployment
1. Deploy during low-traffic window
2. Apply migrations in order with monitoring between each
3. Keep rollback scripts ready
4. Monitor performance metrics closely

### Step 4: Post-Deployment
1. Verify all indexes are properly created/dropped
2. Run VACUUM ANALYZE on affected tables
3. Monitor query performance for 1 week
4. Document any performance improvements

## Expected Benefits
1. **Improved JOIN performance** - Foreign key indexes will speed up JOIN operations
2. **Faster lookups** - Queries filtering by foreign keys will be much faster
3. **Reduced storage** - Dropping 105 unused indexes will free up significant space
4. **Better write performance** - Fewer indexes mean faster INSERT/UPDATE operations
5. **Lower maintenance overhead** - Fewer indexes to maintain during VACUUM operations

## Risk Mitigation
1. **Backup first** - Ensure recent backups exist before any changes
2. **Test thoroughly** - Use development branch for testing
3. **Monitor closely** - Watch for slow queries after changes
4. **Rollback plan** - Have scripts ready to recreate dropped indexes if needed
5. **Gradual rollout** - Deploy in phases rather than all at once

## Success Metrics
- Query performance improvement of 20-50% for affected queries
- Storage space reduction of approximately 5-10GB
- No increase in slow query logs
- Successful completion of all migrations without errors

## Next Steps
1. Review this plan with the team
2. Create the migration SQL files
3. Test on development branch
4. Schedule production deployment window
5. Execute and monitor

---

*This plan addresses all 149 performance issues identified by Supabase advisors.*