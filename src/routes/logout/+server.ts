import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
	// Sign out on server
	await locals.supabase.auth.signOut()
	
	// Redirect to login with success message
	throw redirect(303, '/login?message=logged_out')
}