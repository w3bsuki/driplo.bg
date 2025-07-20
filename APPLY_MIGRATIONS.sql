-- Combined Migration Script for Supabase Performance Optimizations
-- Apply these in order in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/guqjihzgnnzdsyxntnvd/sql/new

-- IMPORTANT: The auth session migration (003) is critical for fixing the 1-hour login timeout issue!

-- Step 1: Run 001_add_critical_foreign_key_indexes.sql
-- Step 2: Run 002_add_archive_foreign_key_indexes.sql  
-- Step 3: Run 003_optimize_auth_and_sessions.sql (MOST IMPORTANT - extends sessions to 30 days!)
-- Step 4: Run 004_add_composite_performance_indexes.sql
-- Step 5: Run 005_optimize_rls_policies.sql
-- Step 6: Run 006_add_performance_functions.sql
-- Step 7: Run 007_add_performance_monitoring.sql
-- Step 8: Run 008_add_materialized_views.sql

-- After applying migrations, update your app.d.ts to use the new auth session system!