/**
 * Route-based Code Splitting Configuration
 * 
 * This module defines which routes should be dynamically imported
 * to reduce the initial bundle size.
 */

import type { Load } from '@sveltejs/kit';

interface RouteConfig {
	// Pattern to match the route
	pattern: RegExp;
	// Preload this route when hovering over links
	preloadOnHover?: boolean;
	// Preload this route after the initial page load
	preloadOnIdle?: boolean;
	// Priority for idle preloading (lower = higher priority)
	priority?: number;
}

// Routes that should be code-split
export const dynamicRoutes: RouteConfig[] = [
	{
		pattern: /^\/admin/,
		preloadOnHover: true,
		priority: 3
	},
	{
		pattern: /^\/dashboard/,
		preloadOnHover: true,
		preloadOnIdle: true,
		priority: 2
	},
	{
		pattern: /^\/brands\/analytics/,
		preloadOnHover: true,
		priority: 3
	},
	{
		pattern: /^\/sell/,
		preloadOnHover: true,
		preloadOnIdle: true,
		priority: 1
	},
	{
		pattern: /^\/messages/,
		preloadOnHover: true,
		priority: 2
	},
	{
		pattern: /^\/orders/,
		preloadOnHover: true,
		priority: 2
	}
];

/**
 * Get routes that should be preloaded on idle
 */
export function getIdlePreloadRoutes(): string[] {
	return dynamicRoutes
		.filter(route => route.preloadOnIdle)
		.sort((a, b) => (a.priority || 999) - (b.priority || 999))
		.map(route => {
			// Convert regex to example path
			const pattern = route.pattern.source;
			return pattern.replace(/[\^$]/g, '').replace(/\\/g, '');
		});
}

/**
 * Check if a route should be dynamically imported
 */
export function shouldSplitRoute(path: string): boolean {
	return dynamicRoutes.some(route => route.pattern.test(path));
}

/**
 * Preload components for a specific route
 */
export async function preloadRoute(path: string) {
	// Match the path to determine which components to preload
	if (path.startsWith('/admin')) {
		// Preload admin components
		import('$routes/(app)/admin/+page.svelte');
	} else if (path.startsWith('/dashboard')) {
		// Preload dashboard components
		import('$routes/dashboard/+page.svelte');
	} else if (path.startsWith('/brands/analytics')) {
		// Preload analytics components
		import('$routes/(app)/brands/analytics/+page.svelte');
	} else if (path.startsWith('/sell')) {
		// Preload selling components
		import('$routes/(app)/sell/+page.svelte');
	} else if (path.startsWith('/messages')) {
		// Preload messaging components
		import('$routes/(app)/messages/+page.svelte');
	}
}

/**
 * Setup idle preloading
 */
export function setupIdlePreloading() {
	if ('requestIdleCallback' in window) {
		const routes = getIdlePreloadRoutes();
		
		routes.forEach((route, index) => {
			window.requestIdleCallback(() => {
				preloadRoute(route);
			}, { timeout: 2000 + (index * 500) });
		});
	}
}