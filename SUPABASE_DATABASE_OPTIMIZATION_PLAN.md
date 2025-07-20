# Supabase Database Backend Optimization Plan

## Overview
Instead of removing indexes, let's optimize the database for maximum performance following Supabase best practices. This plan focuses on adding what's missing rather than removing what might be useful.

## 1. Complete Foreign Key Index Coverage ✅

### Already Planned
- **Migration 001**: Adds 27 critical foreign key indexes for public schema
- **Migration 002**: Adds 17 foreign key indexes for archive schema
- **Status**: Ready to apply - these are essential

## 2. Add Composite Indexes for Common Query Patterns

### New Migration: 003_add_composite_performance_indexes.sql

```sql
-- User dashboard queries
CREATE INDEX CONCURRENTLY idx_orders_buyer_created_status 
ON orders(buyer_id, created_at DESC, status);

CREATE INDEX CONCURRENTLY idx_orders_seller_created_status 
ON orders(seller_id, created_at DESC, status);

-- Listing search optimization
CREATE INDEX CONCURRENTLY idx_listings_active_category_price 
ON listings(is_active, category_id, price) 
WHERE is_active = true AND deleted_at IS NULL;

-- Cart optimization
CREATE INDEX CONCURRENTLY idx_cart_items_cart_created 
ON cart_items(cart_id, created_at DESC);

-- Messaging optimization
CREATE INDEX CONCURRENTLY idx_messages_conversation_created_desc 
ON messages(conversation_id, created_at DESC);

-- Notification optimization  
CREATE INDEX CONCURRENTLY idx_notifications_user_read_created 
ON notifications(user_id, read, created_at DESC);
```

## 3. Optimize RLS (Row Level Security) Policies

### Key Principles:
1. **Use indexes in RLS policies** - Ensure all columns used in RLS have indexes
2. **Simplify policy logic** - Complex policies slow down queries
3. **Cache user data** - Use security definer functions

### Migration: 004_optimize_rls_policies.sql

```sql
-- Create helper functions for common RLS checks
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
AS $$
  SELECT auth.uid()
$$;

-- Optimized RLS policy example
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (buyer_id = auth.user_id() OR seller_id = auth.user_id());

-- Add index for RLS policy
CREATE INDEX CONCURRENTLY idx_orders_buyer_seller 
ON orders(buyer_id, seller_id);
```

## 4. Database Functions for Complex Operations

### Migration: 005_add_performance_functions.sql

```sql
-- Function for updating order totals (faster than client-side)
CREATE OR REPLACE FUNCTION calculate_order_total(order_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total numeric;
BEGIN
  SELECT SUM(quantity * price) INTO total
  FROM order_items
  WHERE order_id = $1;
  
  RETURN COALESCE(total, 0);
END;
$$;

-- Function for user statistics (cached)
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(DISTINCT o.id),
    'total_spent', SUM(o.total_amount),
    'total_listings', COUNT(DISTINCT l.id),
    'seller_rating', AVG(r.rating)
  ) INTO stats
  FROM profiles p
  LEFT JOIN orders o ON o.buyer_id = p.id
  LEFT JOIN listings l ON l.seller_id = p.id
  LEFT JOIN user_ratings r ON r.rated_user_id = p.id
  WHERE p.id = $1;
  
  RETURN stats;
END;
$$;
```

## 5. Materialized Views for Analytics

### Migration: 006_add_materialized_views.sql

```sql
-- Popular products view
CREATE MATERIALIZED VIEW popular_products AS
SELECT 
  l.id,
  l.title,
  l.price,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.quantity) as total_sold,
  AVG(r.rating) as avg_rating
FROM listings l
LEFT JOIN order_items oi ON oi.listing_id = l.id
LEFT JOIN user_ratings r ON r.listing_id = l.id
WHERE l.is_active = true
GROUP BY l.id, l.title, l.price;

CREATE INDEX idx_popular_products_order_count 
ON popular_products(order_count DESC);

-- Refresh schedule (daily)
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
END;
$$;
```

## 6. Partitioning for Large Tables

### Migration: 007_partition_large_tables.sql

```sql
-- Partition orders by created_at (monthly)
-- Note: This is for when you have millions of orders

-- Partition messages by created_at
-- Helps with archiving old conversations

-- Partition notifications by created_at
-- Auto-delete old notifications
```

## 7. Query Performance Optimization

### Add EXPLAIN ANALYZE checks

```sql
-- Create a function to log slow queries
CREATE TABLE query_performance_log (
  id serial PRIMARY KEY,
  query_text text,
  execution_time numeric,
  rows_returned int,
  created_at timestamptz DEFAULT now()
);
```

## 8. Connection Pooling Configuration

### Supabase Dashboard Settings:
1. **Pool Size**: Set based on expected concurrent users
2. **Pool Mode**: Use "Transaction" mode for better performance
3. **Statement Timeout**: Set to prevent long-running queries
4. **Idle Timeout**: Configure based on usage patterns

## 9. Enable pg_stat_statements

```sql
-- Track query performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

## 10. Database Maintenance

### Migration: 008_add_maintenance_functions.sql

```sql
-- Auto-vacuum configuration
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE listings SET (autovacuum_vacuum_scale_factor = 0.1);

-- Regular maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update table statistics
  ANALYZE;
  
  -- Reindex if needed
  REINDEX INDEX CONCURRENTLY idx_orders_created;
  
  -- Clean up old data
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;
```

## Implementation Order

1. **First**: Apply foreign key indexes (001, 002)
2. **Second**: Add composite indexes (003)
3. **Third**: Optimize RLS policies (004)
4. **Fourth**: Add performance functions (005)
5. **Fifth**: Create materialized views (006)
6. **Later**: Consider partitioning when data grows

## Monitoring & Metrics

### Key Metrics to Track:
- Query execution time (p50, p95, p99)
- Index hit rate (should be >99%)
- Cache hit rate
- Connection pool utilization
- Database size growth
- Slow query count

### Tools:
- Supabase Dashboard metrics
- pg_stat_statements
- Custom monitoring queries
- Application-level timing

## Best Practices Summary

1. **Keep all indexes** until proven unnecessary with production data
2. **Add composite indexes** for common query patterns
3. **Use database functions** for complex operations
4. **Optimize RLS policies** with proper indexes
5. **Monitor everything** before making changes
6. **Test on branch** before production
7. **Plan for growth** with partitioning strategy

## Next Steps

1. Apply foreign key index migrations (001, 002)
2. Create and test composite index migration
3. Review and optimize RLS policies
4. Implement monitoring
5. Go live and collect metrics
6. Optimize based on real usage data

Remember: **Premature optimization is the root of all evil, but proper indexing is not premature!**