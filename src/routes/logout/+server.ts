import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
	try {
		// Sign out on server
		const { error } = await locals.supabase.auth.signOut()
		
		if (error) {
			console.error('Logout error:', error)
		}
		
		// Always redirect even if there's an error
		throw redirect(303, '/login?message=logged_out')
	} catch (error: any) {
		// If it's a redirect, rethrow it
		if (error.status === 303) {
			throw error
		}
		
		console.error('Unexpected logout error:', error)
		// Force redirect even on error
		throw redirect(303, '/login?message=logout_error')
	}
}