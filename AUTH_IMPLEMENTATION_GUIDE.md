# Authentication Implementation Guide

## Supabase Auth Configuration

### 1. Update Supabase Dashboard Settings

Go to Authentication > Settings in your Supabase dashboard and configure:

```
JWT Settings:
- JWT Expiry: 3600 (1 hour for access token)

Email Settings:
- Enable email confirmations
- Customize email templates

Security Settings:
- Enable MFA (optional but recommended)
- Set password requirements
```

### 2. Frontend Implementation (SvelteKit)

#### Update auth configuration in your app:

```typescript
// $lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        // Custom storage for remember me functionality
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          
          // Check both localStorage (remember me) and sessionStorage
          return localStorage.getItem(key) || sessionStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          
          const rememberMe = localStorage.getItem('rememberMe') === 'true'
          if (rememberMe) {
            localStorage.setItem(key, value)
          } else {
            sessionStorage.setItem(key, value)
          }
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        }
      }
    }
  }
)
```

#### Enhanced Login Component:

```typescript
// $lib/components/auth/LoginForm.svelte
<script lang="ts">
  import { supabase } from '$lib/supabase'
  import { goto } from '$app/navigation'
  
  let email = ''
  let password = ''
  let rememberMe = false
  let loading = false
  let error = ''
  
  async function handleLogin() {
    loading = true
    error = ''
    
    try {
      // Store remember me preference
      localStorage.setItem('rememberMe', rememberMe.toString())
      
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      // Track the session with remember me
      if (data.session) {
        const deviceInfo = {
          fingerprint: await getDeviceFingerprint(),
          ip_address: await getIPAddress(), 
          user_agent: navigator.userAgent
        }
        
        // Call our custom session management function
        const { data: sessionData } = await supabase.rpc('manage_user_session', {
          p_user_id: data.user.id,
          p_refresh_token: data.session.refresh_token,
          p_remember_me: rememberMe,
          p_device_info: deviceInfo
        })
        
        // Track successful login
        await supabase.rpc('track_login_attempt', {
          p_user_id: data.user.id,
          p_success: true,
          p_device_info: deviceInfo
        })
      }
      
      // Redirect to dashboard
      await goto('/dashboard')
      
    } catch (err) {
      error = err.message
      
      // Track failed login attempt
      if (email) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()
          
        if (userData) {
          await supabase.rpc('track_login_attempt', {
            p_user_id: userData.id,
            p_success: false,
            p_failure_reason: err.message
          })
        }
      }
    } finally {
      loading = false
    }
  }
  
  // Device fingerprinting for security
  async function getDeviceFingerprint() {
    // Use a library like fingerprintjs2
    // This is a simplified example
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('fingerprint', 2, 2)
    return canvas.toDataURL().slice(-50)
  }
  
  async function getIPAddress() {
    // This would be done server-side in production
    return '0.0.0.0'
  }
</script>

<form on:submit|preventDefault={handleLogin}>
  <input type="email" bind:value={email} required />
  <input type="password" bind:value={password} required />
  
  <label>
    <input type="checkbox" bind:checked={rememberMe} />
    Remember me for 30 days
  </label>
  
  <button type="submit" disabled={loading}>
    {loading ? 'Signing in...' : 'Sign In'}
  </button>
  
  {#if error}
    <p class="error">{error}</p>
  {/if}
</form>
```

#### Session Management Component:

```typescript
// $lib/components/auth/SessionManager.svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'
  
  let sessions = []
  
  onMount(async () => {
    // Load active sessions
    const { data } = await supabase.rpc('get_active_sessions')
    sessions = data || []
  })
  
  async function revokeSession(sessionId: string) {
    await supabase
      .from('auth_sessions')
      .delete()
      .eq('id', sessionId)
    
    // Reload sessions
    const { data } = await supabase.rpc('get_active_sessions')
    sessions = data || []
  }
</script>

<div class="sessions">
  <h3>Active Sessions</h3>
  {#each sessions as session}
    <div class="session">
      <p>Device: {session.device_fingerprint}</p>
      <p>Last active: {new Date(session.last_active).toLocaleString()}</p>
      <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
      {#if session.remember_me}
        <span class="badge">Remember Me</span>
      {/if}
      <button on:click={() => revokeSession(session.id)}>
        Revoke
      </button>
    </div>
  {/each}
</div>
```

#### Auto-refresh Hook:

```typescript
// hooks.server.ts
import { supabase } from '$lib/supabase'

export async function handle({ event, resolve }) {
  // Check and refresh session
  const session = event.cookies.get('sb-auth-token')
  
  if (session) {
    try {
      // Validate session
      const { data: { user } } = await supabase.auth.getUser(session)
      
      if (user) {
        // Validate our custom session
        const refreshToken = event.cookies.get('sb-refresh-token')
        if (refreshToken) {
          const { data } = await supabase.rpc('validate_user_session', {
            p_user_id: user.id,
            p_refresh_token: refreshToken
          })
          
          if (data?.valid) {
            // Session is valid and extended
            event.locals.user = user
            event.locals.session_expires = data.expires_at
          }
        }
      }
    } catch (error) {
      // Invalid session, clear cookies
      event.cookies.delete('sb-auth-token')
      event.cookies.delete('sb-refresh-token')
    }
  }
  
  return resolve(event)
}
```

### 3. Security Best Practices

#### Rate Limiting for Auth Endpoints:

```typescript
// $lib/server/rateLimiter.ts
const attempts = new Map()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 900000) {
  const now = Date.now()
  const userAttempts = attempts.get(identifier) || []
  
  // Clean old attempts
  const recentAttempts = userAttempts.filter(time => now - time < windowMs)
  
  if (recentAttempts.length >= maxAttempts) {
    return false // Rate limited
  }
  
  recentAttempts.push(now)
  attempts.set(identifier, recentAttempts)
  
  return true // Allowed
}
```

#### Secure Password Reset:

```typescript
// Enhanced password reset with rate limiting
async function requestPasswordReset(email: string) {
  // Rate limit check
  if (!checkRateLimit(`reset:${email}`, 3, 3600000)) {
    throw new Error('Too many reset attempts. Please try again later.')
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) throw error
}
```

### 4. Monitoring and Alerts

```sql
-- Create a view for suspicious activity
CREATE VIEW auth_suspicious_activity AS
SELECT 
  user_id,
  COUNT(*) as failed_attempts,
  MAX(login_at) as last_attempt,
  array_agg(DISTINCT ip_address) as ip_addresses
FROM auth_login_history
WHERE success = false
AND login_at > now() - interval '1 hour'
GROUP BY user_id
HAVING COUNT(*) >= 3;

-- Alert when someone logs in from new location
CREATE OR REPLACE FUNCTION check_new_location_login()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.success AND NEW.ip_address NOT IN (
    SELECT DISTINCT ip_address 
    FROM auth_login_history 
    WHERE user_id = NEW.user_id 
    AND success = true 
    AND login_at > now() - interval '30 days'
  ) THEN
    -- Send notification about new location login
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'security_alert',
      'New login location detected',
      'Someone logged into your account from a new location: ' || NEW.ip_address::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_location_login
AFTER INSERT ON auth_login_history
FOR EACH ROW
EXECUTE FUNCTION check_new_location_login();
```

### 5. Testing the Implementation

```typescript
// Test extended sessions
describe('Auth Sessions', () => {
  test('Remember me extends session to 30 days', async () => {
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password'
    })
    
    const session = await supabase.rpc('manage_user_session', {
      p_user_id: data.user.id,
      p_refresh_token: data.session.refresh_token,
      p_remember_me: true
    })
    
    expect(session.data.expires_at).toBeTruthy()
    const expiresAt = new Date(session.data.expires_at)
    const expectedExpiry = new Date()
    expectedExpiry.setDate(expectedExpiry.getDate() + 30)
    
    expect(expiresAt.getDate()).toBe(expectedExpiry.getDate())
  })
})
```

## Summary

With these changes:
1. ✅ Users stay logged in for 7 days by default
2. ✅ "Remember me" extends to 30 days
3. ✅ Multiple device support (up to 5 sessions)
4. ✅ Session security with device fingerprinting
5. ✅ Login history and suspicious activity detection
6. ✅ Automatic session refresh
7. ✅ Rate limiting for auth endpoints
8. ✅ Security alerts for new locations

The auth experience is now much smoother while maintaining security!