# Vercel Environment Setup

## Required Environment Variables for Vercel

Add these to your Vercel project settings (Settings → Environment Variables):

### 1. Supabase Configuration
```
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. App Configuration
```
PUBLIC_APP_URL=https://driplo-bg.vercel.app
NODE_ENV=production
```

### 3. reCAPTCHA (if using)
```
PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 4. Stripe (if using)
```
PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Supabase Dashboard Configuration

In your Supabase project dashboard (Authentication → URL Configuration):

### Site URL
```
https://driplo-bg.vercel.app
```

### Redirect URLs
Add all of these:
```
https://driplo-bg.vercel.app/auth/callback
https://driplo-bg.vercel.app/login
https://driplo-bg.vercel.app/
http://localhost:5190/auth/callback
http://localhost:5190/login
http://localhost:5190/
```

### Email Templates
Update the confirmation URL in email templates to:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Vercel Configuration

1. **Build Command**: Leave as default (`npm run build` or `pnpm build`)
2. **Output Directory**: Leave as default (`.svelte-kit`)
3. **Install Command**: `pnpm install`
4. **Node Version**: 20.x

## Testing Authentication

After deploying with these settings:

1. Clear all cookies for your domain
2. Try logging in with a test account
3. Check browser DevTools → Application → Cookies to verify cookies are set
4. The cookies should have:
   - Domain: `driplo-bg.vercel.app` (or just the hostname)
   - Path: `/`
   - Secure: `true`
   - HttpOnly: `true`
   - SameSite: `Lax`

## Troubleshooting

If auth still doesn't persist:

1. **Check Supabase Logs**: Dashboard → Logs → Auth
2. **Verify Cookies**: Browser DevTools → Network → Check Set-Cookie headers
3. **Check Console**: Look for any CORS or cookie warnings
4. **Verify Environment**: Make sure all env vars are set in Vercel