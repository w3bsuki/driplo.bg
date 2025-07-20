<script>
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import PromotionalBanner from '$lib/components/layout/PromotionalBanner.svelte';
	import CookieConsent from '$lib/components/cookie-consent/CookieConsent.svelte';
	import { Toaster } from 'svelte-sonner';
	import { setAuthContext } from '$lib/stores/auth-context.svelte';
	import { notifyAuthStateChange } from '$lib/stores/auth-compat';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { QueryClientProvider } from '@tanstack/svelte-query'
	import { createQueryClient } from '$lib/stores/query-client';
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import NotificationPopup from '$lib/components/NotificationPopup.svelte';
	import WelcomeModal from '$lib/components/onboarding/WelcomeModal.svelte';

	export let data;

	// Initialize auth context with server-side data
	const authContext = setAuthContext(data.supabase, data.user, data.session);
	
	// Initialize query client
	const queryClient = createQueryClient();
	
	// Initialize onboarding for current user
	if (data.user) {
		onboarding.initialize(data.user.id);
	}
	
	// Track scroll position for landing page
	let showMobileNavOnLanding = false;
	
	// Define pages where bottom nav should be hidden
	const hiddenPaths = [
		'/orders',
		'/wishlist',
		'/checkout',
		'/messages',
		'/settings',
		'/profile/edit'
	];
	
	// Hide mobile nav on specific pages
	$: shouldHideMobileNav = 
		hiddenPaths.some(path => $page.url.pathname.startsWith(path)) || // Hidden paths
		$page.url.pathname.includes('/listings/') || // Product detail pages
		$page.url.pathname.includes('/sell') || // Sell product form
		($page.url.pathname === '/' && !showMobileNavOnLanding) || // Landing page (show when scrolled)
		$page.url.pathname.includes('/payment') || // Payment forms
		$page.url.pathname.includes('/login') || // Login page
		$page.url.pathname.includes('/register'); // Register page
		
	// Check if we're on an auth page
	$: isAuthPage = $page.url.pathname.includes('/login') || $page.url.pathname.includes('/register');

	onMount(() => {
		// Handle scroll for showing mobile nav on landing page
		const handleScroll = () => {
			if ($page.url.pathname === '/') {
				// Show nav immediately after first scroll
				showMobileNavOnLanding = window.scrollY > 50;
			}
		};
		
		window.addEventListener('scroll', handleScroll);
		
		// Listen for auth changes and update context
		const { data: authListener } = data.supabase.auth.onAuthStateChange((event, session) => {
			// Update the auth context directly
			if (event === 'SIGNED_IN' && session?.user) {
				authContext.user = session.user;
				authContext.session = session;
				// Notify compatibility layer
				notifyAuthStateChange(authContext.user, authContext.session, authContext.profile, authContext.loading);
			} else if (event === 'SIGNED_OUT') {
				authContext.user = null;
				authContext.session = null;
				authContext.profile = null;
				// Notify compatibility layer
				notifyAuthStateChange(authContext.user, authContext.session, authContext.profile, authContext.loading);
			}
			
			// Also invalidate server data
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		return () => {
			authListener.subscription.unsubscribe();
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background">
		{#if !isAuthPage}
			<PromotionalBanner 
				message="🎉 Free shipping on orders over £50!" 
				ctaText="Shop Now" 
				ctaHref="/browse"
			/>
			<Header categories={data.categories} />
		{/if}
		<main class={shouldHideMobileNav ? "pb-0 md:pb-0" : "pb-20 md:pb-0"}>
			<slot />
		</main>
		{#if !shouldHideMobileNav}
			<MobileNav />
		{/if}
	</div>

	<CookieConsent />
	<Toaster richColors position="top-center" />
</QueryClientProvider>

