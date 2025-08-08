import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';
import { dev } from '$app/environment';

// Validate service role key format (basic validation)
function validateServiceRoleKey(key: string): boolean {
    // Service role keys are JWT tokens with specific structure
    return key.startsWith('eyJ') && key.length > 100 && key.split('.').length === 3;
}

export function createAdminClient() {
    const supabaseUrl = process.env['PUBLIC_SUPABASE_URL'];
    const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        // Don't expose which variable is missing in production
        const errorMsg = dev 
            ? `Missing Supabase environment variables: ${!supabaseUrl ? 'PUBLIC_SUPABASE_URL' : ''} ${!supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`
            : 'Server configuration error';
        throw new Error(errorMsg);
    }
    
    // Validate the service role key format
    if (!validateServiceRoleKey(supabaseServiceRoleKey)) {
        const errorMsg = dev 
            ? 'Invalid SUPABASE_SERVICE_ROLE_KEY format'
            : 'Server configuration error';
        throw new Error(errorMsg);
    }
    
    // Create client with additional security options
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        },
        global: {
            // Add request timeout for admin operations
            fetch: (url, options = {}) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
                return fetch(url, {
                    ...options,
                    signal: controller.signal
                }).finally(() => clearTimeout(timeoutId));
            }
        }
    });
}