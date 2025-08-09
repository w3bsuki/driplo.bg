<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { X } from 'lucide-svelte';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime.js';
	import { fade, fly } from 'svelte/transition';
	
	let showModal = $state(false);
	let hasSeenWelcome = $state(false);
	let cookiesAccepted = $state<boolean | null>(null);
	
	onMount(() => {
		// Check if user has seen welcome modal
		hasSeenWelcome = localStorage.getItem('driplo_welcome_seen') === 'true';
		
		// Check cookie consent status
		const cookieConsent = localStorage.getItem('driplo_cookie_consent');
		if (cookieConsent) {
			cookiesAccepted = cookieConsent === 'accepted';
		}
		
		// For debugging: check URL param to force show
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('welcome') === 'true') {
			localStorage.removeItem('driplo_welcome_seen');
			hasSeenWelcome = false;
		}
		
		// Show modal if user hasn't seen it
		if (!hasSeenWelcome) {
			showModal = true;
			console.log('Welcome modal: Showing for new visitor');
		} else {
			console.log('Welcome modal: Already seen, not showing');
		}
	});
	
	function handleSignUp(e?: Event) {
		if (e) e.stopPropagation();
		localStorage.setItem('driplo_welcome_seen', 'true');
		showModal = false;
		const signUpUrl = localizeHref('/register');
		goto(signUpUrl);
	}
	
	function handleSignIn(e?: Event) {
		if (e) e.stopPropagation();
		localStorage.setItem('driplo_welcome_seen', 'true');
		showModal = false;
		const signInUrl = localizeHref('/login');
		goto(signInUrl);
	}
	
	function handleAcceptCookies() {
		cookiesAccepted = true;
		localStorage.setItem('driplo_cookie_consent', 'accepted');
		
		// Set analytics cookies if needed
		if (typeof window !== 'undefined' && (window as any).gtag) {
			(window as any).gtag('consent', 'update', {
				analytics_storage: 'granted',
				ad_storage: 'granted'
			});
		}
	}
	
	function handleRejectCookies() {
		cookiesAccepted = false;
		localStorage.setItem('driplo_cookie_consent', 'rejected');
		
		// Disable analytics
		if (typeof window !== 'undefined' && (window as any).gtag) {
			(window as any).gtag('consent', 'update', {
				analytics_storage: 'denied',
				ad_storage: 'denied'
			});
		}
	}
	
	function handleClose() {
		localStorage.setItem('driplo_welcome_seen', 'true');
		showModal = false;
	}
	
	function handleBrowse(e?: Event) {
		if (e) e.stopPropagation();
		localStorage.setItem('driplo_welcome_seen', 'true');
		showModal = false;
	}
</script>

{#if showModal}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
		transition:fade={{ duration: 200 }}
	></div>
	
	<!-- Modal -->
	<div 
		class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-full max-w-lg px-4"
		transition:fly={{ y: 20, duration: 300 }}
		onclick={(e) => e.stopPropagation()}
	>
		<div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
			<!-- Close button -->
			<button
				onclick={handleClose}
				class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
				aria-label="Close"
			>
				<X class="w-5 h-5" />
			</button>
			
			<!-- Header with gradient -->
			<div class="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-white">
				<h2 class="text-3xl font-bold mb-2">
					{getLocale() === 'bg' ? 'Добре дошли в Driplo!' : 'Welcome to Driplo!'}
				</h2>
				<p class="text-white/90">
					{getLocale() === 'bg' 
						? 'Вашата дестинация за премиум мода'
						: 'Your destination for premium fashion'}
				</p>
			</div>
			
			<!-- Content -->
			<div class="px-8 py-6">
				<!-- Welcome message -->
				<div class="mb-6">
					<p class="text-gray-600 mb-4">
						{getLocale() === 'bg'
							? 'Присъединете се към нашата общност и започнете да продавате или пазарувате луксозни дрехи и аксесоари днес!'
							: 'Join our community and start selling or shopping luxury clothing and accessories today!'}
					</p>
					
					<!-- CTA Buttons -->
					<div class="flex gap-3 mb-6">
						<button
							onclick={handleSignUp}
							class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
						>
							{getLocale() === 'bg' ? 'Регистрация' : 'Sign Up'}
						</button>
						<button
							onclick={handleSignIn}
							class="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
						>
							{getLocale() === 'bg' ? 'Вход' : 'Sign In'}
						</button>
					</div>
					
					<!-- Browse without account -->
					<button
						onclick={handleBrowse}
						class="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
					>
						{getLocale() === 'bg' 
							? 'Продължете без акаунт →'
							: 'Continue without account →'}
					</button>
				</div>
				
				<!-- Cookie consent section -->
				{#if cookiesAccepted === null}
					<div class="border-t pt-6">
						<h3 class="font-semibold text-gray-900 mb-2">
							🍪 {getLocale() === 'bg' ? 'Бисквитки' : 'Cookies'}
						</h3>
						<p class="text-sm text-gray-600 mb-4">
							{getLocale() === 'bg'
								? 'Използваме бисквитки, за да подобрим вашето изживяване и да анализираме трафика на сайта.'
								: 'We use cookies to improve your experience and analyze site traffic.'}
						</p>
						<div class="flex gap-3">
							<button
								onclick={handleAcceptCookies}
								class="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
							>
								{getLocale() === 'bg' ? 'Приемам' : 'Accept'}
							</button>
							<button
								onclick={handleRejectCookies}
								class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
							>
								{getLocale() === 'bg' ? 'Отказвам' : 'Reject'}
							</button>
						</div>
					</div>
				{:else}
					<div class="border-t pt-4">
						<p class="text-xs text-gray-500 text-center">
							{#if cookiesAccepted}
								✓ {getLocale() === 'bg' ? 'Бисквитките са приети' : 'Cookies accepted'}
							{:else}
								✓ {getLocale() === 'bg' ? 'Бисквитките са отказани' : 'Cookies rejected'}
							{/if}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure modal is always on top */
	:global(body:has(.fixed[class*="z-[9999]"])) {
		overflow: hidden;
	}
</style>