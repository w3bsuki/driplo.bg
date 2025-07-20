<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { toast } from 'svelte-sonner';
	import { ChevronLeft, ChevronRight, Check, User, Palette, Building2, Sparkles } from 'lucide-svelte';
	import AccountTypeSelector from './AccountTypeSelector.svelte';
	import AvatarPicker from './AvatarPicker.svelte';
	import PersonalInfoForm from './PersonalInfoForm.svelte';
	import BrandInfoForm from './BrandInfoForm.svelte';
	import SetupComplete from './SetupComplete.svelte';
	import type { User } from '@supabase/supabase-js';

	interface Props {
		user: User;
		initialStep?: number;
	}

	let { user, initialStep = 1 }: Props = $props();

	const STEPS = [
		{ id: 1, name: 'Account Type', icon: User, component: AccountTypeSelector },
		{ id: 2, name: 'Choose Avatar', icon: Palette, component: AvatarPicker },
		{ id: 3, name: 'Profile Info', icon: User, component: PersonalInfoForm },
		{ id: 4, name: 'Brand Info', icon: Building2, component: BrandInfoForm, conditional: true },
		{ id: 5, name: 'Complete', icon: Sparkles, component: SetupComplete }
	];

	let currentStep = $state(initialStep);
	let loading = $state(false);
	let setupData = $state({
		accountType: 'personal' as 'personal' | 'brand',
		avatarStyle: 'avataaars',
		avatarSeed: user.id,
		customAvatarUrl: null as string | null,
		fullName: '',
		bio: '',
		location: '',
		brandName: '',
		brandCategory: '',
		brandDescription: '',
		socialMediaAccounts: [] as Array<{ platform: string; username: string; url?: string }>
	});

	// Filter steps based on account type
	const activeSteps = $derived(
		STEPS.filter(step => !step.conditional || (step.id === 4 && setupData.accountType === 'brand'))
	);

	const currentStepIndex = $derived(
		activeSteps.findIndex(step => step.id === currentStep)
	);

	const isLastStep = $derived(
		currentStepIndex === activeSteps.length - 1
	);

	const canProceed = $derived.by(() => {
		switch (currentStep) {
			case 1:
				return true; // Account type always has a default
			case 2:
				return setupData.avatarStyle && setupData.avatarSeed;
			case 3:
				return setupData.fullName && setupData.fullName.length >= 2;
			case 4:
				return setupData.brandName && setupData.brandCategory;
			default:
				return true;
		}
	});

	async function saveProgress(stepName: string, data: any = {}) {
		try {
			const { error } = await supabase
				.from('profile_setup_progress')
				.upsert({
					user_id: user.id,
					step_name: stepName,
					completed: true,
					completed_at: new Date().toISOString(),
					data
				}, {
					onConflict: 'user_id,step_name'
				});

			if (error) throw error;
		} catch (error: any) {
			console.error('Error saving progress:', error);
		}
	}

	async function handleNext() {
		if (!canProceed) return;

		loading = true;
		try {
			// Save progress for current step
			switch (currentStep) {
				case 1:
					await saveProgress('account_type_selected', { 
						account_type: setupData.accountType 
					});
					break;
				case 2:
					await saveProgress('avatar_selected', {
						avatar_style: setupData.avatarStyle,
						avatar_seed: setupData.avatarSeed,
						custom_avatar_url: setupData.customAvatarUrl
					});
					// Update profile with avatar info
					await supabase
						.from('profiles')
						.update({
							avatar_style: setupData.avatarStyle,
							avatar_seed: setupData.avatarSeed,
							custom_avatar_url: setupData.customAvatarUrl,
							setup_started_at: new Date().toISOString()
						})
						.eq('id', user.id);
					break;
				case 3:
					await saveProgress('profile_info_completed', {
						full_name: setupData.fullName,
						bio: setupData.bio,
						location: setupData.location
					});
					// Update profile with basic info
					await supabase
						.from('profiles')
						.update({
							full_name: setupData.fullName,
							bio: setupData.bio,
							location: setupData.location,
							account_type: setupData.accountType
						})
						.eq('id', user.id);
					break;
				case 4:
					// Submit brand verification request
					const { data: brandRequest, error: brandError } = await supabase
						.from('brand_verification_requests')
						.insert({
							user_id: user.id,
							brand_name: setupData.brandName,
							brand_category: setupData.brandCategory,
							social_media_accounts: setupData.socialMediaAccounts
						})
						.select()
						.single();

					if (brandError) throw brandError;

					await saveProgress('brand_info_submitted', {
						brand_request_id: brandRequest.id
					});

					// Save social media accounts
					if (setupData.socialMediaAccounts.length > 0) {
						const socialAccounts = setupData.socialMediaAccounts.map(account => ({
							user_id: user.id,
							platform: account.platform,
							username: account.username,
							url: account.url
						}));

						await supabase
							.from('social_media_accounts')
							.insert(socialAccounts);
					}
					break;
			}

			// Move to next step
			const nextStepIndex = currentStepIndex + 1;
			if (nextStepIndex < activeSteps.length) {
				currentStep = activeSteps[nextStepIndex].id;
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to save progress');
		} finally {
			loading = false;
		}
	}

	function handleBack() {
		if (currentStepIndex > 0) {
			currentStep = activeSteps[currentStepIndex - 1].id;
		}
	}

	async function handleComplete() {
		loading = true;
		try {
			// Mark profile as setup completed
			await supabase
				.from('profiles')
				.update({
					setup_completed: true,
					setup_completed_at: new Date().toISOString()
				})
				.eq('id', user.id);

			toast.success('Profile setup complete!');
			goto('/');
		} catch (error: any) {
			toast.error(error.message || 'Failed to complete setup');
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		// Load any existing progress
		const { data: progress } = await supabase
			.from('profile_setup_progress')
			.select('*')
			.eq('user_id', user.id);

		if (progress && progress.length > 0) {
			// Restore saved data
			progress.forEach(step => {
				if (step.data) {
					Object.assign(setupData, step.data);
				}
			});
		}

		// Load existing profile data
		const { data: profile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (profile) {
			if (profile.full_name) setupData.fullName = profile.full_name;
			if (profile.bio) setupData.bio = profile.bio;
			if (profile.location) setupData.location = profile.location;
			if (profile.avatar_style) setupData.avatarStyle = profile.avatar_style;
			if (profile.avatar_seed) setupData.avatarSeed = profile.avatar_seed;
			if (profile.custom_avatar_url) setupData.customAvatarUrl = profile.custom_avatar_url;
		}
	});
</script>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Progress Bar -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				{#each activeSteps as step, index}
					{@const isActive = currentStepIndex === index}
					{@const isCompleted = currentStepIndex > index}
					<div class="flex items-center {index < activeSteps.length - 1 ? 'flex-1' : ''}">
						<div class="relative">
							<div 
								class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
									{isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : 
									 isCompleted ? 'bg-green-500 text-white' : 
									 'bg-gray-200 text-gray-500'}"
							>
								{#if isCompleted}
									<Check class="w-6 h-6" />
								{:else}
									<svelte:component this={step.icon} class="w-6 h-6" />
								{/if}
							</div>
							<span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap
								{isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}">
								{step.name}
							</span>
						</div>
						{#if index < activeSteps.length - 1}
							<div class="flex-1 h-1 mx-4 rounded-full overflow-hidden bg-gray-200">
								<div 
									class="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-500"
									style="width: {isCompleted ? '100%' : '0%'}"
								></div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Step Content -->
		<div class="mt-12 bg-white rounded-xl shadow-lg p-8">
			{#key currentStep}
				<div class="animate-fade-in">
					{#if currentStep === 1}
						<AccountTypeSelector bind:accountType={setupData.accountType} />
					{:else if currentStep === 2}
						<AvatarPicker 
							bind:avatarStyle={setupData.avatarStyle}
							bind:avatarSeed={setupData.avatarSeed}
							bind:customAvatarUrl={setupData.customAvatarUrl}
							userId={user.id}
						/>
					{:else if currentStep === 3}
						<PersonalInfoForm 
							bind:fullName={setupData.fullName}
							bind:bio={setupData.bio}
							bind:location={setupData.location}
						/>
					{:else if currentStep === 4}
						<BrandInfoForm 
							bind:brandName={setupData.brandName}
							bind:brandCategory={setupData.brandCategory}
							bind:brandDescription={setupData.brandDescription}
							bind:socialMediaAccounts={setupData.socialMediaAccounts}
						/>
					{:else if currentStep === 5}
						<SetupComplete 
							accountType={setupData.accountType}
							avatarStyle={setupData.avatarStyle}
							avatarSeed={setupData.avatarSeed}
							fullName={setupData.fullName}
						/>
					{/if}
				</div>
			{/key}

			<!-- Navigation Buttons -->
			<div class="flex justify-between items-center mt-8 pt-6 border-t">
				<button
					onclick={handleBack}
					disabled={currentStepIndex === 0}
					class="flex items-center gap-2 px-6 py-3 text-gray-700 font-medium rounded-lg
						hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
						transition-all duration-200"
				>
					<ChevronLeft class="w-5 h-5" />
					Back
				</button>

				{#if isLastStep}
					<button
						onclick={handleComplete}
						disabled={loading}
						class="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600
							text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105
							disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
					>
						{#if loading}
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<Sparkles class="w-5 h-5" />
						{/if}
						Complete Setup
					</button>
				{:else}
					<button
						onclick={handleNext}
						disabled={!canProceed || loading}
						class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
							hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
							transition-all duration-200"
					>
						{#if loading}
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{:else}
							Next
							<ChevronRight class="w-5 h-5" />
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>