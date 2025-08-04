import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession()
	
	// If already logged in, redirect to home
	if (session) {
		throw redirect(303, '/')
	}
	
	// Pass through any query params (like error messages)
	const error = url.searchParams.get('error')
	const message = url.searchParams.get('message')
	
	return {
		error,
		message
	}
}

export const actions = {
	signin: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData()
		const email = formData.get('email') as string
		const password = formData.get('password') as string
		const rememberMe = formData.get('rememberMe') === 'on'
		
		if (!email || !password) {
			return fail(400, {
				error: 'Please fill in all fields',
				email
			})
		}
		
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		
		if (error) {
			// Handle specific error cases
			if (error.message.includes('Email not confirmed')) {
				return fail(400, {
					error: 'Please verify your email before logging in. Check your inbox for the confirmation link.',
					email,
					showResend: true
				})
			} else if (error.message.includes('Invalid login credentials')) {
				return fail(400, {
					error: 'Invalid email or password. Please try again.',
					email
				})
			} else if (error.message.includes('Too many login attempts')) {
				return fail(429, {
					error: error.message,
					email
				})
			}
			
			return fail(400, {
				error: error.message || 'Login failed',
				email
			})
		}
		
		// Redirect to the originally requested page or home
		const redirectTo = url.searchParams.get('redirectTo') || '/'
		throw redirect(303, redirectTo)
	},
	
	oauth: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData()
		const provider = formData.get('provider') as 'google' | 'github'
		
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		})
		
		if (error) {
			return fail(400, {
				error: 'OAuth authentication failed'
			})
		}
		
		if (data.url) {
			throw redirect(303, data.url)
		}
		
		return fail(400, {
			error: 'OAuth authentication failed'
		})
	}
} satisfies Actions