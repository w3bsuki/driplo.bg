# Supabase Migration Instructions

## Overview
You need to run 3 SQL migrations in your Supabase SQL Editor to enable brand authentication, admin dashboards, and onboarding features.

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor (usually in the left sidebar)
3. Click "New Query" to open a new SQL editor tab

### 2. Run Migrations in Order

#### Migration 1: Profile Setup & Brand Verification
**File**: `supabase/migrations/20250121_profile_setup_and_brand_verification.sql`

1. Copy the entire contents of this file
2. Paste into the SQL editor
3. Click "Run" or press Ctrl+Enter
4. You should see "Success" message

This migration creates:
- Profile setup tracking fields
- `profile_setup_progress` table
- `brand_verification_requests` table
- `social_media_accounts` table
- `admin_approvals` table
- Various RLS policies and functions

#### Migration 2: Admin Roles Setup
**File**: `supabase/migrations/20250121_setup_admin_roles.sql`

1. In a new query tab, copy the entire contents of this file
2. Paste into the SQL editor
3. Click "Run" or press Ctrl+Enter
4. You should see "Success" message

This migration creates:
- User role enum (user, admin, moderator)
- Adds role column to profiles table
- Creates admin promotion functions

#### Migration 3: Make w3bsuki Admin
**File**: `scripts/make-w3bsuki-admin.sql`

1. In a new query tab, copy the entire contents of this file
2. Paste into the SQL editor
3. Click "Run" or press Ctrl+Enter
4. You should see the verification query results showing w3bsuki as admin

### 3. Verify Migration Success

Run this query to verify all tables were created:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profile_setup_progress',
    'brand_verification_requests', 
    'social_media_accounts',
    'admin_approvals'
);

-- Check if profile columns were added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
    'setup_completed',
    'avatar_style',
    'role',
    'brand_size'
);

-- Verify w3bsuki is admin
SELECT id, email, username, role
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE email = 'w3bsuki@gmail.com';
```

### 4. Generate Updated TypeScript Types

After running all migrations, generate new TypeScript types:

1. In your terminal, run:
```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/types/supabase.ts
```

Or use the Supabase MCP tool if available.

### 5. Test the Features

1. **Onboarding Flow**: Navigate to `/onboarding` - should show the profile setup wizard
2. **Admin Dashboard**: Login as w3bsuki@gmail.com with password 1234567, then go to `/dashboard`
3. **Brand Approvals**: Check `/dashboard/brands` for the brand approval queue

## Troubleshooting

### If migrations fail:
1. Check for syntax errors in the SQL
2. Ensure you're running them in the correct order
3. Check if you have sufficient permissions (you need to be the project owner)

### If features don't work after migration:
1. Clear your browser cache
2. Restart your development server
3. Check browser console for errors
4. Verify RLS policies are enabled on the tables

## What's Next

After successful migration:
1. Test user registration flow
2. Test brand account creation
3. Test admin approval workflow
4. Monitor for any RLS policy issues

## Important Notes

- These migrations modify the database schema permanently
- Always backup your database before running migrations in production
- The admin role system is now active - be careful who you grant admin access to
- Brand verification requires manual admin approval