# Create Admin User Instructions

Since direct database creation is having password issues, use the Supabase Dashboard:

## Method 1: Using Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard/project/cadczfmshtseuejkfpiz/auth/users
2. Click "Invite User" button
3. Enter:
   - Email: `w3bsuki@gmail.com`
4. Click "Send Invitation"
5. Check your email for the invite link
6. Set password to: `12345678`
7. After confirming, go to Table Editor > profiles
8. Find the user and update:
   - `role` = `admin`
   - `is_admin` = `true`
   - `setup_completed` = `true`

## Method 2: Using Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/cadczfmshtseuejkfpiz/sql/new
2. Run this SQL:

```sql
-- Delete any existing user
DELETE FROM auth.users WHERE email = 'w3bsuki@gmail.com';

-- Use Supabase's auth functions to create user properly
SELECT auth.uid(); -- Just to test connection
```

3. Then use the Dashboard method above to create the user

## Method 3: Create a different admin user

If w3bsuki@gmail.com continues to have issues, create a new admin:
- Email: `admin@driplo.com`
- Password: `admin123456`

The issue is that Supabase uses specific password hashing that must be done through their Auth service, not direct SQL.