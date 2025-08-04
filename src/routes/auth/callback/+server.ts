import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	// Get the auth code from the URL
	const code = url.searchParams.get('code')
	const next = url.searchParams.get('next') || '/'
	
	if (code) {
		// Exchange the code for a session
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		
		if (error) {
			console.error('Auth callback error:', error)
			// Redirect to login with error message
			throw redirect(303, `/login?error=auth_callback_error`)
		}
	}
	
	// Check if this is from email confirmation
	const type = url.searchParams.get('type')
	if (type === 'signup') {
		// User confirmed their email, redirect to login
		throw redirect(303, '/login?message=email_verified')
	}
	
	// Check if this is from password reset
	if (type === 'recovery') {
		// Redirect to reset password page
		throw redirect(303, '/reset-password')
	}
	
	// Check for any auth errors
	const authError = url.searchParams.get('error')
	if (authError) {
		const errorDescription = url.searchParams.get('error_description')
		console.error('Auth error:', authError, errorDescription)
		throw redirect(303, `/login?error=${authError}`)
	}
	
	// Successful auth, redirect to the intended page or home
	throw redirect(303, next)
}