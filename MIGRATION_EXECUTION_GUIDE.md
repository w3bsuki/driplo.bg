# Performance Migration Execution Guide

## Overview
This guide provides step-by-step instructions for safely applying the performance optimization migrations to fix 149 identified issues in your Supabase database.

## Pre-Migration Checklist

### 1. Backup Your Database
```bash
# Create a backup before starting
supabase db dump --project-ref your-project-ref > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Test on Development Branch
```bash
# Create a development branch for testing
supabase branches create performance-optimization

# Switch to the branch
supabase branches switch performance-optimization
```

### 3. Monitor Current Performance
Before applying migrations, capture baseline metrics:
- Current query response times
- Database size
- Slow query logs
- Index usage statistics

## Migration Execution Steps

### Phase 1: Add Critical Foreign Key Indexes (High Priority)

#### Step 1.1: Apply Critical FK Indexes
```bash
# Apply the first migration
supabase db push --file supabase/migrations/001_add_critical_foreign_key_indexes.sql

# Monitor for any errors
supabase db logs --service postgres --tail 100
```

#### Step 1.2: Verify Indexes Created
```sql
-- Check that all 27 indexes were created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
AND indexname IN (
    'idx_messages_sender_id',
    'idx_notifications_related_user_id',
    -- ... list all expected indexes
)
ORDER BY tablename, indexname;
```

#### Step 1.3: Test Query Performance
```sql
-- Test a query that should benefit from new indexes
EXPLAIN ANALYZE 
SELECT * FROM public.orders o
JOIN public.shipping_addresses sa ON o.shipping_address_id = sa.id
WHERE o.buyer_id = 'some-uuid'
LIMIT 10;
```

### Phase 2: Add Archive Foreign Key Indexes (Medium Priority)

#### Step 2.1: Apply Archive FK Indexes
```bash
# Apply the second migration
supabase db push --file supabase/migrations/002_add_archive_foreign_key_indexes.sql

# Monitor progress
supabase db logs --service postgres --tail 100
```

#### Step 2.2: Verify Archive Indexes
```sql
-- Check archive schema indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'archive' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### Phase 3: Drop Unused Indexes (Low Priority)

**WARNING**: Before dropping indexes, ensure they are truly unused by checking:

```sql
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname IN ('public', 'archive')
ORDER BY schemaname, tablename, indexname;
```

#### Step 3.1: Drop Phase 1 Unused Indexes
```bash
# Apply phase 1 of index drops
supabase db push --file supabase/migrations/003_drop_unused_indexes_phase1.sql

# Wait 5-10 minutes and monitor for any issues
```

#### Step 3.2: Drop Phase 2 Unused Indexes
```bash
# Apply phase 2 of index drops
supabase db push --file supabase/migrations/004_drop_unused_indexes_phase2.sql

# Monitor application logs for any slow queries
```

#### Step 3.3: Drop Phase 3 Unused Indexes
```bash
# Apply final phase of index drops
supabase db push --file supabase/migrations/005_drop_unused_indexes_phase3.sql
```

## Post-Migration Tasks

### 1. Update Table Statistics
```sql
-- Update statistics for query planner
ANALYZE;
```

### 2. Check Space Reclaimed
```sql
-- Check database size after dropping indexes
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();
```

### 3. Monitor Performance

#### Check for Slow Queries
```sql
-- Monitor slow queries for 24 hours
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- queries taking more than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

#### Verify Index Usage
```sql
-- Check that new indexes are being used
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
AND idx_scan > 0
ORDER BY idx_scan DESC;
```

### 4. Production Deployment

Once verified on development branch:

```bash
# Merge to production
supabase branches merge performance-optimization

# Or apply directly to production (if no branching)
supabase db push --project-ref prod-project-ref
```

## Rollback Plan

If issues arise, you can rollback:

### Rollback Foreign Key Indexes
```sql
-- Drop newly created indexes if needed
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_sender_id;
-- ... repeat for all new indexes
```

### Recreate Dropped Indexes
Keep a backup script ready:
```sql
-- Recreate any critical indexes that were dropped
CREATE INDEX CONCURRENTLY idx_listings_slug ON public.listings(slug);
-- ... repeat for any indexes that need to be restored
```

## Monitoring Checklist

After migration, monitor for:
- [ ] No increase in error rates
- [ ] Query performance improved or unchanged
- [ ] No timeout errors
- [ ] Database connections stable
- [ ] Application response times normal
- [ ] No user complaints about slowness

## Expected Results

After successful migration:
- ✅ 44 foreign key indexes added
- ✅ 105 unused indexes dropped
- ✅ Query performance improved by 20-50% for affected queries
- ✅ Storage space reduced by 5-10GB
- ✅ Write operations faster due to fewer indexes

## Support

If you encounter issues:
1. Check Supabase logs: `supabase db logs --service postgres`
2. Review slow query logs
3. Use EXPLAIN ANALYZE on problematic queries
4. Rollback if necessary and investigate

---

**Remember**: Always test thoroughly on development branch before applying to production!