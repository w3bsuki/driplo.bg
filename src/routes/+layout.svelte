<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNavBar from '$lib/components/navigation/MobileNavBar.svelte';
	import MobileCategoryMenu from '$lib/components/navigation/MobileCategoryMenu.svelte';
	import PromotionalBanner from '$lib/components/layout/PromotionalBanner.svelte';
	import StickySearchBelowNav from '$lib/components/search/StickySearchBelowNav.svelte';
	import CookieConsent from '$lib/components/cookie-consent/CookieConsent.svelte';
	import { Toaster } from 'svelte-sonner';
	import { initializeAuth, setupAuthListener } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { invalidate, invalidateAll, goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query'
	import { createQueryClient } from '$lib/stores/query-client';
	import NotificationPopup from '$lib/components/NotificationPopup.svelte';
	import { onboarding } from '$lib/stores/onboarding.svelte.ts';
	import { browser, dev } from '$app/environment';
	import { initWebVitals } from '$lib/utils/web-vitals';
	import { navigation } from '$lib/stores/navigation.svelte';
	import { registerServiceWorker } from '$lib/utils/service-worker';
	import * as m from '$lib/paraglide/messages.js';
	
	// Error boundaries
	import { ErrorBoundary } from '$lib/components/shared';
	import { AuthErrorBoundary } from '$lib/components/error-boundaries';

	let { data } = $props();

	// Initialize auth stores with server-side data
	
	// Initialize query client
	const queryClient = createQueryClient();
	
	// Define pages where bottom nav should be hidden
	const hiddenPaths = [
		'/orders',
		'/checkout',
		'/messages',
		'/settings',
		'/profile/edit'
	];
	
	// Hide mobile nav on specific pages
	const shouldHideMobileNav = $derived(
		hiddenPaths.some(path => $page.url.pathname.startsWith(path)) || // Hidden paths
		$page.url.pathname.includes('/listings/') || // Product detail pages
		$page.url.pathname.includes('/sell') || // Sell product form
		$page.url.pathname.includes('/payment') || // Payment forms
		$page.url.pathname.includes('/login') || // Login page
		$page.url.pathname.includes('/register') // Register page
	);
		
	// Check if we're on an auth page
	const isAuthPage = $derived($page.url.pathname.includes('/login') || $page.url.pathname.includes('/register'));
	
	// Track if we've already handled the refresh to prevent loops
	let hasHandledRefresh = false;
	
	// Handle auth refresh parameter reactively when URL changes
	$effect(() => {
		if (browser && $page.url.searchParams.get('_refreshAuth') === 'true' && !hasHandledRefresh) {
			hasHandledRefresh = true;
		
			// Remove the parameter from URL using SvelteKit's replaceState
			const url = new URL($page.url);
			url.searchParams.delete('_refreshAuth');
			replaceState(url.toString(), {});
			
			// Trigger auth refresh ONCE
			invalidateAll().then(() => {
				// Reset the flag after a delay to allow future refreshes if needed
				setTimeout(() => {
					hasHandledRefresh = false;
				}, 1000);
			});
		}
	});

	onMount(() => {
		// Initialize auth stores with server data
		initializeAuth(data.user, data.session, data.profile);
		
		// Set up auth listener for future changes
		const unsubscribe = setupAuthListener(data.supabase);
		
		// Initialize Web Vitals monitoring and service worker
		if (browser) {
			initWebVitals({
				sendToAnalytics: (metric) => {
					// In production, send to your analytics service
					if (!dev) {
						// Example: Google Analytics
						// gtag('event', metric.name, {
						//   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
						//   metric_rating: metric.rating,
						//   non_interaction: true
						// });
					}
				},
				sampleRate: dev ? 1 : 0.1, // 100% in dev, 10% in production
				metadata: {
					version: '1.0.0',
					environment: dev ? 'development' : 'production'
				}
			});

			// Register service worker for caching (production only)
			if (!dev) {
				registerServiceWorker();
			}
		}
		
		// Set up intersection observer for hero section detection
		let observer: IntersectionObserver | null = null;
		
		const setupHeroObserver = () => {
			// Look for the hero search section
			const heroSection = document.querySelector('[data-hero-search]');
			if (!heroSection) {
				// If no hero section, show the navbar
				navigation.setInHeroSection(false);
				return;
			}
			
			observer = new IntersectionObserver(
				([entry]) => {
					// When hero is visible, hide bottom nav
					// When hero is not visible, show bottom nav
					navigation.setInHeroSection(entry.isIntersecting);
				},
				{ 
					threshold: 0.1, // Trigger when 10% of hero is visible
					rootMargin: '0px 0px -100px 0px' // Adjust for better UX
				}
			);
			
			observer.observe(heroSection);
		};
		
		// Small delay to ensure DOM is ready
		const timeoutId = setTimeout(() => {
			setupHeroObserver();
		}, 100);
		
		return () => {
			clearTimeout(timeoutId);
			if (observer) observer.disconnect();
			if (unsubscribe) unsubscribe();
		};
	});
</script>

<QueryClientProvider client={queryClient}>
	<!-- Global error boundary for the entire app -->
	<ErrorBoundary variant="full" title="Application Error" showHome={true}>
		<div class="min-h-screen bg-background">
			{#if !isAuthPage}
				<!-- Header with error boundary for authentication-related issues -->
				<ErrorBoundary variant="minimal" showHome={false}>
					{#if !data.user}
						<PromotionalBanner 
							message={m.banner_launch_message()} 
							secondaryMessage={m.banner_launch_secondary()}
							ctaText={m.banner_launch_cta()} 
							ctaHref="/register"
							variant="launch"
							countdown={true}
						/>
					{:else}
						<PromotionalBanner 
							message={m.banner_welcome_message()} 
							ctaText={m.banner_welcome_cta()} 
							ctaHref="/sell"
							variant="gradient"
						/>
					{/if}
					
					<AuthErrorBoundary>
						<Header categories={data.categories} supabase={data.supabase} user={data.user} profile={data.profile} />
					</AuthErrorBoundary>
				</ErrorBoundary>
			{/if}
			
			<!-- Main content with page-specific error boundary -->
			<main class={shouldHideMobileNav ? "pb-0 md:pb-0" : "pb-14 md:pb-0"}>
				<ErrorBoundary variant="inline" showHome={false} autoRetry={true} maxRetries={2}>
					<slot />
				</ErrorBoundary>
			</main>
			
			<!-- Navigation with error boundary -->
			{#if !shouldHideMobileNav}
				<ErrorBoundary variant="minimal" showHome={false}>
					<MobileNavBar />
				</ErrorBoundary>
			{/if}
			
			<!-- Mobile Category Menu with error boundary -->
			<ErrorBoundary variant="minimal" showHome={false}>
				<MobileCategoryMenu categories={data.categories} />
			</ErrorBoundary>
		</div>

		<!-- Sticky search with error boundary -->
		<ErrorBoundary variant="minimal" showHome={false}>
			<StickySearchBelowNav />
		</ErrorBoundary>

		<CookieConsent />
		<Toaster richColors position="top-center" />
		<NotificationPopup position="top-right" />
		
		<!-- Page transition loading indicator -->
		{#if $navigating}
			<div class="fixed top-0 left-0 right-0 z-[100]">
				<div class="h-1 bg-blue-200">
					<div class="h-full bg-blue-400 animate-pulse" style="animation: loading-bar 1s ease-in-out infinite"></div>
				</div>
			</div>
		{/if}
	</ErrorBoundary>
</QueryClientProvider>

<style>
	@keyframes loading-bar {
		0% {
			width: 0%;
			margin-left: 0%;
		}
		50% {
			width: 70%;
			margin-left: 15%;
		}
		100% {
			width: 0%;
			margin-left: 100%;
		}
	}
</style>

