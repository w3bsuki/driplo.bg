# Sentry Setup Guide for driplo.bg

## Choose SvelteKit in Sentry

When creating a new project in Sentry, choose **SvelteKit** (not just Svelte). This gives you:
- Server-side error tracking
- Client-side error tracking
- Performance monitoring
- Session replay

## Setup Steps

### 1. Create a SvelteKit Project in Sentry

1. Go to [sentry.io](https://sentry.io) and create a new project
2. Select **SvelteKit** as the platform
3. Follow the setup wizard

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Sentry Configuration
VITE_PUBLIC_SENTRY_DSN=your_dsn_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: For source maps upload
SENTRY_URL=https://sentry.io
```

### 3. Features We've Configured

#### Error Tracking
- **Client-side errors**: JavaScript errors, unhandled promise rejections
- **Server-side errors**: API errors, database errors, authentication issues
- **Form submission errors**: Track when users encounter issues

#### Performance Monitoring
- Page load times
- API response times
- Database query performance (10% sample rate)

#### Session Replay
- Records user sessions when errors occur
- Helps debug exactly what users were doing
- Privacy-safe (masks sensitive content)

#### Smart Filtering
We filter out:
- ResizeObserver errors (harmless browser quirk)
- Expected network errors
- Development/localhost errors
- Authentication errors (expected flow)

### 4. Testing in Production

Once deployed:
1. Errors will automatically appear in your Sentry dashboard
2. You'll see:
   - Error message and stack trace
   - User information (if logged in)
   - Browser/device info
   - What the user was doing (session replay)
   - Performance metrics

### 5. What You'll See

In the Sentry dashboard:
- **Issues**: Grouped errors with occurrence count
- **Performance**: Page load times, slow queries
- **Replays**: Video-like playback of user sessions
- **User Feedback**: When users report issues

### 6. Monitoring Auth Issues

Perfect for your friend's signup/signin errors:
- Track failed login attempts
- Monitor signup flow completion
- See exact error messages users encounter
- Identify browser-specific issues

### 7. Alerts (Optional)

Set up alerts for:
- New errors
- Error rate spikes
- Performance degradation
- Failed transactions

## Vercel Deployment

Add these environment variables in Vercel:
1. Go to your project settings
2. Add environment variables
3. Redeploy

The integration will automatically:
- Upload source maps for better error details
- Track deployments
- Link errors to specific releases