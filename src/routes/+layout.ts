import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import type { LayoutLoad } from './$types'
import type { Database } from '$lib/types/database'

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
	depends('supabase:auth')
	depends('app:auth')
	
	// Check if we need to refresh auth (after login redirect)
	if (isBrowser() && url.searchParams.has('_refreshAuth')) {
		// Force dependencies to reload
		depends('supabase:auth')
		depends('app:auth')
	}
	
	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				auth: {
					persistSession: true,
					storageKey: 'supabase.auth.token',
					storage: window.localStorage,
					detectSessionInUrl: true,
					flowType: 'pkce'
				}
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: {
					getAll() {
						return data.cookies
					},
				},
			})

	// Always return server data to ensure consistency
	return {
		session: data.session,
		supabase,
		user: data.user,
		categories: data.categories || []
	}
}