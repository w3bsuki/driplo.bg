import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export function createAdminClient() {
    const supabaseUrl = process.env['PUBLIC_SUPABASE_URL'];
    const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}