# Complete Database Schema Documentation

## Overview
This document contains the complete database schema for the Driplo marketplace application, including all tables, columns, constraints, and indexes.

## Tables Summary
The database contains 33 tables organized into the following categories:

### Authentication & User Management
- `profiles` - User profile information
- `auth_sessions` - Active authentication sessions
- `auth_login_history` - Login history tracking
- `active_user_sessions` - Active user sessions

### Product & Listing Management
- `listings` - Product listings
- `product_variants` - Product variations (size, color, etc.)
- `categories` - Product categories
- `favorites` - User favorite listings

### Shopping & Orders
- `shopping_carts` - User shopping carts
- `cart_items` - Items in shopping carts
- `orders` - Order records
- `order_items` - Individual items within orders
- `order_status_history` - Order status change history
- `order_tracking` - Shipment tracking information

### Payment & Transactions
- `payment_accounts` - Seller payment accounts
- `payment_methods` - Buyer payment methods
- `payment_transactions` - Payment transaction records
- `transactions` - Legacy transaction table
- `stripe_webhook_events` - Stripe webhook event logs
- `store_credits` - User store credit balances

### Communication & Support
- `conversations` - Message conversations
- `messages` - Individual messages
- `notifications` - User notifications
- `disputes` - Order disputes
- `dispute_messages` - Messages within disputes

### Shipping & Returns
- `shipping_addresses` - User shipping addresses
- `shipping_labels` - Generated shipping labels
- `returns` - Product return requests

### Marketing & Analytics
- `coupons` - Discount coupons
- `coupon_usage` - Coupon usage tracking
- `user_follows` - User follow relationships
- `user_ratings` - User ratings and reviews
- `user_stats_summary` - Aggregated user statistics

## Detailed Table Schemas

### 1. active_user_sessions
Tracks currently active user sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User ID (FK to auth.users) |
| created_at | timestamp with time zone | NO | now() | Session creation time |
| updated_at | timestamp with time zone | NO | now() | Last update time |
| metadata | jsonb | YES | {} | Additional session metadata |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

### 2. auth_login_history
Records user login history for security and analytics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID (FK to auth.users) |
| login_at | timestamp with time zone | NO | now() | Login timestamp |
| ip_address | inet | YES | - | IP address of login |
| user_agent | text | YES | - | Browser user agent |
| login_method | character varying(50) | YES | - | Login method used |
| success | boolean | YES | true | Whether login was successful |
| failure_reason | text | YES | - | Reason for failed login |
| location_data | jsonb | YES | {} | Geolocation data |
| device_info | jsonb | YES | {} | Device information |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**Indexes:**
- idx_auth_login_history_user_id ON (user_id)
- idx_auth_login_history_login_at ON (login_at DESC)

### 3. auth_sessions
Manages authentication sessions and refresh tokens.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID (FK to auth.users) |
| access_token_hash | character varying(255) | NO | - | Hashed access token |
| refresh_token_hash | character varying(255) | NO | - | Hashed refresh token |
| expires_at | timestamp with time zone | NO | - | Session expiration time |
| created_at | timestamp with time zone | YES | now() | Session creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| ip_address | inet | YES | - | IP address |
| user_agent | text | YES | - | Browser user agent |
| is_active | boolean | YES | true | Whether session is active |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**Indexes:**
- idx_auth_sessions_user_id ON (user_id)
- idx_auth_sessions_expires_at ON (expires_at)
- idx_auth_sessions_refresh_token ON (refresh_token_hash)

### 4. cart_items
Items added to shopping carts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| cart_id | uuid | NO | - | Shopping cart ID |
| listing_id | uuid | NO | - | Product listing ID |
| variant_id | uuid | YES | - | Product variant ID |
| quantity | integer | NO | 1 | Item quantity |
| price | numeric(10,2) | NO | - | Item price |
| added_at | timestamp with time zone | YES | now() | When item was added |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (cart_id, listing_id, variant_id)
- FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
- FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
- CHECK (quantity > 0)

**Indexes:**
- idx_cart_items_cart ON (cart_id)
- idx_cart_items_listing ON (listing_id)
- idx_cart_items_cart_listing ON (cart_id, listing_id)

### 5. categories
Product category hierarchy.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| name | character varying(100) | NO | - | Category name |
| slug | character varying(100) | NO | - | URL-friendly slug |
| parent_id | uuid | YES | - | Parent category ID |
| description | text | YES | - | Category description |
| image_url | text | YES | - | Category image URL |
| display_order | integer | YES | 0 | Display order |
| is_active | boolean | YES | true | Whether category is active |
| metadata | jsonb | YES | {} | Additional metadata |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (name)
- UNIQUE (slug)
- FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE

### 6. conversations
Message conversations between users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| listing_id | uuid | YES | - | Related listing ID |
| buyer_id | uuid | NO | - | Buyer user ID |
| seller_id | uuid | NO | - | Seller user ID |
| status | character varying(20) | YES | 'active' | Conversation status |
| last_message_at | timestamp with time zone | YES | - | Last message timestamp |
| buyer_unread_count | integer | YES | 0 | Unread messages for buyer |
| seller_unread_count | integer | YES | 0 | Unread messages for seller |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (listing_id, buyer_id, seller_id)
- FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL

**Indexes:**
- idx_conversations_buyer ON (buyer_id)
- idx_conversations_seller ON (seller_id)
- idx_conversations_listing ON (listing_id)
- idx_conversations_buyer_seller ON (buyer_id, seller_id)

### 7. coupon_usage
Tracks coupon usage by users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| coupon_id | uuid | NO | - | Coupon ID |
| user_id | uuid | NO | - | User ID |
| order_id | uuid | NO | - | Order ID |
| discount_amount | numeric(10,2) | NO | - | Discount amount applied |
| used_at | timestamp with time zone | YES | now() | Usage timestamp |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (coupon_id, order_id)
- FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE

**Indexes:**
- idx_coupon_usage_user ON (user_id)
- idx_coupon_usage_order ON (order_id)

### 8. coupons
Discount coupons and promotional codes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| code | character varying(50) | NO | - | Coupon code |
| description | text | YES | - | Coupon description |
| discount_type | USER-DEFINED | NO | - | Type of discount |
| discount_value | numeric(10,2) | NO | - | Discount value |
| minimum_order_amount | numeric(10,2) | YES | - | Minimum order amount |
| maximum_discount_amount | numeric(10,2) | YES | - | Maximum discount cap |
| usage_limit | integer | YES | - | Total usage limit |
| usage_limit_per_user | integer | YES | 1 | Usage limit per user |
| usage_count | integer | YES | 0 | Current usage count |
| valid_from | timestamp with time zone | NO | - | Valid from date |
| valid_until | timestamp with time zone | NO | - | Valid until date |
| is_active | boolean | YES | true | Whether coupon is active |
| applicable_categories | uuid[] | YES | {} | Applicable category IDs |
| applicable_sellers | uuid[] | YES | {} | Applicable seller IDs |
| seller_id | uuid | YES | - | Seller who created coupon |
| created_by | uuid | YES | - | User who created coupon |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (code)
- FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (created_by) REFERENCES profiles(id)
- CHECK (discount_value > 0)

**Indexes:**
- idx_coupons_code ON (code) WHERE is_active = true
- idx_coupons_valid ON (valid_from, valid_until) WHERE is_active = true

### 9. dispute_messages
Messages within dispute conversations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| dispute_id | uuid | NO | - | Dispute ID |
| sender_id | uuid | NO | - | Sender user ID |
| message | text | NO | - | Message content |
| attachments | jsonb | YES | [] | Message attachments |
| is_system_message | boolean | YES | false | Whether system generated |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE
- FOREIGN KEY (sender_id) REFERENCES profiles(id)

**Indexes:**
- idx_dispute_messages_dispute ON (dispute_id, created_at)

### 10. disputes
Order disputes and resolutions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| dispute_number | character varying(20) | NO | - | Unique dispute number |
| order_id | uuid | NO | - | Related order ID |
| initiated_by | uuid | NO | - | User who initiated |
| respondent_id | uuid | NO | - | Responding user ID |
| type | USER-DEFINED | NO | - | Dispute type |
| status | USER-DEFINED | YES | 'open' | Dispute status |
| title | character varying(255) | NO | - | Dispute title |
| description | text | NO | - | Dispute description |
| claimed_amount | numeric(10,2) | YES | - | Amount claimed |
| approved_amount | numeric(10,2) | YES | - | Amount approved |
| buyer_evidence | jsonb | YES | [] | Buyer evidence |
| seller_evidence | jsonb | YES | [] | Seller evidence |
| response_deadline | timestamp with time zone | YES | now() + interval '3 days' | Response deadline |
| resolution_type | USER-DEFINED | YES | - | Resolution type |
| resolution_notes | text | YES | - | Resolution notes |
| resolved_by | uuid | YES | - | Resolver user ID |
| resolved_at | timestamp with time zone | YES | - | Resolution timestamp |
| escalated_to_support | boolean | YES | false | Whether escalated |
| escalated_at | timestamp with time zone | YES | - | Escalation timestamp |
| escalation_reason | text | YES | - | Escalation reason |
| support_agent_id | uuid | YES | - | Support agent ID |
| support_ticket_id | character varying(100) | YES | - | Support ticket ID |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| closed_at | timestamp with time zone | YES | - | Closure timestamp |
| auto_close_at | timestamp with time zone | YES | now() + interval '30 days' | Auto-close time |
| metadata | jsonb | YES | {} | Additional metadata |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (dispute_number)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (initiated_by) REFERENCES profiles(id)
- FOREIGN KEY (respondent_id) REFERENCES profiles(id)
- FOREIGN KEY (resolved_by) REFERENCES profiles(id)
- FOREIGN KEY (support_agent_id) REFERENCES profiles(id)

**Indexes:**
- idx_disputes_order ON (order_id)
- idx_disputes_status ON (status)
- idx_disputes_parties ON (initiated_by, respondent_id)
- idx_disputes_created ON (created_at DESC)

### 11. favorites
User favorite listings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| listing_id | uuid | NO | - | Listing ID |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (user_id, listing_id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE

**Indexes:**
- idx_favorites_user ON (user_id)
- idx_favorites_listing ON (listing_id)
- idx_favorites_user_listing ON (user_id, listing_id)
- idx_favorites_created ON (created_at DESC)

### 12. listings
Product listings in the marketplace.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| seller_id | uuid | NO | - | Seller user ID |
| category_id | uuid | YES | - | Category ID |
| title | character varying(255) | NO | - | Listing title |
| description | text | NO | - | Listing description |
| price | numeric(10,2) | NO | - | Listing price |
| condition | character varying(20) | NO | - | Item condition |
| size | character varying(50) | YES | - | Item size |
| brand | character varying(100) | YES | - | Item brand |
| color | character varying(50) | YES | - | Item color |
| images | jsonb | YES | [] | Listing images |
| shipping_type | character varying(20) | YES | 'standard' | Shipping type |
| shipping_cost | numeric(10,2) | YES | 0 | Shipping cost |
| status | character varying(20) | YES | 'active' | Listing status |
| view_count | integer | YES | 0 | View count |
| favorite_count | integer | YES | 0 | Favorite count |
| tags | text[] | YES | {} | Listing tags |
| metadata | jsonb | YES | {} | Additional metadata |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| sold_at | timestamp with time zone | YES | - | Sale timestamp |
| search_vector | tsvector | YES | - | Full-text search vector |
| has_variants | boolean | YES | false | Whether has variants |
| total_stock | integer | YES | 0 | Total stock quantity |
| location_city | character varying(255) | YES | - | Seller city |
| location_state | character varying(100) | YES | - | Seller state |
| location_country | character varying(100) | YES | 'US' | Seller country |
| ships_worldwide | boolean | YES | false | Ships worldwide |
| currency | character varying(3) | YES | 'USD' | Currency code |
| is_featured | boolean | YES | false | Featured listing |
| like_count | integer | YES | 0 | Like count |
| material | character varying(100) | YES | - | Item material |
| slug | character varying(255) | YES | - | URL slug |
| published_at | timestamp with time zone | YES | now() | Publication time |
| subcategory_id | uuid | YES | - | Subcategory ID |
| video_url | text | YES | - | Video URL |
| location | character varying(255) | YES | - | General location |
| seller_payment_account_id | uuid | YES | - | Seller payment account |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
- FOREIGN KEY (seller_payment_account_id) REFERENCES payment_accounts(id)
- CHECK (status IN ('active', 'sold', 'reserved', 'inactive', 'deleted'))
- CHECK (shipping_type IN ('standard', 'express', 'pickup_only'))
- CHECK (shipping_cost >= 0)

**Indexes:**
- idx_listings_seller ON (seller_id)
- idx_listings_category ON (category_id)
- idx_listings_status ON (status) WHERE status = 'active'
- idx_listings_created ON (created_at DESC)
- idx_listings_price ON (price)
- idx_listings_search ON (search_vector)
- idx_listings_search_active ON (search_vector) WHERE status = 'active'
- idx_listings_tags ON (tags)
- idx_listings_slug ON (slug)
- idx_listings_subcategory ON (subcategory_id) WHERE subcategory_id IS NOT NULL
- idx_listings_seller_active ON (seller_id, status) WHERE status = 'active'
- idx_listings_seller_created ON (seller_id, created_at DESC)
- idx_listings_category_created ON (category_id, created_at DESC)
- idx_listings_price_status ON (price, status)

### 13. messages
Individual messages in conversations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| conversation_id | uuid | NO | - | Conversation ID |
| sender_id | uuid | NO | - | Sender user ID |
| message_text | text | NO | - | Message content |
| is_read | boolean | YES | false | Whether message is read |
| created_at | timestamp with time zone | YES | now() | Creation time |
| attachments | jsonb | YES | [] | Message attachments |
| read_at | timestamp with time zone | YES | - | Read timestamp |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
- FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE

**Indexes:**
- idx_messages_conversation ON (conversation_id)
- idx_messages_conversation_created ON (conversation_id, created_at DESC)
- idx_messages_created ON (created_at DESC)
- idx_messages_unread ON (conversation_id, is_read) WHERE is_read = false

### 14. notifications
User notifications for various events.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| type | USER-DEFINED | NO | - | Notification type |
| title | character varying(255) | NO | - | Notification title |
| message | text | NO | - | Notification message |
| action_url | text | YES | - | Action URL |
| icon_url | text | YES | - | Icon URL |
| image_url | text | YES | - | Image URL |
| related_user_id | uuid | YES | - | Related user ID |
| related_order_id | uuid | YES | - | Related order ID |
| related_listing_id | uuid | YES | - | Related listing ID |
| related_message_id | uuid | YES | - | Related message ID |
| is_read | boolean | YES | false | Whether read |
| read_at | timestamp with time zone | YES | - | Read timestamp |
| is_archived | boolean | YES | false | Whether archived |
| archived_at | timestamp with time zone | YES | - | Archive timestamp |
| channels_sent | notification_channel[] | YES | {} | Channels sent |
| email_sent_at | timestamp with time zone | YES | - | Email sent time |
| push_sent_at | timestamp with time zone | YES | - | Push sent time |
| metadata | jsonb | YES | {} | Additional metadata |
| created_at | timestamp with time zone | YES | now() | Creation time |
| expires_at | timestamp with time zone | YES | now() + interval '30 days' | Expiration time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (related_user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (related_listing_id) REFERENCES listings(id) ON DELETE CASCADE
- FOREIGN KEY (related_message_id) REFERENCES messages(id) ON DELETE CASCADE

**Indexes:**
- idx_notifications_user_unread ON (user_id, is_read) WHERE is_read = false
- idx_notifications_type ON (type)
- idx_notifications_created ON (created_at DESC)
- idx_notifications_expires ON (expires_at)
- idx_notifications_related_order ON (related_order_id) WHERE related_order_id IS NOT NULL
- idx_notifications_related_listing ON (related_listing_id) WHERE related_listing_id IS NOT NULL

### 15. order_items
Individual items within orders.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_id | uuid | NO | - | Order ID |
| listing_id | uuid | YES | - | Listing ID |
| variant_id | uuid | YES | - | Variant ID |
| product_snapshot | jsonb | NO | - | Product snapshot |
| quantity | integer | NO | - | Item quantity |
| unit_price | numeric(10,2) | NO | - | Unit price |
| total_price | numeric(10,2) | NO | - | Total price |
| is_returned | boolean | YES | false | Whether returned |
| returned_at | timestamp with time zone | YES | - | Return timestamp |
| return_reason | text | YES | - | Return reason |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
- FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
- CHECK (quantity > 0)
- CHECK (unit_price >= 0)
- CHECK (total_price >= 0)

**Indexes:**
- idx_order_items_order ON (order_id)
- idx_order_items_listing ON (listing_id)

### 16. order_status_history
Tracks order status changes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_id | uuid | NO | - | Order ID |
| old_status | USER-DEFINED | YES | - | Previous status |
| new_status | USER-DEFINED | NO | - | New status |
| changed_by | uuid | YES | - | User who changed |
| reason | text | YES | - | Change reason |
| metadata | jsonb | YES | {} | Additional metadata |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (changed_by) REFERENCES profiles(id)

**Indexes:**
- idx_order_status_history_order ON (order_id, created_at DESC)

### 17. order_tracking
Shipment tracking information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_id | uuid | NO | - | Order ID |
| carrier | USER-DEFINED | NO | - | Shipping carrier |
| tracking_number | character varying(100) | NO | - | Tracking number |
| tracking_url | text | YES | - | Tracking URL |
| status | USER-DEFINED | YES | 'label_created' | Tracking status |
| ship_date | date | YES | - | Ship date |
| estimated_delivery | date | YES | - | Estimated delivery |
| actual_delivery | timestamp with time zone | YES | - | Actual delivery |
| package_weight | numeric(10,2) | YES | - | Package weight |
| package_dimensions | jsonb | YES | - | Package dimensions |
| last_update | timestamp with time zone | YES | now() | Last update |
| last_location | character varying(255) | YES | - | Last known location |
| tracking_events | jsonb | YES | [] | Tracking events |
| created_at | timestamp with time zone | YES | now() | Creation time |
| created_by | uuid | YES | - | Creator user ID |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (order_id, tracking_number)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (created_by) REFERENCES profiles(id)

**Indexes:**
- idx_tracking_order ON (order_id)
- idx_tracking_number ON (tracking_number)
- idx_tracking_status ON (status)
- idx_tracking_delivery ON (estimated_delivery) WHERE status != 'delivered'

### 18. orders
Order records for purchases.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_number | character varying(20) | NO | - | Unique order number |
| buyer_id | uuid | NO | - | Buyer user ID |
| seller_id | uuid | NO | - | Seller user ID |
| status | USER-DEFINED | NO | 'pending_payment' | Order status |
| subtotal | numeric(10,2) | NO | - | Order subtotal |
| shipping_cost | numeric(10,2) | YES | 0 | Shipping cost |
| tax_amount | numeric(10,2) | YES | 0 | Tax amount |
| discount_amount | numeric(10,2) | YES | 0 | Discount amount |
| total_amount | numeric(10,2) | NO | - | Total amount |
| currency | character varying(3) | YES | 'USD' | Currency code |
| shipping_address_id | uuid | YES | - | Shipping address ID |
| shipping_address_snapshot | jsonb | NO | - | Shipping address snapshot |
| payment_method | character varying(50) | YES | - | Payment method |
| payment_status | character varying(50) | YES | 'pending' | Payment status |
| payment_intent_id | character varying(255) | YES | - | Payment intent ID |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| paid_at | timestamp with time zone | YES | - | Payment timestamp |
| shipped_at | timestamp with time zone | YES | - | Shipment timestamp |
| delivered_at | timestamp with time zone | YES | - | Delivery timestamp |
| completed_at | timestamp with time zone | YES | - | Completion timestamp |
| cancelled_at | timestamp with time zone | YES | - | Cancellation timestamp |
| buyer_note | text | YES | - | Buyer note |
| seller_note | text | YES | - | Seller note |
| cancellation_reason | text | YES | - | Cancellation reason |
| metadata | jsonb | YES | {} | Additional metadata |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (order_number)
- FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(id)
- CHECK (buyer_id != seller_id)
- CHECK (subtotal >= 0)
- CHECK (shipping_cost >= 0)
- CHECK (tax_amount >= 0)
- CHECK (discount_amount >= 0)
- CHECK (total_amount >= 0)

**Indexes:**
- idx_orders_buyer ON (buyer_id)
- idx_orders_seller ON (seller_id)
- idx_orders_status ON (status)
- idx_orders_created ON (created_at DESC)
- idx_orders_number ON (order_number)
- idx_orders_buyer_status ON (buyer_id, status)
- idx_orders_seller_status ON (seller_id, status)
- idx_orders_buyer_created ON (buyer_id, created_at DESC)
- idx_orders_seller_created ON (seller_id, created_at DESC)
- idx_orders_status_created ON (status, created_at DESC)
- idx_orders_created_date ON (created_at DESC)

### 19. payment_accounts
Seller payment account information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | User ID |
| revtag | text | NO | - | Revolut tag |
| verified | boolean | YES | false | Whether verified |
| verification_notes | text | YES | - | Verification notes |
| created_at | timestamp with time zone | NO | timezone('utc', now()) | Creation time |
| updated_at | timestamp with time zone | NO | timezone('utc', now()) | Last update time |
| payout_method | text | YES | 'revolut' | Payout method |
| bank_account_name | text | YES | - | Bank account name |
| bank_account_number | text | YES | - | Bank account number |
| bank_routing_number | text | YES | - | Bank routing number |
| bank_name | text | YES | - | Bank name |
| paypal_email | text | YES | - | PayPal email |
| preferred_currency | text | YES | 'USD' | Preferred currency |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (user_id)
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- CHECK (payout_method IN ('revolut', 'bank_transfer', 'paypal'))

**Indexes:**
- idx_payment_accounts_user_id ON (user_id)
- idx_payment_accounts_verified ON (verified)

### 20. payment_methods
Buyer payment methods.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| type | USER-DEFINED | NO | - | Payment method type |
| is_default | boolean | YES | false | Whether default |
| is_active | boolean | YES | true | Whether active |
| display_name | character varying(100) | YES | - | Display name |
| card_last4 | character varying(4) | YES | - | Card last 4 digits |
| card_brand | character varying(20) | YES | - | Card brand |
| card_exp_month | integer | YES | - | Card expiry month |
| card_exp_year | integer | YES | - | Card expiry year |
| card_funding | character varying(20) | YES | - | Card funding type |
| bank_name | character varying(100) | YES | - | Bank name |
| bank_last4 | character varying(4) | YES | - | Bank last 4 digits |
| bank_account_type | character varying(20) | YES | - | Bank account type |
| stripe_payment_method_id | character varying(255) | YES | - | Stripe method ID |
| stripe_customer_id | character varying(255) | YES | - | Stripe customer ID |
| paypal_account_id | character varying(255) | YES | - | PayPal account ID |
| paypal_email | character varying(255) | YES | - | PayPal email |
| billing_address_id | uuid | YES | - | Billing address ID |
| billing_postal_code | character varying(20) | YES | - | Billing postal code |
| billing_country | character varying(2) | YES | - | Billing country |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| last_used_at | timestamp with time zone | YES | - | Last used time |
| is_verified | boolean | YES | false | Whether verified |
| verified_at | timestamp with time zone | YES | - | Verification time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (billing_address_id) REFERENCES shipping_addresses(id)
- CHECK (card_exp_month >= 1 AND card_exp_month <= 12)
- CHECK (card_exp_year >= EXTRACT(year FROM now()))

**Indexes:**
- idx_payment_methods_user ON (user_id)
- idx_payment_methods_default ON (user_id, is_default) WHERE is_default = true

### 21. payment_transactions
Payment transaction records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_id | uuid | NO | - | Order ID |
| payment_method_id | uuid | YES | - | Payment method ID |
| amount | numeric(10,2) | NO | - | Transaction amount |
| currency | character varying(3) | YES | 'USD' | Currency code |
| status | USER-DEFINED | NO | 'pending' | Transaction status |
| processor | character varying(50) | NO | - | Payment processor |
| processor_transaction_id | character varying(255) | YES | - | Processor transaction ID |
| processor_response | jsonb | YES | - | Processor response |
| stripe_payment_intent_id | character varying(255) | YES | - | Stripe payment intent |
| stripe_charge_id | character varying(255) | YES | - | Stripe charge ID |
| stripe_refund_id | character varying(255) | YES | - | Stripe refund ID |
| client_secret | character varying(255) | YES | - | Client secret |
| paypal_order_id | character varying(255) | YES | - | PayPal order ID |
| paypal_capture_id | character varying(255) | YES | - | PayPal capture ID |
| paypal_refund_id | character varying(255) | YES | - | PayPal refund ID |
| description | text | YES | - | Transaction description |
| statement_descriptor | character varying(22) | YES | - | Statement descriptor |
| failure_code | character varying(50) | YES | - | Failure code |
| failure_message | text | YES | - | Failure message |
| platform_fee | numeric(10,2) | YES | 0 | Platform fee |
| processor_fee | numeric(10,2) | YES | 0 | Processor fee |
| net_amount | numeric(10,2) | YES | - | Net amount |
| authentication_required | boolean | YES | false | Auth required |
| authenticated | boolean | YES | false | Whether authenticated |
| created_at | timestamp with time zone | YES | now() | Creation time |
| processed_at | timestamp with time zone | YES | - | Processing time |
| failed_at | timestamp with time zone | YES | - | Failure time |
| refunded_at | timestamp with time zone | YES | - | Refund time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (processor_transaction_id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
- CHECK (amount > 0)

**Indexes:**
- idx_payment_transactions_order ON (order_id, status)
- idx_transactions_order ON (order_id)
- idx_transactions_status ON (status)
- idx_transactions_processor ON (processor, processor_transaction_id)

### 22. product_variants
Product variations (size, color, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| listing_id | uuid | NO | - | Listing ID |
| sku | character varying(100) | YES | - | SKU code |
| variant_type | character varying(50) | NO | - | Variant type |
| variant_value | character varying(100) | NO | - | Variant value |
| price_adjustment | numeric(10,2) | YES | 0 | Price adjustment |
| stock_quantity | integer | YES | 0 | Stock quantity |
| is_available | boolean | YES | true | Whether available |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (listing_id, variant_type, variant_value)
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
- CHECK (stock_quantity >= 0)

**Indexes:**
- idx_variants_listing ON (listing_id)
- idx_variants_available ON (is_available) WHERE is_available = true
- idx_variants_stock ON (stock_quantity) WHERE stock_quantity > 0

### 23. profiles
User profile information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key (user ID) |
| username | character varying(30) | NO | - | Unique username |
| full_name | character varying(100) | YES | - | Full name |
| bio | text | YES | - | User bio |
| avatar_url | text | YES | - | Avatar URL |
| location | character varying(100) | YES | - | User location |
| followers_count | integer | YES | 0 | Follower count |
| following_count | integer | YES | 0 | Following count |
| listings_count | integer | YES | 0 | Listings count |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| seller_rating | numeric(3,2) | YES | 0.0 | Seller rating |
| seller_rating_count | integer | YES | 0 | Seller rating count |
| buyer_rating | numeric(3,2) | YES | 0.0 | Buyer rating |
| buyer_rating_count | integer | YES | 0 | Buyer rating count |
| total_sales | integer | YES | 0 | Total sales |
| total_purchases | integer | YES | 0 | Total purchases |
| member_since | date | YES | CURRENT_DATE | Member since date |
| last_active | timestamp with time zone | YES | now() | Last active time |
| profile_views | integer | YES | 0 | Profile view count |
| cover_url | text | YES | - | Cover image URL |
| verification_badges | jsonb | YES | [] | Verification badges |
| social_links | jsonb | YES | {} | Social media links |
| seller_level | integer | YES | 1 | Seller level |
| total_earnings | numeric(12,2) | YES | 0.0 | Total earnings |
| response_time_hours | integer | YES | 24 | Response time (hours) |
| completion_percentage | integer | YES | 0 | Completion percentage |
| default_billing_address_id | uuid | YES | - | Default billing address |
| role | text | YES | 'user' | User role |
| is_seller | boolean | YES | false | Whether is seller |
| seller_verified | boolean | YES | false | Whether seller verified |
| email | text | YES | - | Email address |
| last_active_at | timestamp with time zone | YES | now() | Last active timestamp |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (username)
- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
- FOREIGN KEY (default_billing_address_id) REFERENCES shipping_addresses(id)
- CHECK (role IN ('user', 'admin', 'moderator'))
- CHECK (seller_level >= 1)
- CHECK (seller_rating >= 0 AND seller_rating <= 5)
- CHECK (buyer_rating >= 0 AND buyer_rating <= 5)
- CHECK (completion_percentage >= 0 AND completion_percentage <= 100)

**Indexes:**
- idx_profiles_role ON (role)
- idx_profiles_id_role ON (id, role)
- idx_profiles_id_seller ON (id, is_seller, seller_verified)
- idx_profiles_last_active ON (last_active DESC)
- idx_profiles_last_active_at ON (last_active_at DESC)
- idx_profiles_seller_rating ON (seller_rating DESC) WHERE seller_rating_count > 0
- idx_profiles_total_sales ON (total_sales DESC)
- idx_profiles_verification ON (verification_badges)

### 24. returns
Product return requests.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| return_number | character varying(20) | NO | - | Unique return number |
| order_id | uuid | NO | - | Order ID |
| order_item_id | uuid | NO | - | Order item ID |
| status | USER-DEFINED | NO | 'requested' | Return status |
| reason | USER-DEFINED | NO | - | Return reason |
| reason_details | text | YES | - | Reason details |
| quantity | integer | NO | 1 | Return quantity |
| item_condition | character varying(50) | YES | - | Item condition |
| refund_amount | numeric(10,2) | YES | - | Refund amount |
| refund_method | character varying(50) | YES | - | Refund method |
| refund_status | character varying(50) | YES | - | Refund status |
| refund_transaction_id | uuid | YES | - | Refund transaction ID |
| store_credit_issued | numeric(10,2) | YES | 0 | Store credit issued |
| return_shipping_paid_by | character varying(20) | YES | - | Who pays return shipping |
| return_shipping_label_url | text | YES | - | Return label URL |
| return_tracking_number | character varying(100) | YES | - | Return tracking number |
| return_carrier | USER-DEFINED | YES | - | Return carrier |
| return_shipping_cost | numeric(10,2) | YES | - | Return shipping cost |
| requested_at | timestamp with time zone | YES | now() | Request time |
| approved_at | timestamp with time zone | YES | - | Approval time |
| rejected_at | timestamp with time zone | YES | - | Rejection time |
| shipped_at | timestamp with time zone | YES | - | Ship time |
| received_at | timestamp with time zone | YES | - | Receipt time |
| inspected_at | timestamp with time zone | YES | - | Inspection time |
| refunded_at | timestamp with time zone | YES | - | Refund time |
| closed_at | timestamp with time zone | YES | - | Closure time |
| requested_by | uuid | NO | - | Requester user ID |
| approved_by | uuid | YES | - | Approver user ID |
| inspected_by | uuid | YES | - | Inspector user ID |
| buyer_photos | jsonb | YES | [] | Buyer photos |
| seller_photos | jsonb | YES | [] | Seller photos |
| buyer_notes | text | YES | - | Buyer notes |
| seller_notes | text | YES | - | Seller notes |
| admin_notes | text | YES | - | Admin notes |
| resolution_notes | text | YES | - | Resolution notes |
| final_decision | character varying(50) | YES | - | Final decision |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (return_number)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
- FOREIGN KEY (requested_by) REFERENCES profiles(id)
- FOREIGN KEY (approved_by) REFERENCES profiles(id)
- FOREIGN KEY (inspected_by) REFERENCES profiles(id)
- FOREIGN KEY (refund_transaction_id) REFERENCES archive.payment_refunds(id)

**Indexes:**
- idx_returns_order ON (order_id)
- idx_returns_status ON (status)
- idx_returns_requested_at ON (requested_at DESC)

### 25. shipping_addresses
User shipping addresses.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| is_default | boolean | YES | false | Whether default address |
| address_label | character varying(50) | YES | - | Address label |
| full_name | character varying(100) | NO | - | Recipient name |
| phone | character varying(20) | NO | - | Phone number |
| address_line1 | character varying(255) | NO | - | Address line 1 |
| address_line2 | character varying(255) | YES | - | Address line 2 |
| city | character varying(100) | NO | - | City |
| state_province | character varying(100) | NO | - | State/Province |
| postal_code | character varying(20) | NO | - | Postal code |
| country_code | character varying(2) | NO | 'US' | Country code |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

**Indexes:**
- idx_shipping_addresses_user ON (user_id)
- idx_shipping_addresses_default ON (user_id, is_default) WHERE is_default = true

### 26. shipping_labels
Generated shipping labels.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| order_id | uuid | NO | - | Order ID |
| tracking_id | uuid | YES | - | Tracking ID |
| label_url | text | NO | - | Label URL |
| label_format | character varying(10) | YES | 'PDF' | Label format |
| cost | numeric(10,2) | YES | - | Label cost |
| service_type | character varying(50) | YES | - | Service type |
| insurance_amount | numeric(10,2) | YES | - | Insurance amount |
| signature_required | boolean | YES | false | Signature required |
| created_at | timestamp with time zone | YES | now() | Creation time |
| expires_at | timestamp with time zone | YES | - | Expiration time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (tracking_id) REFERENCES order_tracking(id) ON DELETE CASCADE

**Indexes:**
- idx_labels_order ON (order_id)

### 27. shopping_carts
User shopping carts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |
| expires_at | timestamp with time zone | YES | now() + interval '30 days' | Expiration time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (user_id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

**Indexes:**
- idx_carts_user ON (user_id)
- idx_carts_expires ON (expires_at)

### 28. store_credits
User store credit balances.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| user_id | uuid | NO | - | User ID |
| amount | numeric(10,2) | NO | - | Credit amount |
| original_amount | numeric(10,2) | NO | - | Original amount |
| source_type | character varying(50) | NO | - | Source type |
| source_id | uuid | YES | - | Source ID |
| used_amount | numeric(10,2) | YES | 0 | Used amount |
| is_active | boolean | YES | true | Whether active |
| issued_at | timestamp with time zone | YES | now() | Issue time |
| expires_at | timestamp with time zone | YES | - | Expiration time |
| notes | text | YES | - | Notes |
| issued_by | uuid | YES | - | Issuer user ID |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (issued_by) REFERENCES profiles(id)
- CHECK (amount >= 0)
- CHECK (used_amount >= 0)

**Indexes:**
- idx_store_credits_user ON (user_id)
- idx_store_credits_active ON (user_id, is_active) WHERE is_active = true

### 29. stripe_webhook_events
Stripe webhook event logs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| stripe_event_id | text | NO | - | Stripe event ID |
| event_type | text | NO | - | Event type |
| processed | boolean | YES | false | Whether processed |
| created_at | timestamp with time zone | YES | now() | Creation time |
| processed_at | timestamp with time zone | YES | - | Processing time |
| error | text | YES | - | Error message |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (stripe_event_id)

**Indexes:**
- idx_stripe_webhook_events_stripe_event_id ON (stripe_event_id)
- idx_stripe_webhook_events_created_at ON (created_at)

### 30. transactions
Legacy transaction table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | text | NO | - | Primary key |
| buyer_id | uuid | NO | - | Buyer ID |
| seller_id | uuid | NO | - | Seller ID |
| listing_id | uuid | NO | - | Listing ID |
| amount | numeric(10,2) | NO | - | Transaction amount |
| currency | text | YES | 'USD' | Currency |
| status | text | YES | 'pending' | Status |
| payment_method | text | YES | - | Payment method |
| stripe_payment_intent_id | text | YES | - | Stripe payment intent |
| stripe_charge_id | text | YES | - | Stripe charge ID |
| stripe_transfer_id | text | YES | - | Stripe transfer ID |
| stripe_captured_at | timestamp with time zone | YES | - | Capture time |
| buyer_fee_amount | numeric(10,2) | YES | - | Buyer fee |
| buyer_fee_percentage | numeric(5,2) | YES | - | Buyer fee percentage |
| platform_fee_amount | numeric(10,2) | YES | - | Platform fee |
| seller_payout_amount | numeric(10,2) | YES | - | Seller payout |
| seller_payout_status | text | YES | 'pending' | Payout status |
| seller_revtag_encrypted | text | YES | - | Encrypted revtag |
| shipping_address | jsonb | YES | - | Shipping address |
| item_shipped_at | timestamp with time zone | YES | - | Ship time |
| payout_processed_at | timestamp with time zone | YES | - | Payout time |
| completed_at | timestamp with time zone | YES | - | Completion time |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (buyer_id) REFERENCES profiles(id)
- FOREIGN KEY (seller_id) REFERENCES profiles(id)
- FOREIGN KEY (listing_id) REFERENCES listings(id)

### 31. user_follows
User follow relationships.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| follower_id | uuid | NO | - | Follower user ID |
| following_id | uuid | NO | - | Following user ID |
| created_at | timestamp with time zone | YES | now() | Creation time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (follower_id, following_id)
- FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE
- CHECK (follower_id != following_id)

**Indexes:**
- idx_follows_follower ON (follower_id)
- idx_follows_following ON (following_id)

### 32. user_ratings
User ratings and reviews.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | extensions.uuid_generate_v4() | Primary key |
| rated_user_id | uuid | NO | - | Rated user ID |
| rater_user_id | uuid | NO | - | Rater user ID |
| listing_id | uuid | YES | - | Related listing ID |
| rating | integer | NO | - | Rating (1-5) |
| review_text | text | YES | - | Review text |
| rating_type | USER-DEFINED | NO | - | Rating type |
| helpful_count | integer | YES | 0 | Helpful count |
| created_at | timestamp with time zone | YES | now() | Creation time |
| updated_at | timestamp with time zone | YES | now() | Last update time |

**Constraints:**
- PRIMARY KEY (id)
- UNIQUE (rated_user_id, rater_user_id, listing_id, rating_type)
- FOREIGN KEY (rated_user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (rater_user_id) REFERENCES profiles(id) ON DELETE CASCADE
- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
- CHECK (rated_user_id != rater_user_id)
- CHECK (rating >= 1 AND rating <= 5)

**Indexes:**
- idx_user_ratings_rated_user ON (rated_user_id)
- idx_user_ratings_rater_user ON (rater_user_id)
- idx_user_ratings_listing ON (listing_id)
- idx_user_ratings_type_rating ON (rating_type, rating)

### 33. user_stats_summary
Aggregated user statistics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | User ID (Primary key) |
| total_sales | integer | YES | 0 | Total sales |
| total_purchases | integer | YES | 0 | Total purchases |
| total_revenue | numeric(10,2) | YES | 0 | Total revenue |
| total_spent | numeric(10,2) | YES | 0 | Total spent |
| avg_rating | numeric(3,2) | YES | - | Average rating |
| rating_count | integer | YES | 0 | Rating count |
| follower_count | integer | YES | 0 | Follower count |
| following_count | integer | YES | 0 | Following count |
| last_calculated_at | timestamp with time zone | YES | now() | Last calculation time |

**Constraints:**
- PRIMARY KEY (user_id)
- FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

**Indexes:**
- idx_user_stats_last_calc ON (last_calculated_at)

## Custom Types (ENUMs)

The database uses several custom enum types:

- `order_status`: Order status values
- `payment_status`: Payment status values
- `tracking_status`: Shipment tracking status
- `dispute_status`: Dispute status values
- `dispute_type`: Types of disputes
- `return_status`: Return request status
- `return_reason`: Return reason codes
- `shipping_carrier`: Shipping carrier names
- `notification_type`: Notification types
- `notification_channel`: Notification delivery channels
- `payment_method_type`: Payment method types
- `discount_type`: Discount/coupon types
- `rating_type`: User rating types

## Key Relationships

1. **User Relationships**:
   - profiles → auth.users (1:1)
   - All user-related tables reference profiles(id)

2. **Order Flow**:
   - orders → profiles (buyer/seller)
   - orders → order_items → listings
   - orders → payment_transactions
   - orders → order_tracking

3. **Product Management**:
   - listings → profiles (seller)
   - listings → categories
   - listings → product_variants
   - favorites → listings + profiles

4. **Communication**:
   - conversations → profiles (buyer/seller)
   - messages → conversations
   - disputes → orders
   - dispute_messages → disputes

5. **Payment Flow**:
   - payment_accounts → auth.users (sellers)
   - payment_methods → profiles (buyers)
   - payment_transactions → orders

## Performance Considerations

The database includes numerous indexes to optimize common queries:

1. **Primary Key Indexes**: All tables have primary key indexes
2. **Foreign Key Indexes**: Most foreign key columns are indexed
3. **Status Indexes**: Order, listing, and other status columns
4. **Timestamp Indexes**: Created_at and other time-based columns
5. **Search Indexes**: Full-text search on listings
6. **Composite Indexes**: Multi-column indexes for common query patterns

## Security Features

1. **Row Level Security (RLS)**: All tables have RLS policies
2. **User Isolation**: Users can only access their own data
3. **Cascade Deletes**: Proper cascade rules to maintain referential integrity
4. **Check Constraints**: Data validation at the database level
5. **Unique Constraints**: Prevent duplicate data where appropriate