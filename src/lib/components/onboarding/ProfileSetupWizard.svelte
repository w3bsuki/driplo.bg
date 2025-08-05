<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { completeOnboardingSchema, defaultOnboardingValues, calculateProgress } from '$lib/schemas/onboarding';
	import type { OnboardingFormData } from '$lib/schemas/onboarding';
	import { 
		ChevronLeft, 
		ChevronRight, 
		Sparkles, 
		User as UserIcon, 
		Building2, 
		AtSign,
		Palette,
		Wallet
	} from 'lucide-svelte';
	
	// Modern form components
	import FormCard from '$lib/components/forms/FormCard.svelte';
	import ModernProgressIndicator from '$lib/components/forms/ModernProgressIndicator.svelte';
	import Button from '$lib/components/ui/button.svelte';
	
	// Step components
	import UsernameSetup from './UsernameSetup.svelte';
	import AccountTypeSelector from './AccountTypeSelector.svelte';
	import AvatarPicker from './AvatarPicker.svelte';
	import PersonalInfoForm from './PersonalInfoForm.svelte';
	import PaymentMethodSetup from './PaymentMethodSetup.svelte';
	import BrandInfoForm from './BrandInfoForm.svelte';
	import SetupComplete from './SetupComplete.svelte';
	
	import type { User, SupabaseClient } from '@supabase/supabase-js';
	import type { Tables } from '$lib/types/database.types';

	interface Props {
		user: User;
		profile: Tables<'profiles'>;
		onComplete: (formData?: any) => void | Promise<void>;
		initialStep?: number;
		supabase?: SupabaseClient;
	}

	let { user, profile, onComplete, initialStep = 1, supabase }: Props = $props();
	
	// Auth state available via stores

	// Check if user needs username setup (no username at all) - make it reactive
	const needsUsernameSetup = $derived(!profile?.username || profile.username === '');
	
	// Define ALL steps properly - 5 steps when username is needed
	const STEPS = needsUsernameSetup ? [
		{ 
			id: 1, 
			name: 'Username', 
			icon: AtSign, 
			component: UsernameSetup,
			conditional: false
		},
		{ 
			id: 2, 
			name: 'Account Type', 
			icon: UserIcon, 
			component: AccountTypeSelector,
			conditional: false
		},
		{ 
			id: 3, 
			name: 'Profile', 
			icon: Palette, 
			component: PersonalInfoForm,
			conditional: false
		},
		{ 
			id: 4, 
			name: 'Payment', 
			icon: Wallet, 
			component: PaymentMethodSetup,
			conditional: false,
			optional: true // Payment is always optional
		},
		{ 
			id: 5, 
			name: 'Complete', 
			icon: Sparkles, 
			component: SetupComplete,
			conditional: false
		}
	] : [
		{ 
			id: 1, 
			name: 'Account Type', 
			icon: UserIcon, 
			component: AccountTypeSelector,
			conditional: false
		},
		{ 
			id: 2, 
			name: 'Profile', 
			icon: Palette, 
			component: PersonalInfoForm,
			conditional: false
		},
		{ 
			id: 3, 
			name: 'Payment', 
			icon: Wallet, 
			component: PaymentMethodSetup,
			conditional: false,
			optional: true
		},
		{ 
			id: 4, 
			name: 'Complete', 
			icon: Sparkles, 
			component: SetupComplete,
			conditional: false
		}
	];

	// Add brand step conditionally
	const getBrandStep = () => ({
		id: needsUsernameSetup ? 5 : 4, // Brand step comes before Complete
		name: 'Brand Info',
		icon: Building2,
		component: BrandInfoForm,
		conditional: true
	});

	// Initialize form with superForm - safely merge profile data
	const initialFormData = {
		...defaultOnboardingValues,
		...(profile ? {
			fullName: profile.full_name || '',
			bio: profile.bio || '',
			location: profile.location || '',
			accountType: profile.account_type || 'personal',
			username: profile.username || ''
		} : {})
	};
	
	const { form, errors, enhance, submitting, validate } = superForm(
		initialFormData,
		{
			SPA: true,
			validators: zodClient(completeOnboardingSchema),
			resetForm: false,
			invalidateAll: false,
			onError: ({ result }) => {
				toast.error(result.error?.message || 'Form validation failed');
			}
		}
	);

	// Current step state - start from 1 if needs username, otherwise from saved step
	let currentStep = $state(profile?.onboarding_step && profile.onboarding_step > 0 && !profile.needs_username_setup ? profile.onboarding_step : 1);
	let loading = $state(false);
	let completedSteps = $state<number[]>([]);

	// Reactive step calculation
	const activeSteps = $derived(() => {
		const steps = [...STEPS];
		
		// Add brand step if account type is brand
		if ($form.accountType === 'brand') {
			const brandStep = getBrandStep();
			steps.splice(-1, 0, brandStep); // Insert before Complete step
		}
		
		return steps;
	});

	const currentStepIndex = $derived(
		activeSteps().findIndex(step => step.id === currentStep)
	);

	const isLastStep = $derived(
		currentStepIndex === activeSteps().length - 1
	);

	const canProceed = $derived.by(() => {
		// Get current step data
		const stepData = activeSteps()[currentStepIndex];
		if (!stepData) return false;

		switch (stepData.name) {
			case 'Username':
				return $form.username && $form.username.length >= 3;
			case 'Account Type':
				return $form.accountType;
			case 'Profile':
				return $form.fullName && $form.fullName.length >= 2;
			case 'Payment':
				// Payment is optional - users can skip this step
				return true;
			case 'Brand Info':
				return $form.brandName && $form.brandDescription;
			case 'Complete':
				return true;
			default:
				return true;
		}
	});

	// Progress calculation
	const progressPercentage = $derived(
		calculateProgress($form)
	);

	// Generate brand slug helper
	async function generateBrandSlug(brandName: string): Promise<string> {
		const baseSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		let slug = baseSlug;
		let counter = 0;
		
		while (true) {
			const client = supabase || auth.supabase;
			const { data } = await client
				.from('brand_profiles')
				.select('id')
				.eq('brand_slug', slug)
				.single();
			
			if (!data) break;
			
			counter++;
			slug = `${baseSlug}-${counter}`;
		}
		
		return slug;
	}

	// Handle step navigation
	async function handleNext() {
		if (!canProceed || loading) return;

		loading = true;
		try {
			const client = supabase || auth.supabase;
			const stepData = activeSteps()[currentStepIndex];
			
			// Save current step data
			const updateData: any = { onboarding_step: currentStep };
			
			switch (stepData.name) {
				case 'Username':
					updateData.username = $form.username?.toLowerCase();
					updateData.needs_username_setup = false; // Mark username as set up
					break;
					
				case 'Account Type':
					updateData.account_type = $form.accountType;
					break;
					
				case 'Profile':
					updateData.full_name = $form.fullName;
					updateData.bio = $form.bio || '';
					updateData.location = $form.location || '';
					break;
					
				case 'Payment':
					// Save payment data to profile
					if ($form.paymentMethods && $form.paymentMethods.length > 0) {
						updateData.payment_methods = $form.paymentMethods;
					}
					if ($form.revolut_tag) {
						updateData.revolut_tag = $form.revolut_tag;
					}
					if ($form.paypal_tag) {
						updateData.paypal_tag = $form.paypal_tag;
					}
					break;
					
				case 'Brand Info':
					if ($form.accountType === 'brand') {
						const brandSlug = await generateBrandSlug($form.brandName!);
						await client.from('brand_profiles').insert({
							user_id: user.id,
							brand_name: $form.brandName,
							brand_slug: brandSlug,
							brand_description: $form.brandDescription,
							instagram_url: $form.socialMediaAccounts?.find(a => a.platform === 'instagram')?.url,
							facebook_url: $form.socialMediaAccounts?.find(a => a.platform === 'facebook')?.url,
							twitter_url: $form.socialMediaAccounts?.find(a => a.platform === 'twitter')?.url,
							tiktok_url: $form.socialMediaAccounts?.find(a => a.platform === 'tiktok')?.url
						});
					}
					break;
			}

			// Update profile - the profile should already exist from auth trigger
			console.log('Updating profile for user:', user.id, 'with data:', updateData);
			
			const { count, error: updateError } = await client
				.from('profiles')
				.update(updateData)
				.eq('id', user.id)
				.select('*', { count: 'exact', head: true });

			if (updateError) {
				console.error('Step update error:', updateError);
				throw updateError;
			}
			
			if (count === 0) {
				console.error('WARNING: No profile was updated for user:', user.id);
				// Profile should exist from auth trigger, but log warning
				console.warn('Profile may not exist - check auth trigger');
			} else {
				console.log('Profile updated successfully');
			}

			console.log('Step saved successfully:', updateData);

			// Mark step as completed
			completedSteps = [...completedSteps, currentStep];
			
			// Move to next step
			if (!isLastStep) {
				currentStep = activeSteps()[currentStepIndex + 1].id;
			}
			
			toast.success('Progress saved!', { duration: 2000 });
		} catch (error: any) {
			console.error('Failed to save step progress:', error);
			toast.error(error.message || 'Failed to save progress. Please try again.');
		} finally {
			loading = false;
		}
	}

	function handleBack() {
		if (currentStepIndex > 0) {
			currentStep = activeSteps()[currentStepIndex - 1].id;
		}
	}

	async function handleComplete() {
		loading = true;
		try {
			console.log('ProfileSetupWizard: Starting completion with form data:', $form);
			
			// Validate required fields before completion
			if (!$form.username || $form.username.length < 3) {
				toast.error('Username is required (minimum 3 characters)');
				loading = false;
				return;
			}
			
			if (!$form.fullName || $form.fullName.length < 2) {
				toast.error('Full name is required (minimum 2 characters)');
				loading = false;
				return;
			}
			
			// Pass all form data to the completion handler
			await onComplete($form);
			// Don't show toast here - let the parent handle it
		} catch (error: any) {
			console.error('ProfileSetupWizard: Completion error:', error);
			toast.error(error.message || 'Failed to complete setup');
			loading = false;
		}
	}

	// Initialize form data from profile
	$effect(() => {
		if (profile) {
			$form.fullName = profile.full_name || '';
			$form.bio = profile.bio || '';
			$form.location = profile.location || '';
			$form.accountType = profile.account_type || 'personal';
			$form.username = profile.username || '';
			
			// Don't resume from saved step if username is not set
			if (profile.needs_username_setup || !profile.username) {
				currentStep = 1;
				completedSteps = [];
			} else if (profile.onboarding_step && profile.onboarding_step > 0) {
				// Resume from last step only if username is already set
				currentStep = Math.min(profile.onboarding_step, activeSteps().length);
				// Mark previous steps as completed
				completedSteps = Array.from({ length: profile.onboarding_step - 1 }, (_, i) => i + 1);
			}
		}
	});
</script>

<!-- Clean Modern Layout -->
<div class="min-h-screen bg-background">
	<div class="container max-w-2xl mx-auto px-4 py-6 sm:py-10">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
				<Sparkles class="w-7 h-7 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight mb-2">
				Welcome to Driplo
			</h1>
			<p class="text-muted-foreground">
				Let's set up your profile in just a few steps
			</p>
		</div>

		<!-- Progress Indicator -->
		<div class="mb-6">
			<ModernProgressIndicator 
				steps={activeSteps()}
				{currentStep}
				{completedSteps}
				showLabels={true}
				variant="horizontal"
			/>
		</div>

		<!-- Step Content -->
		<div>
			{#key currentStep}
				<div class="bg-card rounded-lg border shadow-sm p-6 sm:p-8 mb-6 transition-all duration-300">
					<!-- Step Header -->
					<div class="flex items-center gap-3 mb-6 pb-4 border-b">
						<div class="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
							<svelte:component 
								this={activeSteps()[currentStepIndex]?.icon || UserIcon} 
								class="w-5 h-5 text-primary" 
							/>
						</div>
						<h2 class="text-xl font-semibold">
							{activeSteps()[currentStepIndex]?.name}
						</h2>
					</div>

					<!-- Render current step component -->
					{#if activeSteps()[currentStepIndex]?.name === 'Username'}
						<UsernameSetup 
							bind:username={$form.username}
						/>
					{:else if activeSteps()[currentStepIndex]?.name === 'Account Type'}
						<AccountTypeSelector 
							bind:accountType={$form.accountType}
						/>
					{:else if activeSteps()[currentStepIndex]?.name === 'Profile'}
						<div class="space-y-6">
							<!-- Avatar Picker -->
							<AvatarPicker 
								userId={user.id}
								bind:customAvatarUrl={$form.avatarUrl}
							/>
							
							<!-- Personal Info -->
							<PersonalInfoForm 
								bind:fullName={$form.fullName}
								bind:bio={$form.bio}
								bind:location={$form.location}
							/>
						</div>
					{:else if activeSteps()[currentStepIndex]?.name === 'Payment'}
						<PaymentMethodSetup 
							bind:selectedMethods={$form.paymentMethods}
							bind:revolut_tag={$form.revolut_tag}
							bind:paypal_tag={$form.paypal_tag}
						/>
					{:else if activeSteps()[currentStepIndex]?.name === 'Brand Info'}
						<BrandInfoForm 
							bind:brandName={$form.brandName}
							bind:brandDescription={$form.brandDescription}
							bind:socialMediaAccounts={$form.socialMediaAccounts}
						/>
					{:else if activeSteps()[currentStepIndex]?.name === 'Complete'}
						<SetupComplete 
							accountType={$form.accountType || 'personal'}
							fullName={$form.fullName || ''}
							avatarUrl={$form.avatarUrl}
						/>
					{/if}
				</div>
			{/key}

			<!-- Navigation -->
			<div class="flex items-center justify-between gap-3">
				<Button
					variant="outline"
					onclick={handleBack}
					disabled={currentStepIndex === 0 || loading}
					class="gap-1.5"
				>
					<ChevronLeft class="w-4 h-4" />
					<span class="hidden sm:inline">Back</span>
				</Button>

				{#if isLastStep}
					<Button
						onclick={handleComplete}
						disabled={loading}
						class="gap-2"
					>
						{#if loading}
							<div class="w-4 h-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin"></div>
							Completing...
						{:else}
							<Sparkles class="w-4 h-4" />
							Complete Setup
						{/if}
					</Button>
				{:else}
					<Button
						onclick={handleNext}
						disabled={!canProceed || loading}
						class="gap-1.5"
					>
						{#if loading}
							<div class="w-4 h-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin"></div>
							Saving...
						{:else}
							Next
							<ChevronRight class="w-4 h-4" />
						{/if}
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>