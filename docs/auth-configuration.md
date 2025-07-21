# Supabase Auth Configuration Guide

## Security Settings to Configure

### 1. OTP Expiry Configuration
The current OTP expiry is set to more than an hour, which is a security risk. 

**Recommended Setting**: 10-30 minutes

**How to Configure**:
1. Go to Supabase Dashboard → Authentication → Providers → Email
2. Set "OTP Expiry Duration" to 1800 seconds (30 minutes)
3. Save changes

### 2. Leaked Password Protection
Enable HaveIBeenPwned integration to prevent compromised passwords.

**How to Enable**:
1. Go to Supabase Dashboard → Authentication → Security
2. Enable "Leaked Password Protection"
3. This will check passwords against known breaches

### 3. Additional Security Recommendations

#### Password Requirements
Configure minimum password requirements:
- Minimum length: 8 characters
- Require uppercase and lowercase
- Require numbers
- Require special characters

#### Rate Limiting
Configure rate limits to prevent brute force:
- Sign-up attempts: 5 per hour per IP
- Sign-in attempts: 10 per hour per IP
- Password reset: 3 per hour per email

#### Session Management
- Session timeout: 7 days (default)
- Refresh token rotation: Enabled
- Single session per user: Optional based on requirements

## Implementation in Code

### Environment Variables
Add to `.env`:
```bash
# Auth Configuration
AUTH_OTP_EXPIRY=1800 # 30 minutes in seconds
AUTH_PASSWORD_MIN_LENGTH=8
AUTH_REQUIRE_UPPERCASE=true
AUTH_REQUIRE_LOWERCASE=true
AUTH_REQUIRE_NUMBERS=true
AUTH_REQUIRE_SPECIAL_CHARS=true
```

### Client-Side Validation
```typescript
// src/lib/utils/auth-validation.ts
export const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`)
  }
  
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}
```

### Server-Side Configuration
```typescript
// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE flow for enhanced security
      }
    }
  })
  
  // Additional auth security headers
  const response = await resolve(event)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}
```

## Monitoring Auth Security

### Track Failed Login Attempts
```sql
-- Create table for tracking failed attempts
CREATE TABLE IF NOT EXISTS auth_failed_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  attempted_at timestamptz DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_auth_failed_attempts_email ON auth_failed_attempts(email, attempted_at);
CREATE INDEX idx_auth_failed_attempts_ip ON auth_failed_attempts(ip_address, attempted_at);
```

### Monitor Suspicious Activity
```sql
-- Find accounts with multiple failed login attempts
SELECT 
  email,
  COUNT(*) as failed_attempts,
  MIN(attempted_at) as first_attempt,
  MAX(attempted_at) as last_attempt
FROM auth_failed_attempts
WHERE attempted_at > now() - interval '1 hour'
GROUP BY email
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;
```

## Compliance Checklist

- [ ] OTP expiry set to 30 minutes or less
- [ ] Leaked password protection enabled
- [ ] Password complexity requirements configured
- [ ] Rate limiting enabled for auth endpoints
- [ ] Session management configured appropriately
- [ ] Auth monitoring in place
- [ ] PKCE flow enabled for web applications
- [ ] Security headers configured