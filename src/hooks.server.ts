import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'
import type { Database } from '$lib/types/database'
import { sequence } from '@sveltejs/kit/hooks'
import { setLocale, isLocale } from '$lib/paraglide/runtime.js'
import { dev } from '$app/environment'

// Validate environment variables
if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
	console.error('Missing required environment variables:', {
		PUBLIC_SUPABASE_URL: !!PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY: !!PUBLIC_SUPABASE_ANON_KEY
	})
	if (!dev) {
		throw new Error('Missing required Supabase environment variables')
	}
}

const handleI18n: Handle = async ({ event, resolve }) => {
	// Get language from cookie or Accept-Language header
	// Paraglide uses PARAGLIDE_LOCALE as the cookie name
	const cookieLocale = event.cookies.get('PARAGLIDE_LOCALE') || event.cookies.get('locale')
	const acceptLanguage = event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
	
	// Determine which language to use
	let locale = 'en' // default
	
	if (cookieLocale && isLocale(cookieLocale)) {
		locale = cookieLocale
	} else if (acceptLanguage && isLocale(acceptLanguage)) {
		locale = acceptLanguage
	}
	
	// Set the language for this request
	setLocale(locale as 'en' | 'bg', { reload: false })
	
	// Store locale for use in components
	event.locals.locale = locale
	
	// Resolve the request
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Replace html lang attribute
			return html.replace('<html lang="en">', `<html lang="${locale}">`)
		}
	})
	
	// Set cookie if it's not already set or if locale changed
	if (!cookieLocale || cookieLocale !== locale) {
		// Set PARAGLIDE_LOCALE cookie for Paraglide runtime
		response.headers.append('set-cookie', event.cookies.serialize('PARAGLIDE_LOCALE', locale, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			secure: !dev
		}))
	}
	
	return response
}

const handleSupabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => event.cookies.get(key),
				set: (key, value, options) => {
					// More robust production detection
					const isSecure = event.url.protocol === 'https:' || event.url.hostname !== 'localhost';
					
					// Debug cookie setting
					console.log('🍪 Setting cookie:', {
						key,
						valueLength: value?.length,
						options,
						hostname: event.url.hostname,
						protocol: event.url.protocol,
						isSecure,
						dev
					});
					
					// Set cookie with proper options
					event.cookies.set(key, value, {
						...options,
						path: '/',
						httpOnly: true,
						secure: isSecure,
						sameSite: 'lax',
						maxAge: options?.maxAge ?? 60 * 60 * 24 * 30 // 30 days default
					})
				},
				remove: (key, _options) => {
					const isSecure = event.url.protocol === 'https:' || event.url.hostname !== 'localhost';
					// Ensure complete cookie removal with all necessary options
					event.cookies.delete(key, {
						path: '/',
						httpOnly: true,
						secure: isSecure,
						sameSite: 'lax'
					})
				}
			}
		}
	)

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		// Get session first to check if we have auth data
		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession()
		
		console.log('🔍 Server safeGetSession:', {
			hasSession: !!session,
			userEmail: session?.user?.email || 'none',
			path: event.url.pathname
		});
		
		if (!session) {
			return { session: null, user: null }
		}

		// Validate the session by calling getUser
		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser()
		
		if (userError || !user) {
			console.log('❌ Server auth validation error:', userError?.message);
			// JWT validation has failed
			return { session: null, user: null }
		}

		console.log('✅ Server auth validation success for:', user?.email);
		return { session, user }
	}

	// Check if authenticated user needs onboarding
	const { user } = await event.locals.safeGetSession()
	if (user && user.email_confirmed_at && !event.url.pathname.startsWith('/onboarding') && !event.url.pathname.startsWith('/api')) {
		// Get user profile to check onboarding completion
		const { data: profile } = await event.locals.supabase
			.from('profiles')
			.select('onboarding_completed, account_type')
			.eq('id', user.id)
			.single()
		
		// Redirect to onboarding if:
		// 1. User has verified email (email_confirmed_at exists)
		// 2. Profile exists but onboarding not completed
		const needsOnboarding = profile && !profile.onboarding_completed
		
		if (needsOnboarding) {
			// Skip redirect for auth pages, API routes, and static assets
			const skipPaths = ['/login', '/register', '/callback', '/auth', '/_app']
			const shouldRedirect = !skipPaths.some(path => event.url.pathname.startsWith(path)) && 
								   !event.url.pathname.includes('.') &&
								   // Don't redirect brand accounts from their own brand pages
								   !(profile.account_type === 'brand' && event.url.pathname.startsWith('/brands/'))
			
			if (shouldRedirect) {
				return new Response(null, {
					status: 302,
					headers: {
						location: '/onboarding'
					}
				})
			}
		}
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version'
		}
	})

	// Security headers are already set in vercel.json
	// Only add CSP here to include dynamic values for Supabase and allow Vercel live
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://js.stripe.com https://checkout.stripe.com https://vercel.live",
		"frame-src 'self' https://www.google.com https://checkout.stripe.com https://vercel.live",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"img-src 'self' data: https: blob:",
		"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google.com https://api.stripe.com https://vercel.live"
	]
	
	response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

	return response
}

const handleCaching: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)
	
	// Skip caching for non-GET requests
	if (event.request.method !== 'GET') {
		return response
	}
	
	// Skip if cache headers already set by route
	if (response.headers.has('cache-control')) {
		return response
	}
	
	const path = event.url.pathname
	
	// Apply caching based on route patterns
	if (path.startsWith('/_app/') || path.startsWith('/images/') || path.endsWith('.js') || path.endsWith('.css')) {
		// Static assets - long cache
		response.headers.set('cache-control', 'public, max-age=31536000, immutable')
	} else if (path.startsWith('/api/')) {
		// API routes - short cache
		response.headers.set('cache-control', 'public, max-age=0, s-maxage=60, must-revalidate')
	} else if (path.startsWith('/auth/') || path.startsWith('/account/') || path.startsWith('/dashboard/')) {
		// Private routes - no cache
		response.headers.set('cache-control', 'no-store')
	} else if (path === '/' || path.startsWith('/browse')) {
		// Browse pages - moderate cache
		response.headers.set('cache-control', 'public, max-age=300, s-maxage=3600')
	} else if (path.startsWith('/listings/')) {
		// Product pages - longer cache
		response.headers.set('cache-control', 'public, max-age=600, s-maxage=86400')
	} else if (path.startsWith('/sellers/') || path.startsWith('/brands/')) {
		// Profile pages - short cache
		response.headers.set('cache-control', 'public, max-age=60, s-maxage=300')
	} else {
		// Default - short cache
		response.headers.set('cache-control', 'public, max-age=60, s-maxage=300')
	}
	
	// Add Vary header for proper caching with different representations
	const vary = response.headers.get('vary')
	const varyHeaders = ['Accept-Encoding', 'Accept-Language']
	if (vary) {
		varyHeaders.unshift(vary)
	}
	response.headers.set('vary', varyHeaders.join(', '))
	
	return response
}

export const handle = sequence(handleI18n, handleSupabase, handleCaching)