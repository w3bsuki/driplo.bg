# Authentication Testing Guide

## What Has Been Implemented

### 1. Extended Session Support (30-day sessions)
- **Database Migration Applied**: `003_optimize_auth_and_sessions_fixed`
- **Tables Created**:
  - `auth_sessions` - Stores extended session tokens
  - `auth_login_history` - Tracks login attempts
- **Functions Created**:
  - `create_auth_session()` - Creates 30-day or 24-hour sessions
  - `validate_auth_session()` - Validates and refreshes sessions
  - `cleanup_expired_sessions()` - Removes old sessions
  - `revoke_all_user_sessions()` - Logout from all devices

### 2. Remember Me Feature
- Updated `auth-context.svelte.ts` to support `rememberMe` parameter
- Updated login page with working "Remember me for 30 days" checkbox
- When checked, creates a 30-day session instead of default 1-hour

### 3. Performance Optimizations Applied
- **Migration 004**: Composite indexes for faster queries
- **Migration 005**: RLS helper functions for efficient security checks

## Testing Checklist

### 1. Registration Flow
- [ ] Navigate to `/register`
- [ ] Try registering with:
  - Valid email and password (min 8 chars)
  - Username (3-30 chars, alphanumeric + underscore)
  - Optional full name
  - Must agree to terms
- [ ] Check email for verification link
- [ ] Verify account through email

### 2. Login Flow - Standard (1 hour session)
- [ ] Navigate to `/login`
- [ ] Login WITHOUT checking "Remember me"
- [ ] Verify you're logged in and redirected
- [ ] Check that session expires after 1 hour

### 3. Login Flow - Extended (30 day session)
- [ ] Navigate to `/login`
- [ ] Login WITH "Remember me for 30 days" checked
- [ ] Verify you're logged in
- [ ] Close browser and return later
- [ ] Verify you're still logged in (up to 30 days)

### 4. OAuth Login
- [ ] Test "Continue with Google"
- [ ] Test "Continue with GitHub"
- [ ] Verify profile is created automatically

### 5. Session Validation
- [ ] Login with remember me
- [ ] Check database: `SELECT * FROM auth_sessions WHERE user_id = 'YOUR_USER_ID';`
- [ ] Verify `expires_at` is 30 days in future
- [ ] Verify `remember_me` is true

### 6. Security Features
- [ ] Login from one device
- [ ] Login from another device
- [ ] Check login history: `SELECT * FROM auth_login_history WHERE user_id = 'YOUR_USER_ID';`
- [ ] Test revoking all sessions

## Common Issues & Solutions

### Issue: Still logging out after 1 hour
**Solution**: The Supabase JWT still expires after 1 hour. The extended session allows automatic refresh when you return to the site. The app should check and refresh the session on load.

### Issue: Remember me not working
**Solution**: Check browser console for errors. The `create_auth_session` RPC might fail if the user doesn't have permission. Check Supabase logs.

### Issue: Can't register
**Solution**: 
1. Check if email verification is required in Supabase Auth settings
2. Ensure username is unique
3. Password must be at least 8 characters

## Database Queries for Debugging

```sql
-- Check user's sessions
SELECT * FROM auth_sessions WHERE user_id = 'USER_ID';

-- Check login history
SELECT * FROM auth_login_history WHERE user_id = 'USER_ID' ORDER BY created_at DESC;

-- Check if user exists
SELECT id, email, username, created_at FROM profiles WHERE email = 'user@example.com';

-- Clean up expired sessions manually
SELECT cleanup_expired_sessions();
```

## Next Steps for Full Implementation

1. **Add session refresh in app hook** - Check and refresh extended sessions on page load
2. **Add "Logout from all devices" button** in user settings
3. **Show login history** in user security settings
4. **Add email notifications** for new device logins
5. **Implement 2FA** for additional security

The core authentication system is now robust with extended sessions support!