# Admin Setup Guide

## Overview
The admin dashboard is protected by role-based access control. Only users with the `admin` role can access the dashboard at `/dashboard`.

## Setting Up Admin Accounts

### Method 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to the "Table Editor" section
3. Select the `profiles` table
4. Find the user you want to make an admin
5. Click on their row to edit
6. Change the `role` field from `user` to `admin`
7. Save the changes

### Method 2: Using SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to the "SQL Editor" section
3. Run the following query, replacing the email with your admin's email:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'your-admin@example.com'
);
```

### Method 3: Using the Setup Script

1. Open `/scripts/setup-admin.sql`
2. Add your admin email addresses to the list
3. Copy the entire script
4. Paste and run it in your Supabase SQL Editor

## Verifying Admin Access

After setting up admin accounts:

1. Log in with the admin account
2. Navigate to `/dashboard`
3. You should see the admin dashboard

If you see "Access Denied", verify that:
- The user is logged in
- The `role` field in the `profiles` table is set to `admin`
- The profile exists for the user

## Admin Capabilities

Admins can:
- View platform statistics
- Review and approve brand verification requests
- Manage users (coming soon)
- View reports and moderate content
- Access detailed analytics

## Security Notes

- Admin role is stored in the database, not in JWT tokens
- Role checks happen server-side for security
- All admin actions are logged in the `admin_approvals` table
- The dashboard route is protected at the layout level

## Managing Admin Roles

### Promoting a User to Admin
```sql
UPDATE profiles SET role = 'admin' WHERE username = 'username-here';
```

### Demoting an Admin to Regular User
```sql
UPDATE profiles SET role = 'user' WHERE username = 'username-here';
```

### Viewing All Admins
```sql
SELECT 
    p.id,
    p.username,
    p.full_name,
    u.email,
    p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at;
```

## Troubleshooting

### "Access Denied" Error
- Ensure the user's profile has `role = 'admin'`
- Check that the user is properly authenticated
- Clear browser cache and cookies if needed

### Profile Not Found
- Make sure the user has completed profile setup
- Check that a profile record exists in the `profiles` table

### Role Not Updating
- Ensure you're updating the correct user ID
- Check for any RLS policies blocking the update
- Try using the Supabase dashboard directly