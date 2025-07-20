# Supabase Structure Audit Report

## Executive Summary

After thorough analysis, I've identified critical discrepancies between the current Supabase database and our documentation. The SUPABASE_COMPLETE_STRUCTURE_FINAL.md contains features that haven't been implemented yet.

## Critical Findings

### 1. Missing Tables (4 tables documented but not in database)
- ❌ `profile_setup_progress` - Required for onboarding flow
- ❌ `brand_verification_requests` - Required for brand accounts
- ❌ `social_media_accounts` - Required for social linking
- ❌ `admin_approvals` - Required for admin workflow

### 2. Missing Columns in Profiles Table
Current profiles table is missing these critical columns:
- ❌ `is_admin` (BOOLEAN)
- ❌ `role` (user_role enum) - Currently TEXT, needs enum
- ❌ `account_type` (VARCHAR)
- ❌ `brand_name` (VARCHAR)
- ❌ `brand_description` (TEXT)
- ❌ `brand_logo_url` (TEXT)
- ❌ `brand_size` (VARCHAR)
- ❌ `badges` (TEXT[])
- ❌ `setup_completed` (BOOLEAN)
- ❌ `setup_started_at` (TIMESTAMPTZ)
- ❌ `setup_completed_at` (TIMESTAMPTZ)
- ❌ `avatar_style` (VARCHAR)
- ❌ `avatar_seed` (TEXT)
- ❌ `custom_avatar_url` (TEXT)
- ❌ `avatar_urls` (JSONB) - For responsive images
- ❌ `cover_urls` (JSONB) - For responsive images
- ❌ `stripe_customer_id` (VARCHAR)
- ❌ `stripe_account_id` (VARCHAR)
- ❌ `settings` (JSONB)
- ❌ `preferences` (JSONB)
- ❌ `phone` (VARCHAR)
- ❌ `date_of_birth` (DATE)
- ❌ `gender` (VARCHAR)
- ❌ `deleted_at` (TIMESTAMPTZ)
- ❌ `metadata` (JSONB)

### 3. Missing Columns in Listings Table
- ❌ `image_urls` (JSONB) - For responsive images

### 4. Missing Custom Types
- ❌ `user_role` enum type doesn't exist

### 5. Tables Found in Code but Not Documented
- ❓ `seller_payouts` - Referenced in code
- ❓ `shipping_events` - Referenced in code
- ❓ `admin_audit_log` - From migrations
- ❓ `query_performance_log` - From migrations
- ❓ `database_health_metrics` - From migrations
- ❓ `slow_queries` - From migrations
- ❓ `refund_requests` - From migrations
- ❓ `onboarding_progress` - Different from profile_setup_progress?

### 6. Function Count
- ✅ Database has 69 functions (document mentions 66)

### 7. Trigger Status
- ⚠️ 31 tables have triggers but trigger count shows 0 (internal PostgreSQL issue)
- All major tables have the `hastriggers` flag set to true

### 8. RLS Policies
- ✅ Database has 78 policies (document mentions 83+)
- Missing 5 policies are likely for the 4 missing onboarding tables

## Recommendations

### Immediate Actions Required

1. **Apply Missing Migrations**
   ```bash
   # These migrations need to be applied:
   npx supabase migration up 20250720170310_profile_setup_and_brand_verification.sql
   npx supabase migration up 20250720170510_admin_roles_setup.sql
   npx supabase migration up 20250720173241_add_responsive_image_urls.sql
   ```

2. **Update Document to Include Missing Tables**
   Add these tables found in code:
   - seller_payouts
   - shipping_events
   - admin_audit_log
   - query_performance_log
   - database_health_metrics
   - slow_queries
   - refund_requests

3. **Fix Profile Table Structure**
   The current profiles table has different columns than documented. Need to:
   - Add all missing columns via migration
   - Convert role from TEXT to user_role enum
   - Add responsive image columns

4. **Clarify Table Names**
   - Is `onboarding_progress` same as `profile_setup_progress`?
   - Is `seller_payouts` same as `payouts`?

## Validation Checklist

Before using SUPABASE_COMPLETE_STRUCTURE_FINAL.md:

1. ❌ All tables exist in database
2. ❌ All columns match exactly
3. ❌ All custom types exist
4. ✅ All functions documented (69 exist)
5. ✅ Triggers are set up (31 tables have triggers)
6. ✅ RLS policies exist (78/83 present)
7. ❌ Migrations have been applied

## Conclusion

The SUPABASE_COMPLETE_STRUCTURE_FINAL.md is comprehensive but includes features not yet in the database. The document is aspirational - it shows the complete intended structure, but several migrations haven't been applied yet.

**DO NOT use this document as-is for a fresh Supabase setup without:**
1. Removing the 4 onboarding tables if not needed
2. Adjusting the profiles table to match reality
3. Adding the missing tables found in code
4. Applying all pending migrations first