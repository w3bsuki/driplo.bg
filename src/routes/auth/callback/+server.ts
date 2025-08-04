import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase }, cookies }) => {
	// Get the auth code from the URL
	const code = url.searchParams.get('code')
	const next = url.searchParams.get('next') || '/'
	const type = url.searchParams.get('type')
	
	// Check for any auth errors first
	const authError = url.searchParams.get('error')
	if (authError) {
		const errorDescription = url.searchParams.get('error_description')
		console.error('Auth error:', authError, errorDescription)
		throw redirect(303, `/login?error=${authError}`)
	}
	
	if (code) {
		// Exchange the code for a session
		const { data, error } = await supabase.auth.exchangeCodeForSession(code)
		
		if (error) {
			console.error('Auth callback error:', error)
			throw redirect(303, `/login?error=auth_callback_error`)
		}
		
		// Handle OAuth signup - create profile with account type preference
		if (data.user && data.session) {
			const pendingAccountType = cookies.get('pending_account_type')
			
			// Check if profile already exists
			const { data: existingProfile } = await supabase
				.from('profiles')
				.select('id, onboarding_completed')
				.eq('id', data.user.id)
				.single()
			
			// Create profile if it doesn't exist (new OAuth user)
			if (!existingProfile) {
				const { error: profileError } = await supabase
					.from('profiles')
					.insert({
						id: data.user.id,
						email: data.user.email,
						full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
						avatar_url: data.user.user_metadata?.avatar_url,
						account_type: pendingAccountType || 'personal',
						onboarding_completed: false
					})
				
				if (profileError) {
					console.error('Profile creation error:', profileError)
				}
			}
			
			// Clear the pending account type cookie
			if (pendingAccountType) {
				cookies.delete('pending_account_type', { path: '/' })
			}
		}
	}
	
	// Handle email confirmation
	if (type === 'signup') {
		// User confirmed their email - redirect to onboarding since profile already exists
		throw redirect(303, '/onboarding')
	}
	
	// Handle password reset
	if (type === 'recovery') {
		throw redirect(303, '/reset-password')
	}
	
	// Successful auth, redirect to the intended page or home
	throw redirect(303, next)
}