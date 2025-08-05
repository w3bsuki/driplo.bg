<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/auth';
	import type { PageData } from './$types';
	import ProfileSetupWizard from '$lib/components/onboarding/ProfileSetupWizard.svelte';
	
	let { data }: { data: PageData } = $props();
	let showSetup = $state(false);
	let loading = $state(true);
	
	onMount(async () => {
		// Only show onboarding for authenticated users
		if (!$user) {
			goto('/login');
			return;
		}
		
		// Check if profile setup is already completed
		if (data.user?.profile?.onboarding_completed) {
			// Profile already set up, redirect to home
			goto('/');
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
			console.log('Starting onboarding completion for user:', $user?.id);
			console.log('Form data received:', formData);
			
			// Prepare all profile data for final save
			const profileUpdate: any = { 
				onboarding_completed: true,
				onboarding_step: 99, // Set to high number to indicate completion
				setup_completed: true,
				needs_username_setup: false // Ensure this is false
			};
			
			// Add all form data if provided
			if (formData) {
				// Basic info
				if (formData.username) profileUpdate.username = formData.username.toLowerCase();
				if (formData.fullName) profileUpdate.full_name = formData.fullName;
				if (formData.bio) profileUpdate.bio = formData.bio;
				if (formData.location) profileUpdate.location = formData.location;
				if (formData.accountType) profileUpdate.account_type = formData.accountType;
				if (formData.avatarUrl) profileUpdate.avatar_url = formData.avatarUrl;
				
				// Payment info
				if (formData.paymentMethods && formData.paymentMethods.length > 0) {
					profileUpdate.payment_methods = formData.paymentMethods;
				}
				if (formData.revolut_tag) profileUpdate.revolut_tag = formData.revolut_tag;
				if (formData.paypal_tag) profileUpdate.paypal_tag = formData.paypal_tag;
			}
			
			console.log('Updating profile with:', profileUpdate);
			
			// Use the database function to ensure it completes properly
			const { data: functionResult, error: updateError } = await data.supabase
				.rpc('complete_user_onboarding', {
					p_user_id: $user!.id,
					p_username: formData?.username || 'user' + Date.now(),
					p_full_name: formData?.fullName || 'User',
					p_account_type: formData?.accountType || 'personal'
				});

			if (updateError) {
				console.error('Database error completing onboarding:', updateError);
				console.error('Update error details:', {
					code: updateError.code,
					message: updateError.message,
					details: updateError.details,
					hint: updateError.hint
				});
				
				// Fallback: Try direct update
				const { error: fallbackError } = await data.supabase
					.from('profiles')
					.update(profileUpdate)
					.eq('id', $user!.id);
				
				if (fallbackError) {
					alert(`Failed to complete onboarding: ${fallbackError.message}`);
					loading = false;
					return;
				}
			}

			console.log('Profile updated successfully via function');
			
			// Now fetch the updated profile separately
			const { data: updatedProfile, error: fetchError } = await data.supabase
				.from('profiles')
				.select('*')
				.eq('id', $user!.id)
				.single();
			
			if (fetchError || !updatedProfile) {
				console.error('Failed to fetch updated profile:', fetchError);
				// Continue anyway, the update succeeded
			} else {
				// Update the auth context with new profile data
				// Profile updated successfully;
				console.log('Profile fetched:', updatedProfile);
			}
			
			// Reload the profile to ensure all data is fresh
			if ($user) {
				const freshProfile = await auth.loadProfile($user.id);
				console.log('Fresh profile loaded:', freshProfile);
			}
			
			console.log('Onboarding marked as complete, redirecting to home...');
			
			// Show success toast
			const { toast } = await import('svelte-sonner');
			toast.success('Welcome to Driplo! 🎉', { duration: 3000 });
			
			// Small delay to let the user see the success message
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// Force invalidate all data
			await invalidateAll();
			
			// Force a hard browser refresh to ensure hooks.server.ts gets fresh data
			// This is necessary because Supabase cache might return stale data
			console.log('Forcing hard refresh to homepage...');
			window.location.href = '/';
		} catch (err) {
			console.error('Onboarding completion error:', err);
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
{:else if showSetup && $user}
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
			user={$user} 
			profile={data.user?.profile}
			onComplete={handleComplete}
		/>
	</div>
{/if}