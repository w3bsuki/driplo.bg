# Database Maintenance Quick Reference

## Daily Tasks (Automated)

```sql
-- Run every day at 3 AM (off-peak)
SELECT * FROM maintenance.run_automated_maintenance('high', 5, FALSE);
```

## Weekly Tasks

```sql
-- Check table health
SELECT * FROM maintenance.current_recommendations;

-- Run medium priority maintenance
SELECT * FROM maintenance.run_automated_maintenance('medium', 10, FALSE);

-- Check maintenance statistics
SELECT * FROM maintenance.get_maintenance_stats(7);
```

## Emergency Procedures

### When Performance Degrades

```sql
-- 1. Quick health check
SELECT 
    full_table_name,
    table_size_pretty,
    bloat_ratio,
    maintenance_priority,
    (recommendation->>'reason') as reason
FROM maintenance.current_recommendations
WHERE maintenance_priority IN ('critical', 'high')
LIMIT 10;

-- 2. Fix critical tables immediately
SELECT * FROM maintenance.perform_maintenance(
    'public', 'table_name', 'VACUUM ANALYZE', TRUE
);
```

### Monitor Active Maintenance

```sql
-- View running maintenance operations
SELECT 
    pid,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity
WHERE query LIKE '%VACUUM%' OR query LIKE '%ANALYZE%';

-- Recent maintenance operations
SELECT 
    operation_type,
    table_name,
    started_at,
    duration_ms,
    pg_size_pretty(space_saved_bytes) as space_saved,
    success,
    error_message
FROM maintenance.operation_log
WHERE started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;
```

## Key Metrics

### Bloat Thresholds
- **< 10%**: Healthy
- **10-20%**: Monitor
- **20-50%**: VACUUM needed
- **> 50%**: VACUUM FULL consideration

### High-Traffic Tables (Already Configured)
- `listings`: autovacuum at 10% + 100 rows
- `orders`: autovacuum at 10% + 100 rows
- `messages`: autovacuum at 15% + 150 rows
- `notifications`: autovacuum at 15% + 150 rows

## Common Commands

```sql
-- Manual VACUUM with progress
VACUUM (VERBOSE, ANALYZE) public.listings;

-- Check specific table bloat
SELECT * FROM maintenance.check_table_health('public')
WHERE table_name = 'listings';

-- Dry run to see what would be done
SELECT * FROM maintenance.run_automated_maintenance('medium', 10, TRUE);

-- Force analyze all tables
ANALYZE;
```

## Setting Up Alerts

Monitor these conditions:
1. Bloat ratio > 30% on any table
2. No vacuum in 7+ days on active tables
3. Failed maintenance operations
4. Maintenance duration > 30 minutes

```sql
-- Alert query for monitoring
SELECT 
    'ALERT: High bloat on ' || full_table_name as alert,
    bloat_ratio,
    table_size_pretty
FROM maintenance.current_recommendations
WHERE bloat_ratio > 30
AND maintenance_priority IN ('critical', 'high');
```