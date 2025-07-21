# Database Maintenance Schedule Guide

## Overview

This guide provides a comprehensive database maintenance schedule for VACUUM and ANALYZE operations in Supabase/PostgreSQL. Regular maintenance prevents table bloat, updates query planner statistics, and ensures optimal database performance.

## Table of Contents
1. [Understanding VACUUM and ANALYZE](#understanding-vacuum-and-analyze)
2. [Maintenance Functions](#maintenance-functions)
3. [Automated Maintenance Schedule](#automated-maintenance-schedule)
4. [Monitoring Table Health](#monitoring-table-health)
5. [Manual Maintenance Procedures](#manual-maintenance-procedures)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Understanding VACUUM and ANALYZE

### VACUUM Operations

VACUUM reclaims storage occupied by dead tuples (deleted or updated rows):

- **VACUUM**: Removes dead row versions and makes space available for reuse
- **VACUUM FULL**: Rewrites entire table to remove all dead space (locks table)
- **VACUUM ANALYZE**: Combines VACUUM with statistics update

### ANALYZE Operations

ANALYZE updates table statistics used by the query planner:
- Collects statistics about data distribution
- Helps optimizer choose efficient query plans
- Should run after significant data changes

### Autovacuum

PostgreSQL's autovacuum daemon automatically runs VACUUM and ANALYZE:
- Triggers based on dead tuple count and table activity
- Configurable per-table thresholds
- Runs in background without blocking queries

## Maintenance Functions

### 1. Check Table Health

```sql
-- Check all tables in public schema
SELECT * FROM maintenance.check_table_health('public');

-- View current recommendations
SELECT * FROM maintenance.current_recommendations;
```

Output includes:
- Table sizes and bloat ratios
- Dead tuple counts
- Last maintenance timestamps
- Specific recommendations with urgency levels

### 2. Perform Maintenance

```sql
-- Run VACUUM ANALYZE on a specific table
SELECT * FROM maintenance.perform_maintenance(
    'public',           -- schema
    'listings',         -- table
    'VACUUM ANALYZE',   -- operation
    TRUE               -- log operation
);

-- Run VACUUM FULL (use cautiously - locks table)
SELECT * FROM maintenance.perform_maintenance(
    'public', 
    'orders', 
    'VACUUM FULL',
    TRUE
);
```

### 3. Automated Maintenance

```sql
-- Dry run - see what would be done
SELECT * FROM maintenance.run_automated_maintenance(
    'medium',    -- priority threshold
    5,          -- max tables to process
    TRUE        -- dry run
);

-- Execute maintenance on high-priority tables
SELECT * FROM maintenance.run_automated_maintenance(
    'high',     -- only critical and high priority
    3,          -- process up to 3 tables
    FALSE       -- actually execute
);
```

### 4. View Maintenance Statistics

```sql
-- Get maintenance history for last 30 days
SELECT * FROM maintenance.get_maintenance_stats(30);

-- View operation log
SELECT 
    operation_type,
    table_name,
    started_at,
    duration_ms,
    pg_size_pretty(space_saved_bytes) as space_saved,
    success
FROM maintenance.operation_log
ORDER BY started_at DESC
LIMIT 20;
```

## Automated Maintenance Schedule

### Recommended Schedule

#### Daily Maintenance (Off-Peak Hours)
```sql
-- Run at 3:00 AM daily
SELECT * FROM maintenance.run_automated_maintenance('high', 5, FALSE);
```

#### Weekly Maintenance (Weekend)
```sql
-- Run on Sunday at 2:00 AM
SELECT * FROM maintenance.run_automated_maintenance('medium', 10, FALSE);
```

#### Monthly Deep Maintenance
```sql
-- First Sunday of month at 1:00 AM
-- Check all tables and process low priority
SELECT * FROM maintenance.check_table_health('public');
SELECT * FROM maintenance.run_automated_maintenance('low', 20, FALSE);
```

### Setting Up Scheduled Jobs

#### Using pg_cron (if available in Supabase):
```sql
-- Daily high-priority maintenance
SELECT cron.schedule(
    'daily-vacuum-high-priority',
    '0 3 * * *',  -- 3:00 AM daily
    $$SELECT * FROM maintenance.run_automated_maintenance('high', 5, FALSE);$$
);

-- Weekly medium-priority maintenance  
SELECT cron.schedule(
    'weekly-vacuum-medium-priority',
    '0 2 * * 0',  -- 2:00 AM on Sundays
    $$SELECT * FROM maintenance.run_automated_maintenance('medium', 10, FALSE);$$
);

-- Monthly comprehensive check
SELECT cron.schedule(
    'monthly-maintenance-check',
    '0 1 1 * *',  -- 1:00 AM on 1st of month
    $$SELECT * FROM maintenance.check_table_health('public');$$
);
```

#### Using External Scheduler:
If pg_cron is not available, use external tools:
- GitHub Actions with scheduled workflows
- Cloud Functions (AWS Lambda, Google Cloud Functions)
- Cron jobs on application server
- Monitoring services with scheduled tasks

Example GitHub Action:
```yaml
name: Database Maintenance
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Run maintenance
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          psql $DATABASE_URL -c "SELECT * FROM maintenance.run_automated_maintenance('high', 5, FALSE);"
```

## Monitoring Table Health

### Key Metrics to Monitor

1. **Bloat Ratio**: Percentage of dead tuples
   - < 10%: Healthy
   - 10-20%: Monitor closely
   - 20-50%: Needs VACUUM
   - > 50%: Consider VACUUM FULL

2. **Table Size Growth**: Unexpected growth indicates bloat

3. **Last Maintenance Times**: Tables not vacuumed in 30+ days need attention

### Dashboard Queries

```sql
-- Tables with highest bloat
SELECT 
    full_table_name,
    table_size_pretty,
    bloat_ratio,
    maintenance_priority,
    (recommendation->>'reason') as reason
FROM maintenance.current_recommendations
ORDER BY bloat_ratio DESC
LIMIT 10;

-- Tables not vacuumed recently
SELECT 
    schema_name || '.' || table_name as table_name,
    table_size_pretty,
    COALESCE(last_vacuum, last_autovacuum) as last_vacuum_time,
    NOW() - COALESCE(last_vacuum, last_autovacuum) as time_since_vacuum
FROM maintenance.table_health
WHERE checked_at > NOW() - INTERVAL '1 hour'
AND COALESCE(last_vacuum, last_autovacuum) < NOW() - INTERVAL '7 days'
ORDER BY table_size DESC;

-- Maintenance operation success rate
SELECT 
    operation_type,
    COUNT(*) as total_operations,
    COUNT(*) FILTER (WHERE success = TRUE) as successful,
    ROUND(
        COUNT(*) FILTER (WHERE success = TRUE)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as success_rate,
    ROUND(AVG(duration_ms), 2) as avg_duration_ms
FROM maintenance.operation_log
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY operation_type;
```

## Manual Maintenance Procedures

### Emergency Maintenance

When experiencing performance issues:

```sql
-- 1. Check current activity
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE state != 'idle';

-- 2. Identify problematic tables
SELECT * FROM maintenance.check_table_health('public')
WHERE maintenance_priority IN ('critical', 'high');

-- 3. Run targeted maintenance
SELECT * FROM maintenance.perform_maintenance(
    'public',
    'problematic_table',
    'VACUUM ANALYZE',
    TRUE
);
```

### Full Database Maintenance

For comprehensive maintenance during planned downtime:

```sql
-- 1. Analyze all tables
ANALYZE;

-- 2. Run automated maintenance on all priorities
SELECT * FROM maintenance.run_automated_maintenance('low', 50, FALSE);

-- 3. Update materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY seller_analytics_summary;
-- ... refresh other materialized views

-- 4. Reindex if needed (requires brief locks)
REINDEX INDEX CONCURRENTLY idx_listings_created_at;
REINDEX INDEX CONCURRENTLY idx_orders_user_id;
```

## Best Practices

### 1. Configure Autovacuum Appropriately

High-traffic tables need aggressive settings:

```sql
-- Already configured in migration for:
-- listings: scale_factor=0.1, threshold=100
-- orders: scale_factor=0.1, threshold=100  
-- messages: scale_factor=0.15, threshold=150
-- notifications: scale_factor=0.15, threshold=150
-- views: scale_factor=0.2, threshold=200
```

### 2. Monitor Long-Running Queries

```sql
-- Queries running longer than 5 minutes
SELECT 
    pid,
    usename,
    NOW() - query_start as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
AND NOW() - query_start > interval '5 minutes'
ORDER BY duration DESC;
```

### 3. Prevent Bloat

- Use HOT updates when possible (don't update indexed columns)
- Batch deletes to avoid excessive dead tuples
- Consider partitioning for large time-series tables
- Use TRUNCATE instead of DELETE for full table clears

### 4. Index Maintenance

```sql
-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find duplicate indexes
WITH index_data AS (
    SELECT
        indrelid,
        indexrelid,
        indkey,
        indclass
    FROM pg_index
)
SELECT 
    a.indrelid::regclass AS table_name,
    a.indexrelid::regclass AS index_name_a,
    b.indexrelid::regclass AS index_name_b
FROM index_data a
JOIN index_data b ON a.indrelid = b.indrelid
    AND a.indkey = b.indkey
    AND a.indclass = b.indclass
    AND a.indexrelid < b.indexrelid;
```

## Troubleshooting

### Common Issues

#### 1. VACUUM Takes Too Long
- Check for long-running transactions blocking cleanup
- Consider increasing `maintenance_work_mem`
- Use VACUUM (VERBOSE) to see progress

#### 2. Autovacuum Not Running
```sql
-- Check if autovacuum is enabled
SHOW autovacuum;

-- Check autovacuum activity
SELECT 
    schemaname,
    tablename,
    last_autovacuum,
    autovacuum_count
FROM pg_stat_user_tables
WHERE last_autovacuum IS NOT NULL
ORDER BY last_autovacuum DESC;
```

#### 3. Excessive Bloat Despite VACUUM
- May need VACUUM FULL (requires downtime)
- Consider pg_repack extension for online cleanup
- Review application for long-running transactions

#### 4. Lock Conflicts
```sql
-- View current locks
SELECT 
    locktype,
    relation::regclass,
    mode,
    granted,
    pid
FROM pg_locks
WHERE relation IS NOT NULL
AND relation::regclass::text LIKE 'public.%';
```

### Performance Impact

- **VACUUM**: Minimal impact, runs concurrently
- **VACUUM FULL**: Locks table, use during maintenance windows
- **ANALYZE**: Very fast, minimal impact
- **REINDEX**: Brief exclusive locks, use CONCURRENTLY option

### Monitoring Queries

```sql
-- Current autovacuum workers
SELECT 
    pid,
    query_start,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity
WHERE query LIKE 'autovacuum:%';

-- Tables close to autovacuum threshold
WITH stats AS (
    SELECT
        schemaname,
        tablename,
        n_live_tup,
        n_dead_tup,
        n_mod_since_analyze,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
    FROM pg_stat_user_tables
)
SELECT 
    schemaname || '.' || tablename as table_name,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_percent,
    n_mod_since_analyze,
    last_autovacuum,
    last_autoanalyze
FROM stats
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 20;
```

## Summary

Effective database maintenance requires:
1. Regular monitoring of table health
2. Automated maintenance for routine cleanup
3. Manual intervention for critical issues
4. Proper autovacuum configuration
5. Understanding of workload patterns

Use the provided functions to implement a maintenance schedule appropriate for your workload. Start with conservative settings and adjust based on monitoring data.