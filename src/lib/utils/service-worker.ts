import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';

/**
 * Simple service worker registration for offline caching
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!browser || !('serviceWorker' in navigator)) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/'
		});

		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			if (newWorker) {
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed') {
						if (navigator.serviceWorker.controller) {
							// New SW installed, show update notification
							showUpdateNotification();
						} else {
							// SW installed for first time
							logger.info('Service worker installed');
						}
					}
				});
			}
		});

		logger.info('Service worker registered successfully');
		return registration;

	} catch (error) {
		logger.warn('Service worker registration failed', error);
		return null;
	}
}

function showUpdateNotification() {
	// Simple update notification
	if (window.confirm('A new version is available. Refresh to update?')) {
		window.location.reload();
	}
}

/**
 * Check if app is running from cache (offline)
 */
export function isRunningFromCache(): boolean {
	if (!browser || !navigator.serviceWorker) {
		return false;
	}

	// Simple heuristic - check if SW is controlling the page
	return !!navigator.serviceWorker.controller;
}

/**
 * Prefetch critical routes for offline access
 */
export async function prefetchCriticalRoutes(routes: string[]): Promise<void> {
	if (!browser || !('caches' in window)) {
		return;
	}

	try {
		const cache = await caches.open('driplo-pages-v1');
		const requests = routes.map(route => new Request(route));
		
		await Promise.allSettled(
			requests.map(async (request) => {
				try {
					const response = await fetch(request);
					if (response.ok) {
						await cache.put(request, response);
					}
				} catch (error) {
					logger.warn('Failed to prefetch route:', request.url);
				}
			})
		);

		logger.debug(`Prefetched ${routes.length} critical routes`);
	} catch (error) {
		logger.warn('Route prefetching failed', error);
	}
}

/**
 * Clear all caches (for debugging)
 */
export async function clearAllCaches(): Promise<void> {
	if (!browser || !('caches' in window)) {
		return;
	}

	try {
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map(name => caches.delete(name)));
		logger.info('All caches cleared');
	} catch (error) {
		logger.warn('Cache clearing failed', error);
	}
}