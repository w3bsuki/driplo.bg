import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession()
	
	// If already logged in, redirect to home
	if (session) {
		throw redirect(303, '/')
	}
	
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
		
		// Generate a temporary username from email
		const tempUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000)
		
		// Sign up user through Supabase Auth
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username: tempUsername,
					account_type: accountType,
					brand_name: accountType === 'brand' ? brandName : undefined,
					brand_category: accountType === 'brand' ? brandCategory : undefined,
					brand_website: accountType === 'brand' ? brandWebsite : undefined,
					needs_username_setup: true
				},
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		})
		
		if (error) {
			// Handle specific error cases
			if (error.message?.includes('duplicate') || error.message?.includes('already registered')) {
				return fail(400, {
					error: 'An account with this email already exists',
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
		
		// Redirect to success page
		throw redirect(303, '/register?success=true')
	},
	
	oauth: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData()
		const provider = formData.get('provider') as 'google' | 'github'
		const accountType = formData.get('accountType') as 'personal' | 'brand'
		
		// Store account type preference in cookies for OAuth callback
		const headers = new Headers()
		headers.append('Set-Cookie', `pending_account_type=${accountType}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`)
		
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