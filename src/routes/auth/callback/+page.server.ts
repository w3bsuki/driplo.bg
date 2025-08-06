import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { logger } from '$lib/services/logger'

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code')
	const next = url.searchParams.get('next') ?? '/'
	
	if (code) {
		try {
			// Exchange the code for a session
			const { error } = await supabase.auth.exchangeCodeForSession(code)
			if (error) {
				logger.error('Auth callback error', error)
				throw redirect(303, '/login?error=auth_failed')
			}
			
			// Ensure cookies are properly set
			const { data: { session } } = await supabase.auth.getSession()
			if (!session) {
				throw redirect(303, '/login?error=no_session')
			}
			
		} catch (err) {
			logger.error('Auth callback exception', err)
			throw redirect(303, '/login?error=callback_failed')
		}
	}
	
	// Redirect to the intended destination
	throw redirect(303, next)
}