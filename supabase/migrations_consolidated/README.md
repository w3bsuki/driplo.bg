# Driplo Marketplace - Fresh Supabase Setup Guide

## 🚀 Quick Start

This directory contains 5 consolidated migration files that will set up your entire Driplo marketplace database from scratch. These replace the 50+ messy migration files in the main migrations folder.

## ⚠️ Prerequisites

1. **Fresh Supabase Project**: Use project `kklojkexldqbqlfzsfsj.supabase.co`
2. **Admin Access**: You need admin/owner access to the Supabase project
3. **MCP Configured**: Ensure your Claude Code MCP is pointing to the correct project

## 📋 Migration Files Overview

| File | Purpose | Tables Created | Features |
|------|---------|----------------|-----------|
| `001_core_database_setup.sql` | Core tables & triggers | 25+ tables | Users, products, orders, messaging |
| `002_rls_policies.sql` | Security policies | 0 tables | Complete RLS coverage |
| `003_rpc_functions.sql` | Server functions | 0 tables | Auth, analytics, utilities |
| `004_indexes_performance.sql` | Performance optimization | 0 tables | 100+ indexes for fast queries |
| `005_storage_initial_data.sql` | Storage & seed data | Storage buckets | Categories, brands, coupons |

## 🔧 Step-by-Step Setup

### Step 1: Apply Core Database Setup

Run this first in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of 001_core_database_setup.sql
```

**Expected Result**: 25+ tables created including profiles, listings, orders, messages, etc.

### Step 2: Apply RLS Policies

```sql
-- Copy and paste the entire content of 002_rls_policies.sql
```

**Expected Result**: All tables secured with row-level security policies.

### Step 3: Apply RPC Functions

```sql
-- Copy and paste the entire content of 003_rpc_functions.sql
```

**Expected Result**: 15+ server functions created for auth, analytics, and utilities.

### Step 4: Apply Performance Indexes

```sql
-- Copy and paste the entire content of 004_indexes_performance.sql
```

**Expected Result**: 100+ indexes created for optimal query performance.

### Step 5: Apply Storage & Initial Data

```sql
-- Copy and paste the entire content of 005_storage_initial_data.sql
```

**Expected Result**: Storage buckets created, categories/brands/coupons inserted.

## 🔐 Post-Setup Configuration

### 1. Create Your Admin Account

```sql
SELECT public.make_user_admin('your-email@example.com');
```

### 2. Configure Auth Settings

In your Supabase dashboard:
- Go to Authentication > Settings
- Enable email confirmations
- Set session timeout to 24 hours
- Enable password strength validation

### 3. Configure Storage

In your Supabase dashboard:
- Go to Storage
- Verify buckets are created: `avatars`, `listings`, `documents`, `brands`
- Check RLS policies are applied

### 4. Set Environment Variables

Update your `.env` file:

```env
PUBLIC_SUPABASE_URL=https://kklojkexldqbqlfzsfsj.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing the Setup

### 1. Test Authentication

```typescript
// Test user registration
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})
```

### 2. Test Database Queries

```typescript
// Test listings query
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .limit(10)
```

### 3. Test Storage Upload

```typescript
// Test avatar upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.jpg`, file)
```

## 📊 Generate TypeScript Types

Once your database is set up, generate fresh types:

```bash
npx supabase gen types typescript --project-id=kklojkexldqbqlfzsfsj > src/lib/types/database.types.ts
```

## 🔍 Verification Checklist

- [ ] All 25+ tables created successfully
- [ ] RLS policies enabled on all tables
- [ ] All RPC functions created without errors
- [ ] Indexes created (check query performance)
- [ ] Storage buckets created with correct policies
- [ ] Initial data inserted (categories, brands, coupons)
- [ ] Admin user created successfully
- [ ] Authentication flows working
- [ ] TypeScript types generated and imported

## 🛠️ Maintenance

### Daily Cleanup (Optional)

Set up a cron job or run manually:

```sql
SELECT public.cleanup_expired_data();
```

This cleans up:
- Old rate limit entries
- Expired shopping carts  
- Old auth events (90+ days)

### Performance Monitoring

Monitor these key metrics:
- Query performance in Supabase dashboard
- Storage usage and costs
- Authentication success rates
- User activity patterns

## 🚨 Troubleshooting

### Common Issues

1. **"Function already exists" errors**
   - Run `DROP FUNCTION IF EXISTS function_name CASCADE;` first

2. **"Table already exists" errors**
   - Use `CREATE TABLE IF NOT EXISTS` (already included)

3. **RLS policy conflicts**
   - Drop existing policies first: `DROP POLICY IF EXISTS policy_name ON table_name;`

4. **Missing extensions**
   - Ensure all extensions are enabled in Supabase dashboard

5. **Storage bucket creation fails**
   - Check you have proper permissions in Supabase dashboard

### Getting Help

1. Check Supabase logs in dashboard
2. Verify all migrations ran completely
3. Test each component individually
4. Check TypeScript errors in your app

## 🎉 Success!

If all steps completed successfully, your Driplo marketplace database is now production-ready with:

- ✅ Complete user management system
- ✅ Product listings with full search
- ✅ Order processing and payments
- ✅ Real-time messaging system
- ✅ Rating and review system
- ✅ Brand verification system
- ✅ Admin tools and analytics
- ✅ Comprehensive security policies
- ✅ Optimized performance indexes
- ✅ File storage for images/documents

Time to start building your marketplace! 🚀