# Supabase Email Template Configuration

## IMPORTANT: You MUST configure these settings in your Supabase Dashboard

### 1. Go to Supabase Dashboard → Authentication → Email Templates

### 2. Update the "Confirm Signup" template:

**Subject:**
```
Confirm your Driplo account
```

**Email Body:**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your account:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a></p>

<p>If you didn't create an account, you can safely ignore this email.</p>
```

### 3. Update Authentication Settings:

Go to **Authentication → URL Configuration** and set:

- **Site URL**: `https://driplo.bg` (or your production URL)
- **Redirect URLs** (add these):
  - `https://driplo.bg/auth/confirm`
  - `https://driplo.bg/auth/callback`
  - `https://driplo.bg/onboarding`
  - `http://localhost:5173/auth/confirm` (for local dev)
  - `http://localhost:5173/auth/callback` (for local dev)
  - `http://localhost:5173/onboarding` (for local dev)

### 4. Email Settings:

Go to **Authentication → Email Settings** and ensure:

- **Enable Email Confirmations**: ✅ ON
- **Secure Email Change**: ✅ ON
- **Confirmation Expiry**: 86400 (24 hours)

### 5. SMTP Configuration (if using custom SMTP):

If you're using custom SMTP instead of Supabase's default email service:

```
SMTP Host: your-smtp-host.com
SMTP Port: 587
SMTP User: your-smtp-user
SMTP Pass: your-smtp-password
Sender Email: noreply@driplo.bg
Sender Name: Driplo
```

## How the Flow Works:

1. **User registers** → Supabase sends confirmation email
2. **User clicks link** → Goes to `/auth/confirm` with token
3. **Token verified** → Server checks if user needs onboarding
4. **New user** → Redirected to `/onboarding?new=true`
5. **Existing user** → Redirected to home page `/`

## Testing the Flow:

1. Register a new account
2. Check email for confirmation link
3. Click the link
4. Should be redirected to `/onboarding` automatically
5. Complete onboarding
6. Future logins should go to home page

## Troubleshooting:

### "Network Error" on onboarding:
- Check browser console for actual error
- Ensure server actions are working
- Check Supabase logs for database errors

### User not redirected to onboarding:
- Check if profile exists in database
- Verify `onboarding_completed` is false/null
- Check `username` field is empty

### Email not received:
- Check spam folder
- Verify SMTP settings in Supabase
- Check Supabase email logs

### Token expired error:
- User took too long to confirm
- Have them register again
- Consider increasing expiry time

## Important Notes:

- **NEVER** create username before onboarding
- **ALWAYS** check profile completion status
- **ENSURE** redirect URLs are whitelisted in Supabase
- **TEST** both personal and brand account flows