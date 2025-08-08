<script lang="ts">
	import { user as authUser } from '$lib/stores/auth';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { isolatedOnboardingDefaults, calculateIsolatedProgress } from '$lib/schemas/onboarding-isolated';
	import type { IsolatedOnboardingFormData } from '$lib/schemas/onboarding-isolated';
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
	import type { Tables } from '$lib/database.types';

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
		...isolatedOnboardingDefaults,
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
	const activeSteps = $derived.by(() => {
		const steps = [...STEPS];
		
		// Add brand step if account type is brand
		if ($form.accountType === 'brand') {
			const brandStep = getBrandStep();
			steps.splice(-1, 0, brandStep); // Insert before Complete step
		}
		
		return steps;
	});

	const currentStepIndex = $derived(
		activeSteps.findIndex(step => step.id === currentStep)
	);

	const isLastStep = $derived(
		currentStepIndex === activeSteps.length - 1
	);

	const canProceed = $derived.by(() => {
		// Get current step data
		const stepData = activeSteps[currentStepIndex];
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
		calculateIsolatedProgress($form)
	);

	// Generate brand slug helper
	async function generateBrandSlug(brandName: string): Promise<string> {
		const baseSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		let slug = baseSlug;
		let counter = 0;
		
		while (true) {
			if (!supabase) {
				throw new Error('Supabase client is not available');
			}
			const { data } = await supabase
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
			if (!supabase) {
				throw new Error('Supabase client is not available');
			}
			const stepData = activeSteps[currentStepIndex];
			
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
						await supabase.from('brand_profiles').insert({
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

			// Update profile - create if doesn't exist, update if it does
			
			// First try to update
			const { count, error: updateError } = await supabase
				.from('profiles')
				.update(updateData)
				.eq('id', user.id)
				.select('*', { count: 'exact', head: true });

			if (updateError) {
				logger.error('Step update error:', updateError);
				throw updateError;
			}
			
			if (count === 0) {
				// Profile doesn't exist, create it
				const createData = {
					id: user.id,
					email: user.email,
					username: updateData.username || null,
					full_name: updateData.full_name || null,
					bio: updateData.bio || null,
					location: updateData.location || null,
					account_type: updateData.account_type || 'personal',
					onboarding_step: updateData.onboarding_step || 1,
					needs_username_setup: updateData.needs_username_setup !== undefined ? updateData.needs_username_setup : true,
					payment_methods: updateData.payment_methods || null,
					revolut_tag: updateData.revolut_tag || null,
					paypal_tag: updateData.paypal_tag || null,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				};
				
				const { error: insertError } = await supabase
					.from('profiles')
					.insert(createData);
					
				if (insertError) {
					logger.error('Profile creation error:', insertError);
					throw insertError;
				}
				
			} else {
			}


			// Mark step as completed
			completedSteps = [...completedSteps, currentStep];
			
			// Move to next step
			if (!isLastStep) {
				currentStep = activeSteps[currentStepIndex + 1].id;
			}
			
			toast.success('Progress saved!', { duration: 2000 });
		} catch (error: any) {
			logger.error('Failed to save step progress:', error);
			toast.error(error.message || 'Failed to save progress. Please try again.');
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
			logger.error('ProfileSetupWizard: Completion error:', error);
			toast.error(error.message || 'Failed to complete setup');
			loading = false;
		}
	}

	// Initialize form data from profile ONCE on mount
	let formInitialized = false;
	$effect(() => {
		if (profile && !formInitialized) {
			formInitialized = true;
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
				currentStep = Math.min(profile.onboarding_step, activeSteps.length);
				// Mark previous steps as completed
				completedSteps = Array.from({ length: profile.onboarding_step - 1 }, (_, i) => i + 1);
			}
		}
	});
</script>

<!-- Simple Clean Layout -->
<div class="min-h-screen bg-white">
	<div class="max-w-2xl mx-auto px-4 py-6">
		<!-- Minimal Header -->
		<div class="text-center mb-6">
			<h1 class="text-xl font-semibold text-gray-900">
				Set up your profile
			</h1>
			<p class="text-sm text-gray-600 mt-1">
				Complete these steps to get started
			</p>
		</div>

		<!-- Simple Progress Bar -->
		<div class="mb-6">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs text-gray-600">Step {currentStepIndex + 1} of {activeSteps.length}</span>
				<span class="text-xs text-gray-600">{Math.round((currentStepIndex / (activeSteps.length - 1)) * 100)}%</span>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-1.5">
				<div 
					class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
					style="width: {(currentStepIndex / (activeSteps.length - 1)) * 100}%"
				></div>
			</div>
		</div>

		<!-- Step Content -->
		<div>
			{#key currentStep}
				<div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
					<!-- Step Title -->
					<h2 class="text-lg font-medium text-gray-900 mb-4">
						{activeSteps[currentStepIndex]?.name}
					</h2>

					<!-- Step Content Area -->
					<div class="relative">
						{#if activeSteps[currentStepIndex]?.name === 'Username'}
							<UsernameSetup 
								bind:username={$form.username}
								{user}
								{supabase}
							/>
						{:else if activeSteps[currentStepIndex]?.name === 'Account Type'}
							<AccountTypeSelector 
								bind:accountType={$form.accountType}
							/>
						{:else if activeSteps[currentStepIndex]?.name === 'Profile'}
							<div class="space-y-8">
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
						{:else if activeSteps[currentStepIndex]?.name === 'Payment'}
							<PaymentMethodSetup 
								bind:selectedMethods={$form.paymentMethods}
								bind:revolut_tag={$form.revolut_tag}
								bind:paypal_tag={$form.paypal_tag}
								{supabase}
							/>
						{:else if activeSteps[currentStepIndex]?.name === 'Brand Info'}
							<BrandInfoForm 
								bind:brandName={$form.brandName}
								bind:brandDescription={$form.brandDescription}
								bind:socialMediaAccounts={$form.socialMediaAccounts}
							/>
						{:else if activeSteps[currentStepIndex]?.name === 'Complete'}
							<SetupComplete 
								accountType={$form.accountType || 'personal'}
								fullName={$form.fullName || ''}
								avatarUrl={$form.avatarUrl}
							/>
						{/if}
					</div>
				</div>
			{/key}

			<!-- Simple Navigation -->
			<div class="flex justify-between">
				<button
					onclick={handleBack}
					disabled={currentStepIndex === 0 || loading}
					class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					← Back
				</button>

				{#if isLastStep}
					<button
						onclick={handleComplete}
						disabled={loading}
						class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Completing...' : 'Complete'}
					</button>
				{:else}
					<button
						onclick={handleNext}
						disabled={!canProceed || loading}
						class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Saving...' : 'Continue →'}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>