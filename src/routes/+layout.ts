import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createBrowserClient } from '@supabase/ssr'
import type { LayoutLoad } from './$types'
import type { Database } from '$lib/types/database'

export const load: LayoutLoad = async ({ data, depends }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth')

	const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

	// On the server, we already have validated session/user from layout.server.ts
	// On the client, we'll use the data passed from the server
	if (data?.session && data?.user) {
		return { 
			session: data.session, 
			supabase, 
			user: data.user,
			categories: data.categories || []
		}
	}

	// Fallback: validate the session properly
	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (!session) {
		return { session: null, supabase, user: null, categories: data?.categories || [] }
	}

	const {
		data: { user },
		error
	} = await supabase.auth.getUser()

	if (error || !user) {
		// Session is invalid
		return { session: null, supabase, user: null, categories: data?.categories || [] }
	}

	return { session, supabase, user, categories: data?.categories || [] }
}