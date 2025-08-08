import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	// Don't check session - let users access register page
	// They might want to create a new account
	
	// Check if showing success message
	const success = url.searchParams.get('success') === 'true'
	
	return {
		success
	}
}

export const actions = {
	signup: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData()
		const email = formData.get('email') as string
		const password = formData.get('password') as string
		const confirmPassword = formData.get('confirmPassword') as string
		const accountType = formData.get('accountType') as 'personal' | 'brand'
		const brandName = formData.get('brandName') as string
		const brandCategory = formData.get('brandCategory') as string
		const brandWebsite = formData.get('brandWebsite') as string
		const agreedToTerms = formData.get('agreedToTerms') === 'on'
		
		// Validation
		if (!email || !password || !confirmPassword) {
			return fail(400, {
				error: 'Please fill in all required fields',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		if (!agreedToTerms) {
			return fail(400, {
				error: 'Please agree to the terms of service',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		if (accountType === 'brand' && !brandName) {
			return fail(400, {
				error: 'Brand name is required for brand accounts',
				email,
				accountType,
				brandCategory,
				brandWebsite
			})
		}
		
		// First check if user already exists
		const { data: existingUser } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', email)
			.single()
		
		if (existingUser) {
			return fail(400, {
				error: 'An account with this email already exists. Please sign in instead.',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		// Sign up user through Supabase Auth with email verification required
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					account_type: accountType,
					brand_name: accountType === 'brand' ? brandName : undefined,
					brand_category: accountType === 'brand' ? brandCategory : undefined,
					brand_website: accountType === 'brand' ? brandWebsite : undefined,
					needs_onboarding: true // Clear flag for onboarding requirement
				},
				emailRedirectTo: `${url.origin}/auth/callback?type=signup`
			}
		})
		
		if (error) {
			// Handle specific error cases
			if (error.message?.includes('duplicate') || error.message?.includes('already registered') || error.message?.includes('User already registered')) {
				return fail(400, {
					error: 'An account with this email already exists. Please sign in instead.',
					email,
					accountType,
					brandName,
					brandCategory,
					brandWebsite
				})
			}
			
			return fail(400, {
				error: error.message || 'Registration failed',
				email,
				accountType,
				brandName,
				brandCategory,
				brandWebsite
			})
		}
		
		// Check if this was a duplicate signup attempt
		// Supabase returns a user object even for existing users
		if (data?.user) {
			// Check if user's email was already confirmed (existing user)
			if (data.user.email_confirmed_at) {
				// This is an existing, confirmed user - sign them out and show error
				await supabase.auth.signOut()
				return fail(400, {
					error: 'An account with this email already exists. Please sign in instead.',
					email,
					accountType,
					brandName,
					brandCategory,
					brandWebsite
				})
			}
			
			// New user or unconfirmed user - sign out to prevent auto-login
			if (data.session) {
				await supabase.auth.signOut()
			}
			
			// Check if this is truly a new signup (session would be null for existing unconfirmed)
			if (!data.session && data.user.created_at) {
				// Check if user was created more than 1 second ago (existing user)
				const createdAt = new Date(data.user.created_at).getTime()
				const now = Date.now()
				if (now - createdAt > 1000) {
					return fail(400, {
						error: 'An account with this email already exists but is not confirmed. Please check your email.',
						email,
						accountType,
						brandName,
						brandCategory,
						brandWebsite
					})
				}
			}
		}
		
		// Redirect to success page
		throw redirect(303, '/register?success=true')
	},
	
	oauth: async ({ request, locals: { supabase }, url, cookies }) => {
		const formData = await request.formData()
		const provider = formData.get('provider') as 'google' | 'github'
		const accountType = formData.get('accountType') as 'personal' | 'brand'
		
		// Store account type preference in cookies for OAuth callback using proper cookie serialization
		cookies.set('pending_account_type', accountType, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 600, // 10 minutes
			secure: process.env['NODE_ENV'] === 'production'
		})
		
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		})
		
		if (error) {
			return fail(400, {
				error: 'OAuth authentication failed',
				accountType
			})
		}
		
		if (data.url) {
			throw redirect(303, data.url)
		}
		
		return fail(400, {
			error: 'OAuth authentication failed',
			accountType
		})
	}
} satisfies Actions