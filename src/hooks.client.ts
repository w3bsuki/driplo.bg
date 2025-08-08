import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

// Initialize Sentry only in production
if (import.meta.env.PROD) {
	Sentry.init({
		dsn: import.meta.env['VITE_PUBLIC_SENTRY_DSN'],
		
		// Performance Monitoring
		tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
		
		// Session Replay
		replaysSessionSampleRate: 0.1, // Capture 10% of sessions
		replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
		
		// Integrations
		integrations: [
			replayIntegration({
				// Mask sensitive content
				maskAllText: false,
				blockAllMedia: false,
			}),
		],
		
		// Environment
		environment: import.meta.env.MODE,
		
		// Filter out known issues
		beforeSend(event, _hint) {
			// Filter out specific errors you don't care about
			if (event.exception && event.exception.values) {
				const error = event.exception.values[0];
				
				// Skip ResizeObserver errors (common and harmless)
				if (error && error.type === 'ResizeObserver loop limit exceeded') {
					return null;
				}
				
				// Skip network errors that are expected
				if (error && error.type === 'NetworkError' && error.value?.includes('Failed to fetch')) {
					return null;
				}
			}
			
			// Don't send events from localhost/development
			if (event.request?.url?.includes('localhost')) {
				return null;
			}
			
			return event;
		},
		
		// Only activate in production
		enabled: import.meta.env.PROD,
	});
}

// Handle client-side errors
export const handleError = handleErrorWithSentry();