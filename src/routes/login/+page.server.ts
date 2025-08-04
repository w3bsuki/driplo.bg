import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	// Don't check session - let users access login page
	// They might be signing out and signing in with different account
	
	// Pass through any query params (like error messages)
	const errorParam = url.searchParams.get('error')
	const message = url.searchParams.get('message')
	
	return {
		error: errorParam,
		message
	}
}

export const actions = {
	signin: async ({ request, locals: { supabase }, url, getClientAddress }) => {
		const formData = await request.formData()
		const email = formData.get('email') as string
		const password = formData.get('password') as string
		const captchaToken = formData.get('captcha_token') as string
		const rememberMe = formData.get('rememberMe') === 'on'
		
		if (!email || !password) {
			return fail(400, {
				error: 'Please fill in all fields',
				email
			})
		}
		
		// Get client IP for rate limiting
		const clientIP = getClientAddress()
		
		try {
			// Check rate limiting for login attempts
			const rateLimitResult = await supabase.rpc('check_auth_rate_limit', {
				p_ip_address: clientIP,
				p_user_id: null, // No user ID for login attempts
				p_action: 'login'
			})
			
			if (rateLimitResult.data === false) {
				return fail(429, {
					error: 'Too many login attempts. Please wait before trying again.',
					email
				})
			}
		} catch (rateLimitError) {
			// If rate limit check fails, continue but log the error
			console.error('Rate limit check failed:', rateLimitError)
		}
		
		// Verify CAPTCHA in production
		if (captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
			try {
				const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({
						secret: process.env.RECAPTCHA_SECRET_KEY,
						response: captchaToken,
						remoteip: clientIP
					})
				})
				
				const captchaResult = await captchaResponse.json()
				if (!captchaResult.success) {
					return fail(400, {
						error: 'CAPTCHA verification failed. Please try again.',
						email
					})
				}
			} catch (captchaError) {
				console.error('CAPTCHA verification error:', captchaError)
				return fail(400, {
					error: 'CAPTCHA verification failed. Please try again.',
					email
				})
			}
		}
		
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		
		// Log authentication event
		try {
			await supabase.rpc('log_auth_event', {
				p_user_id: data?.user?.id || null,
				p_action: 'login',
				p_ip_address: clientIP,
				p_user_agent: request.headers.get('user-agent'),
				p_success: !error,
				p_error_message: error?.message || null,
				p_metadata: { email, remember_me: rememberMe }
			})
		} catch (logError) {
			console.error('Failed to log auth event:', logError)
		}
		
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
		// Use invalidateAll to ensure session is refreshed on redirect
		throw redirect(303, `${redirectTo}?_refreshAuth=true`)
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