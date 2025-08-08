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
	import { logger } from '$lib/utils/logger';

	interface Props {
		user: User;
		profile: Tables<'profiles'>;
		onComplete: (formData?: any) => void | Promise<void>;
		initialStep?: number;
	}

	let { user, profile, onComplete, initialStep = 1 }: Props = $props();
	
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

	// Current step state - use index-based navigation instead of ID-based
	let currentStepIndex = $state(0);
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
		
		// Ensure unique IDs for each step in the final list
		return steps.map((step, index) => ({
			...step,
			uid: index, // Unique identifier for this step position
			runtimeId: index + 1 // For display purposes
		}));
	});

	const currentStep = $derived(activeSteps[currentStepIndex]);

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


	// Handle step navigation using server actions
	async function handleNext() {
		if (!canProceed || loading) return;

		loading = true;
		try {
			const stepData = activeSteps[currentStepIndex];
			
			// Prepare step data to save
			const stepFormData: any = { 
				stepNumber: stepData.runtimeId,
				stepName: stepData.name 
			};
			
			// Add step-specific data
			switch (stepData.name) {
				case 'Username':
					stepFormData.username = $form.username;
					break;
				case 'Account Type':
					stepFormData.accountType = $form.accountType;
					break;
				case 'Profile':
					stepFormData.fullName = $form.fullName;
					stepFormData.bio = $form.bio;
					stepFormData.location = $form.location;
					stepFormData.avatarUrl = $form.avatarUrl;
					break;
				case 'Payment':
					stepFormData.paymentMethods = $form.paymentMethods;
					stepFormData.revolut_tag = $form.revolut_tag;
					stepFormData.paypal_tag = $form.paypal_tag;
					break;
			}

			// Save step using server action
			const formData = new FormData();
			formData.append('stepData', JSON.stringify(stepFormData));
			formData.append('stepNumber', stepData.runtimeId.toString());

			const response = await fetch('?/saveStep', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			
			if (!result.success) {
				throw new Error(result.error || 'Failed to save step');
			}

			// Handle brand profile creation separately
			if (stepData.name === 'Brand Info' && $form.accountType === 'brand') {
				const brandFormData = new FormData();
				brandFormData.append('brandData', JSON.stringify({
					brandName: $form.brandName,
					brandDescription: $form.brandDescription,
					socialMediaAccounts: $form.socialMediaAccounts
				}));

				const brandResponse = await fetch('?/createBrand', {
					method: 'POST',
					body: brandFormData
				});

				const brandResult = await brandResponse.json();
				
				if (!brandResult.success) {
					throw new Error(brandResult.error || 'Failed to create brand profile');
				}
			}

			// Mark step as completed
			completedSteps = [...completedSteps, currentStepIndex];
			
			// Move to next step
			if (!isLastStep) {
				currentStepIndex = currentStepIndex + 1;
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
			currentStepIndex = currentStepIndex - 1;
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
			
			// Complete onboarding using server action
			const formData = new FormData();
			formData.append('finalData', JSON.stringify($form));

			const response = await fetch('?/complete', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			
			if (!result.success) {
				throw new Error(result.error || 'Failed to complete onboarding');
			}

			// Call the parent completion handler
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
				currentStepIndex = 0;
				completedSteps = [];
			} else if (profile.onboarding_step && profile.onboarding_step > 0) {
				// Resume from last step only if username is already set
				// Convert database step number to index (step number - 1)
				currentStepIndex = Math.min(profile.onboarding_step - 1, activeSteps.length - 1);
				// Mark previous steps as completed by index
				completedSteps = Array.from({ length: profile.onboarding_step - 1 }, (_, i) => i);
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
			{#key currentStep?.uid}
				<div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
					<!-- Step Title -->
					<h2 class="text-lg font-medium text-gray-900 mb-4">
						{currentStep?.name}
					</h2>

					<!-- Step Content Area -->
					<div class="relative">
						{#if currentStep?.name === 'Username'}
							<UsernameSetup 
								bind:username={$form.username}
								{user}
							/>
						{:else if currentStep?.name === 'Account Type'}
							<AccountTypeSelector 
								bind:accountType={$form.accountType}
							/>
						{:else if currentStep?.name === 'Profile'}
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
						{:else if currentStep?.name === 'Payment'}
							<PaymentMethodSetup 
								bind:selectedMethods={$form.paymentMethods}
								bind:revolut_tag={$form.revolut_tag}
								bind:paypal_tag={$form.paypal_tag}
							/>
						{:else if currentStep?.name === 'Brand Info'}
							<BrandInfoForm 
								bind:brandName={$form.brandName}
								bind:brandDescription={$form.brandDescription}
								bind:socialMediaAccounts={$form.socialMediaAccounts}
							/>
						{:else if currentStep?.name === 'Complete'}
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