import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'
import type { Database } from '$lib/types/database'
import { sequence } from '@sveltejs/kit/hooks'
import { getLocale, setLocale, isLocale } from '$lib/paraglide/runtime.js'

const handleI18n: Handle = async ({ event, resolve }) => {
	// Get language from cookie or Accept-Language header
	const cookieLocale = event.cookies.get('locale')
	const acceptLanguage = event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
	
	// Determine which language to use
	let locale = 'en' // default
	
	if (cookieLocale && isLocale(cookieLocale)) {
		locale = cookieLocale
	} else if (acceptLanguage && isLocale(acceptLanguage)) {
		locale = acceptLanguage
	}
	
	// Set the language for this request
	setLocale(locale, { reload: false })
	
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
		response.headers.set('set-cookie', `locale=${locale}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`)
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
				/**
				 * SvelteKit's cookies API requires `path` to be explicitly set in
				 * the cookie options. Setting `path` to `/` replicates previous/
				 * standard behavior.
				 */
				set: (key, value, options) => {
					event.cookies.set(key, value, { ...options, path: '/' })
				},
				remove: (key, options) => {
					event.cookies.delete(key, { ...options, path: '/' })
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
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession()
		if (!session) {
			return { session: null, user: null }
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser()
		if (error) {
			// JWT validation has failed
			return { session: null, user: null }
		}

		// Validate extended session if it exists
		if (user && session.refresh_token) {
			try {
				const { data: sessionValid } = await event.locals.supabase.rpc('validate_auth_session', {
					p_user_id: user.id,
					p_refresh_token: session.refresh_token
				})

				// If extended session is valid, it was automatically extended
				if (!sessionValid?.valid) {
					console.warn('Extended session validation failed')
				}
			} catch (err) {
				// Extended session validation is optional, don't fail if it doesn't work
				console.error('Extended session check failed:', err)
			}
		}

		return { session, user }
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

	// Add security headers
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('X-XSS-Protection', '1; mode=block')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
	
	// Only set HSTS in production
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
	}

	return response
}

export const handle = sequence(handleI18n, handleSupabase)