<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/auth';
	import type { PageData } from './$types';
	import ProfileSetupWizard from '$lib/components/onboarding/ProfileSetupWizard.svelte';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime.js';
	
	let { data }: { data: PageData } = $props();
	let showSetup = $state(false);
	let loading = $state(true);
	
	onMount(async () => {
		// Use server-side data instead of client-side stores initially
		// The auth stores might not be initialized yet on first load
		const currentUser = data.user || $user;
		
		// Only show onboarding for authenticated users
		if (!currentUser) {
			const currentLocale = getLocale();
			const localizedLoginUrl = localizeHref('/login', { locale: currentLocale });
			goto(localizedLoginUrl);
			return;
		}
		
		// Check if profile setup is already completed using server data
		if (data.profile?.onboarding_completed) {
			// Profile already set up, redirect to home
			const currentLocale = getLocale();
			const localizedHomeUrl = localizeHref('/', { locale: currentLocale });
			goto(localizedHomeUrl);
			return;
		}
		
		// Check if coming from email verification
		const isNewSignup = $page.url.searchParams.get('new') === 'true';
		
		// Show profile setup wizard
		loading = false;
		showSetup = true;
	});

	async function handleComplete(formData?: any) {
		loading = true;
		try {
			// Show success toast
			const { toast } = await import('svelte-sonner');
			toast.success('Welcome to Driplo! 🎉', { duration: 3000 });
			
			// Small delay to let the user see the success message
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// Force invalidate all data
			await invalidateAll();
			
			// Navigate to localized home page using SvelteKit navigation
			// This maintains client-side state and locale context
			const currentLocale = getLocale();
			const localizedHomeUrl = localizeHref('/', { locale: currentLocale });
			await goto(localizedHomeUrl, { replaceState: true, invalidateAll: true });
		} catch (err) {
			const { logger } = await import('$lib/utils/logger');
			logger.error('Onboarding completion error:', err);
			alert(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Set Up Your Profile | Driplo</title>
</svelte:head>

{#if loading}
	<!-- Loading state -->
	<div class="min-h-screen flex items-center justify-center bg-background">
		<div class="text-center space-y-4">
			<div class="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
			<div>
				<h1 class="text-2xl font-semibold mb-2">Welcome to Driplo</h1>
				<p class="text-muted-foreground">
					{#if showSetup}
						Completing your profile setup...
					{:else}
						Preparing your profile setup...
					{/if}
				</p>
			</div>
		</div>
	</div>
{:else if showSetup && data.user}
	<div class="min-h-[100dvh] bg-background relative">
		{#if loading}
			<!-- Overlay loading state -->
			<div class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
				<div class="text-center space-y-3">
					<div class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
					<div>
						<p class="font-medium">Finalizing your setup...</p>
						<p class="text-sm text-muted-foreground">Please wait while we complete your profile</p>
					</div>
				</div>
			</div>
		{/if}
		<ProfileSetupWizard 
			user={data.user} 
			profile={data.profile}
			onComplete={handleComplete}
		/>
	</div>
{/if}