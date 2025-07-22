# Production Authentication Implementation Guide
*Priority-based implementation plan for Driplo marketplace*

## 🚨 Critical Issues (Fix Before Launch)

### 1. Password Reset System Implementation

#### Create Password Reset Routes

**Step 1: Create Forgot Password Page**
```bash
mkdir -p src/routes/(auth)/forgot-password
```

<augment_code_snippet path="src/routes/(auth)/forgot-password/+page.svelte" mode="EXCERPT">
````svelte
<script lang="ts">
    import { getAuthContext } from '$lib/stores/auth-context.svelte'
    import { toast } from 'svelte-sonner'
    import { Button, Input } from '$lib/components/ui'
    
    let email = ''
    let loading = false
    let sent = false
    
    async function handleForgotPassword() {
        if (!email) {
            toast.error('Please enter your email address')
            return
        }
        
        loading = true
        try {
            const auth = getAuthContext()
            const { error } = await auth.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })
            
            if (error) throw error
            
            sent = true
            toast.success('Password reset email sent!')
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email')
        } finally {
            loading = false
        }
    }
</script>

{#if sent}
    <div class="text-center">
        <h2>Check your email</h2>
        <p>We've sent a password reset link to {email}</p>
    </div>
{:else}
    <form on:submit|preventDefault={handleForgotPassword}>
        <Input bind:value={email} type="email" placeholder="Enter your email" required />
        <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
        </Button>
    </form>
{/if}
````
</augment_code_snippet>

**Step 2: Create Reset Password Page**
```bash
mkdir -p src/routes/(auth)/reset-password
```

<augment_code_snippet path="src/routes/(auth)/reset-password/+page.svelte" mode="EXCERPT">
````svelte
<script lang="ts">
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { getAuthContext } from '$lib/stores/auth-context.svelte'
    import { toast } from 'svelte-sonner'
    import { Button, Input } from '$lib/components/ui'
    import { onMount } from 'svelte'
    
    let password = ''
    let confirmPassword = ''
    let loading = false
    
    onMount(() => {
        // Check if we have the reset token
        const accessToken = $page.url.searchParams.get('access_token')
        const refreshToken = $page.url.searchParams.get('refresh_token')
        
        if (!accessToken || !refreshToken) {
            toast.error('Invalid reset link')
            goto('/login')
        }
    })
    
    async function handleResetPassword() {
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        
        loading = true
        try {
            const auth = getAuthContext()
            const { error } = await auth.supabase.auth.updateUser({
                password: password
            })
            
            if (error) throw error
            
            toast.success('Password updated successfully!')
            goto('/login')
        } catch (error) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            loading = false
        }
    }
</script>

<form on:submit|preventDefault={handleResetPassword}>
    <Input bind:value={password} type="password" placeholder="New password" required />
    <Input bind:value={confirmPassword} type="password" placeholder="Confirm password" required />
    <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
    </Button>
</form>
````
</augment_code_snippet>

### 2. Supabase Dashboard Configuration

#### Authentication Settings
1. **Go to Authentication > Settings > Email Auth**
   - Set OTP expiry: `900` seconds (15 minutes)
   - Enable "Secure email change (requires confirmation on both emails)"
   - Set confirmation expiry: `86400` seconds (24 hours)

2. **Go to Authentication > Settings > Security**
   - ✅ Enable "Check passwords against HaveIBeenPwned"
   - Set password requirements if needed

3. **Go to Authentication > Providers**
   - Update Google OAuth redirect URL: `https://yourdomain.com/callback`
   - Update GitHub OAuth redirect URL: `https://yourdomain.com/callback`

4. **Go to Settings > API > CORS**
   - Add production domains:
     ```
     https://yourdomain.com
     https://www.yourdomain.com
     ```

### 3. Production Email Configuration

#### Option A: SendGrid Setup
```env
# Add to .env
SENDGRID_API_KEY=your_sendgrid_api_key
```

**Configure in Supabase Dashboard:**
1. Go to Settings > Email
2. Configure SMTP:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `[Your SendGrid API Key]`
   - Sender email: `noreply@yourdomain.com`
   - Sender name: `Driplo`

#### Option B: Resend Setup
```env
# Add to .env
RESEND_API_KEY=your_resend_api_key
```

**Configure in Supabase Dashboard:**
1. Go to Settings > Email
2. Configure SMTP:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: `[Your Resend API Key]`
   - Sender email: `noreply@yourdomain.com`
   - Sender name: `Driplo`

---

## ⚠️ High Priority (Week 1 After Launch)

### 1. Security Headers Implementation

**Create Security Headers Middleware**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'

const securityHeaders = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "img-src 'self' data: https: blob:",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-src https://js.stripe.com"
    ].join('; '),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event)
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    
    return response
}
```

### 2. Enhanced Session Security

**Create Session Cleanup Job**
```sql
-- Add to a new migration
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_sessions 
    WHERE expires_at < NOW();
    
    DELETE FROM auth_login_history 
    WHERE login_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
```

**Add Session Limits**
```sql
-- Add session limits migration
ALTER TABLE auth_sessions 
ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 5;

CREATE OR REPLACE FUNCTION enforce_session_limits()
RETURNS TRIGGER AS $$
BEGIN
    -- Count existing sessions for user
    IF (SELECT COUNT(*) FROM auth_sessions WHERE user_id = NEW.user_id) >= 5 THEN
        -- Delete oldest session
        DELETE FROM auth_sessions 
        WHERE user_id = NEW.user_id 
        AND id = (
            SELECT id FROM auth_sessions 
            WHERE user_id = NEW.user_id 
            ORDER BY last_active ASC 
            LIMIT 1
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_session_limits_trigger
    BEFORE INSERT ON auth_sessions
    FOR EACH ROW
    EXECUTE FUNCTION enforce_session_limits();
```

### 3. Upload Security Enhancements

**Add Rate Limiting**
```typescript
// src/lib/security/rate-limiter.ts
const uploadLimits = new Map<string, { count: number; resetTime: number }>()

export function checkUploadRate(userId: string, maxUploads = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const userLimit = uploadLimits.get(userId)
    
    if (!userLimit || now > userLimit.resetTime) {
        uploadLimits.set(userId, { count: 1, resetTime: now + windowMs })
        return true
    }
    
    if (userLimit.count >= maxUploads) {
        return false
    }
    
    userLimit.count++
    return true
}
```

**Enhanced File Validation**
```typescript
// src/lib/security/file-validator.ts
export function validateImageFile(file: File): string | null {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        return 'File too large (max 5MB)'
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        return 'Invalid file type'
    }
    
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    if (!extension || !allowedExtensions.includes(extension)) {
        return 'Invalid file extension'
    }
    
    return null
}
```

---

## 📊 Medium Priority (Month 1)

### 1. Authentication Monitoring

**Create Auth Events Tracking**
```sql
CREATE TABLE auth_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    risk_score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_security_events_user_id ON auth_security_events(user_id);
CREATE INDEX idx_auth_security_events_type ON auth_security_events(event_type);
CREATE INDEX idx_auth_security_events_created_at ON auth_security_events(created_at);
```

**Implement Suspicious Activity Detection**
```typescript
// src/lib/security/activity-monitor.ts
export async function trackAuthEvent(
    supabase: SupabaseClient,
    userId: string,
    eventType: string,
    metadata: Record<string, any> = {}
) {
    const { error } = await supabase
        .from('auth_security_events')
        .insert({
            user_id: userId,
            event_type: eventType,
            ip_address: metadata.ip,
            user_agent: metadata.userAgent,
            metadata
        })
    
    if (error) {
        console.error('Failed to track auth event:', error)
    }
}

export async function checkSuspiciousActivity(
    supabase: SupabaseClient,
    userId: string
): Promise<boolean> {
    // Check for multiple failed logins
    const { data: failedLogins } = await supabase
        .from('auth_security_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'failed_login')
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    
    return (failedLogins?.length || 0) >= 5
}
```

### 2. Advanced Session Management

**Add Device Management**
```typescript
// src/lib/components/auth/SessionManager.svelte
<script lang="ts">
    import { getAuthContext } from '$lib/stores/auth-context.svelte'
    import { onMount } from 'svelte'
    
    let sessions: any[] = []
    const auth = getAuthContext()
    
    onMount(async () => {
        await loadSessions()
    })
    
    async function loadSessions() {
        const { data } = await auth.supabase
            .from('auth_sessions')
            .select('*')
            .eq('user_id', auth.user?.id)
            .order('last_active', { ascending: false })
        
        sessions = data || []
    }
    
    async function revokeSession(sessionId: string) {
        const { error } = await auth.supabase
            .from('auth_sessions')
            .delete()
            .eq('id', sessionId)
        
        if (!error) {
            await loadSessions()
        }
    }
</script>

<div class="space-y-4">
    <h3>Active Sessions</h3>
    {#each sessions as session}
        <div class="border rounded p-4">
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-medium">
                        {session.user_agent?.includes('Mobile') ? '📱' : '💻'}
                        {session.user_agent}
                    </p>
                    <p class="text-sm text-gray-600">
                        Last active: {new Date(session.last_active).toLocaleString()}
                    </p>
                    <p class="text-sm text-gray-600">
                        IP: {session.ip_address}
                    </p>
                </div>
                <button 
                    onclick={() => revokeSession(session.id)}
                    class="text-red-600 hover:text-red-800"
                >
                    Revoke
                </button>
            </div>
        </div>
    {/each}
</div>
```

---

## 🔧 Implementation Timeline

### Week 1 (Critical)
- [ ] Day 1: Implement password reset system
- [ ] Day 2: Configure Supabase security settings
- [ ] Day 3: Set up production email
- [ ] Day 4: Add security headers
- [ ] Day 5: Test all authentication flows

### Week 2-4 (High Priority)
- [ ] Week 2: Implement session security enhancements
- [ ] Week 3: Add upload security and rate limiting
- [ ] Week 4: Set up monitoring and alerting

### Month 2 (Medium Priority)
- [ ] Advanced session management UI
- [ ] Suspicious activity detection
- [ ] Enhanced logging and analytics
- [ ] Performance optimizations

---

## 🧪 Testing Checklist

### Authentication Flow Testing
- [ ] User registration (email + OAuth)
- [ ] Email verification
- [ ] Login (email + OAuth)
- [ ] Password reset flow
- [ ] Session persistence
- [ ] Remember me functionality
- [ ] Logout and session cleanup

### Security Testing
- [ ] RLS policy enforcement
- [ ] File upload restrictions
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Security headers
- [ ] Session limits

### Production Environment Testing
- [ ] Email delivery
- [ ] OAuth redirects
- [ ] Database connections
- [ ] Error handling
- [ ] Performance under load
