-- Index Usage Monitoring Script for Production
-- Run this weekly to track which indexes are actually being used

-- 1. Check index usage statistics
CREATE OR REPLACE VIEW index_usage_report AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as rows_read_via_index,
    idx_tup_fetch as rows_fetched_via_index,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'RARELY USED'
        WHEN idx_scan < 100 THEN 'OCCASIONALLY USED'
        WHEN idx_scan < 1000 THEN 'FREQUENTLY USED'
        ELSE 'HEAVILY USED'
    END as usage_category
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'archive')
ORDER BY idx_scan DESC, schemaname, tablename;

-- 2. Find potentially missing indexes (high sequential scans)
CREATE OR REPLACE VIEW missing_index_candidates AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    CASE
        WHEN seq_scan > 0 THEN 
            ROUND((seq_scan::numeric / (seq_scan + idx_scan)) * 100, 2)
        ELSE 0
    END as seq_scan_percentage,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname IN ('public', 'archive')
    AND seq_scan > 1000  -- Tables with significant sequential scans
    AND seq_scan > idx_scan * 2  -- More seq scans than index scans
ORDER BY seq_scan DESC;

-- 3. Check most expensive queries (might need new indexes)
CREATE OR REPLACE VIEW expensive_queries AS
SELECT 
    substring(query, 1, 100) as query_preview,
    calls,
    round(total_exec_time::numeric, 2) as total_time_ms,
    round(mean_exec_time::numeric, 2) as avg_time_ms,
    round(stddev_exec_time::numeric, 2) as stddev_time_ms,
    rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_%'  -- Exclude system queries
    AND mean_exec_time > 50  -- Queries taking more than 50ms on average
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 4. Daily index usage snapshot (create table first time)
CREATE TABLE IF NOT EXISTS index_usage_history (
    snapshot_date date,
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint,
    index_size text,
    PRIMARY KEY (snapshot_date, schemaname, tablename, indexname)
);

-- Insert today's snapshot
INSERT INTO index_usage_history (snapshot_date, schemaname, tablename, indexname, idx_scan, index_size)
SELECT 
    CURRENT_DATE,
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'archive')
ON CONFLICT (snapshot_date, schemaname, tablename, indexname) 
DO UPDATE SET idx_scan = EXCLUDED.idx_scan, index_size = EXCLUDED.index_size;

-- 5. Weekly usage growth report
CREATE OR REPLACE VIEW index_usage_growth AS
SELECT 
    h1.schemaname,
    h1.tablename,
    h1.indexname,
    h1.idx_scan as scans_today,
    h7.idx_scan as scans_week_ago,
    h1.idx_scan - COALESCE(h7.idx_scan, 0) as weekly_growth,
    h1.index_size
FROM index_usage_history h1
LEFT JOIN index_usage_history h7 
    ON h1.schemaname = h7.schemaname 
    AND h1.tablename = h7.tablename 
    AND h1.indexname = h7.indexname
    AND h7.snapshot_date = h1.snapshot_date - INTERVAL '7 days'
WHERE h1.snapshot_date = CURRENT_DATE
ORDER BY weekly_growth DESC;

-- 6. Recommended actions report
SELECT 'RECOMMENDED ACTIONS:' as recommendation
UNION ALL
SELECT '==================='
UNION ALL
SELECT ''
UNION ALL
-- Unused indexes that could be dropped
SELECT 'Consider DROPPING: ' || schemaname || '.' || indexname || 
       ' (Size: ' || index_size || ', Never used)'
FROM index_usage_report
WHERE times_used = 0
    AND index_size != '0 bytes'
    AND indexname NOT LIKE '%_pkey'  -- Don't drop primary keys
    AND indexname NOT LIKE '%_fkey'  -- Keep foreign key indexes
UNION ALL
SELECT ''
UNION ALL
-- Tables that might need indexes
SELECT 'Consider INDEXING: ' || schemaname || '.' || tablename || 
       ' (Sequential scan %: ' || seq_scan_percentage || ', Size: ' || table_size || ')'
FROM missing_index_candidates
WHERE seq_scan_percentage > 80
LIMIT 10;

-- Usage examples:
-- SELECT * FROM index_usage_report WHERE usage_category = 'UNUSED';
-- SELECT * FROM missing_index_candidates;
-- SELECT * FROM expensive_queries;
-- SELECT * FROM index_usage_growth WHERE weekly_growth > 0;