import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Creates a Supabase server client for API routes
 */
export function createSupabaseServerClient(cookies: RequestEvent['cookies']) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookies.set(name, value, { 
							...options, 
							path: '/',
							secure: true,
							httpOnly: true,
							sameSite: 'lax'
						});
					});
				}
			}
		}
	);
}