import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createBrowserClient } from '@supabase/ssr'
import type { LayoutLoad } from './$types'
import type { Database } from '$lib/types/database.types'

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth')
	depends('app:auth')
	
	const isBrowser = typeof window !== 'undefined';
	console.log('🔍 Layout load - Environment check:', {
		isBrowser,
		hasWindow: typeof window !== 'undefined',
		hasSession: !!data.session,
		userEmail: data.user?.email || 'none',
		supabaseUrl: PUBLIC_SUPABASE_URL,
		hasAnonKey: !!PUBLIC_SUPABASE_ANON_KEY
	});

	// Create browser client for client-side operations
	// Browser client doesn't need cookie handlers - it accesses cookies directly
	const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch,
		},
		auth: {
			persistSession: true,
			detectSessionInUrl: true,
			flowType: 'pkce'
		}
	})

	// Set the session on the client if we have server session data
	// This ensures the client-side Supabase client has the same session as server
	// Only do this in the actual browser, not during SSR
	if (data.session && isBrowser) {
		console.log('🔄 Setting session on client with tokens:', {
			hasAccessToken: !!data.session.access_token,
			hasRefreshToken: !!data.session.refresh_token,
			expiresAt: data.session.expires_at
		});
		
		try {
			const result = await supabase.auth.setSession({
				access_token: data.session.access_token,
				refresh_token: data.session.refresh_token
			})
			
			console.log('✅ Client setSession result:', {
				hasSession: !!result.data.session,
				hasUser: !!result.data.user,
				error: result.error?.message || 'none'
			});
			
			// Verify the session was actually set
			const { data: { session: currentSession } } = await supabase.auth.getSession();
			console.log('🔍 Verification - Current client session:', {
				hasSession: !!currentSession,
				userEmail: currentSession?.user?.email || 'none'
			});
			
			// Test if we can actually query the database
			console.log('🧪 Testing database connection...');
			try {
				const { data: testData, error: testError } = await supabase
					.from('profiles')
					.select('id')
					.limit(1);
				console.log('📊 Database test result:', {
					success: !testError,
					error: testError?.message || 'none',
					hasData: !!testData
				});
			} catch (e) {
				console.error('❌ Database test failed:', e);
			}
		} catch (error) {
			console.error('❌ Failed to set session on client:', error)
		}
	} else {
		console.log('⚠️ Skipping session set:', {
			hasSession: !!data.session,
			isBrowser,
			hasWindow: typeof window !== 'undefined'
		});
	}

	// Always use the data passed from the server layout
	// The server has already validated the session
	return {
		session: data.session,
		supabase,
		user: data.user,
		categories: data.categories || []
	}
}