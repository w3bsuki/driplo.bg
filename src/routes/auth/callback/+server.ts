import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { localizeHref } from '$lib/paraglide/runtime.js'

export const GET: RequestHandler = async ({ url, locals: { supabase }, cookies }) => {
	// Get the auth code from the URL
	const code = url.searchParams.get('code')
	const next = url.searchParams.get('next') || '/'
	const type = url.searchParams.get('type')
	
	// Get current locale for localized redirects
	const currentLocale = cookies.get('PARAGLIDE_LOCALE') || locals.locale || 'en'
	
	// Check for any auth errors first
	const authError = url.searchParams.get('error')
	if (authError) {
		const loginUrl = localizeHref(`/login?error=${authError}`, { locale: currentLocale as 'en' | 'bg' })
		throw redirect(303, loginUrl)
	}
	
	if (code) {
		// Exchange the code for a session
		const { data, error } = await supabase.auth.exchangeCodeForSession(code)
		
		if (error) {
			const loginUrl = localizeHref('/login?error=auth_callback_error', { locale: currentLocale as 'en' | 'bg' })
			throw redirect(303, loginUrl)
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
				
				// Profile creation error will be handled by the application flow
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
		const onboardingUrl = localizeHref('/onboarding', { locale: currentLocale as 'en' | 'bg' })
		throw redirect(303, onboardingUrl)
	}
	
	// Handle password reset
	if (type === 'recovery') {
		const resetUrl = localizeHref('/reset-password', { locale: currentLocale as 'en' | 'bg' })
		throw redirect(303, resetUrl)
	}
	
	// Successful auth, redirect to the intended page or home
	// If next is already localized, use it as-is, otherwise localize it
	const finalUrl = next.startsWith('/bg') || next.startsWith('/en') 
		? next 
		: localizeHref(next, { locale: currentLocale as 'en' | 'bg' })
	throw redirect(303, finalUrl)
}