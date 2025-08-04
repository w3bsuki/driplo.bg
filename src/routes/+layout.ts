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

	// Check if client already has a session first
	const { data: { session: existingSession } } = await supabase.auth.getSession();
	console.log('🔍 Existing client session check:', {
		hasSession: !!existingSession,
		userEmail: existingSession?.user?.email || 'none'
	});
	
	// Only set session if we don't have one but server does
	if (data.session && isBrowser && !existingSession) {
		console.log('🔄 Setting session on client with tokens:', {
			hasAccessToken: !!data.session.access_token,
			hasRefreshToken: !!data.session.refresh_token,
			expiresAt: data.session.expires_at,
			expiresIn: data.session.expires_in
		});
		
		try {
			// Use the full session object instead of just tokens
			const result = await supabase.auth.setSession(data.session);
			
			console.log('✅ Client setSession result:', {
				hasSession: !!result.data.session,
				hasUser: !!result.data.user,
				error: result.error?.message || 'none'
			});
			
			// Wait a bit for the session to be fully set
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// Verify the session was actually set
			const { data: { session: currentSession } } = await supabase.auth.getSession();
			console.log('🔍 Verification - Current client session:', {
				hasSession: !!currentSession,
				userEmail: currentSession?.user?.email || 'none',
				expiresAt: currentSession?.expires_at || 'none'
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
	
	// Test if we can actually query the database (move outside to ensure it runs)
	if (isBrowser && data.session) {
		console.log('🧪 Testing database connection with client...');
		try {
			const { data: testData, error: testError } = await supabase
				.from('profiles')
				.select('id')
				.limit(1);
			console.log('📊 Database test result:', {
				success: !testError,
				error: testError?.message || 'none',
				hasData: !!testData,
				recordCount: testData?.length || 0
			});
		} catch (e) {
			console.error('❌ Database test failed:', e);
		}
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