# Supabase Email Configuration Fix

## The Problem
You're using `w3bsuki@gmail.com` as the sender email in Supabase SMTP settings, which won't work because:
1. Gmail addresses can't send emails on behalf of other domains (driplo.com)
2. Email providers will reject these emails as spam/spoofing

## Solution Options

### Option 1: Configure Supabase to Use Resend (Recommended)

Since you already have Resend set up for transactional emails, configure Supabase to use the same service:

1. **In Supabase Dashboard:**
   - Go to Authentication → Settings → Email Templates
   - Enable "Custom SMTP"
   - Use these settings:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Your Resend API Key]
     Sender email: noreply@driplo.com
     Sender name: Driplo
     ```

2. **Important**: Make sure your Resend account has verified the `driplo.com` domain.

### Option 2: Use Custom Email Handler (Already Implemented)

I've already implemented a custom email confirmation handler that bypasses Supabase's email system:

1. **What I've done:**
   - Created `/api/auth/send-confirmation` endpoint that uses Resend
   - Modified the signup process to automatically send confirmation emails via Resend
   - Added proper email templates with your branding

2. **This solution:**
   - Works immediately without changing Supabase settings
   - Uses your existing Resend setup
   - Provides better email templates
   - Ensures consistent branding

### Option 3: Disable Email Confirmations (Temporary)

If you need to test immediately:

1. **In Supabase Dashboard:**
   - Go to Authentication → Settings
   - Disable "Enable email confirmations"
   - Save changes

2. **Warning**: This is not recommended for production as it allows unverified emails to sign up.

## What Happens Now

With the code I've implemented:

1. When a user signs up, Supabase creates the account
2. If email confirmation is required, our custom handler sends the email via Resend
3. The email contains a proper confirmation link that works with Supabase
4. Users receive a well-designed email from `noreply@driplo.com`

## Testing

To test the email confirmation:

1. Try signing up with a new email address
2. Check the console logs for any errors
3. The email should arrive from `noreply@driplo.com` via Resend
4. Click the confirmation link to verify it works

## Production Deployment

Before deploying to production:

1. Ensure `RESEND_API_KEY` is set in your production environment
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (needed for generating confirmation links)
3. Update `PUBLIC_APP_URL` to your production domain
4. Test with a real email address

## Domain Verification

For best deliverability:

1. **In Resend Dashboard:**
   - Add and verify `driplo.com` domain
   - Add SPF records: `v=spf1 include:amazonses.com ~all`
   - Add DKIM records provided by Resend
   - Add DMARC record: `v=DMARC1; p=none; rua=mailto:postmaster@driplo.com`

2. **In your DNS provider:**
   - Add all the DNS records Resend provides
   - Wait for verification (usually 24-48 hours)

## Monitoring

To monitor email delivery:

1. Check Resend dashboard for delivery stats
2. Monitor your application logs for email errors
3. Set up alerts for failed email sends
4. Track confirmation rates in Supabase Auth dashboard

## Support

If emails still aren't being delivered:

1. Check spam/junk folders
2. Verify DNS records are properly configured
3. Check Resend API key is valid and has sufficient credits
4. Review application logs for specific error messages
5. Contact Resend support if delivery issues persist