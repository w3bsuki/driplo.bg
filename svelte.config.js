import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// Use Node.js 20.x runtime
			runtime: 'nodejs20.x'
		}),
		
		// Prerender static pages for better performance
		prerender: {
			entries: [
				// Home and category pages (with ISR potential)
				'/',
				'/browse',
				'/bags',
				'/designer', 
				'/kids',
				'/men',
				'/shoes',
				'/women',
				
				// Static pages
				'/privacy',
				
				// Auth pages (no server data)
				'/login',
				'/register',
				'/auth-code-error'
			],
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			crawl: true
		},
		
		// Security headers configuration
		// SECURITY FIX: Removed 'unsafe-eval' to prevent eval() attacks
		csp: {
			directives: {
				// Removed 'unsafe-eval' - no eval(), Function(), setTimeout(string) allowed
				'script-src': ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com', 'https://js.stripe.com', 'https://checkout.stripe.com'],
				'frame-src': ["'self'", 'https://www.google.com', 'https://js.stripe.com', 'https://checkout.stripe.com'],
				'img-src': ["'self'", 'data:', 'https:', 'blob:'],
				'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.stripe.com', 'https://www.google.com', 'https://*.sentry.io'],
				'font-src': ["'self'", 'https:', 'data:'],
				// TODO: Replace 'unsafe-inline' with nonces for styles in future
				'style-src': ["'self'", "'unsafe-inline'", 'https:'],
				'base-uri': ["'self'"],
				'form-action': ["'self'"],
				'frame-ancestors': ["'none'"],
				'object-src': ["'none'"]
			}
		}
	}
};

export default config;
