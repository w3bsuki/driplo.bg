<script lang="ts">
	import { user as authUser } from '$lib/stores/auth';
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
			console.log('Updating profile for user:', user.id, 'with data:', updateData);
			
			// First try to update
			const { count, error: updateError } = await supabase
				.from('profiles')
				.update(updateData)
				.eq('id', user.id)
				.select('*', { count: 'exact', head: true });

			if (updateError) {
				console.error('Step update error:', updateError);
				throw updateError;
			}
			
			if (count === 0) {
				console.log('Profile does not exist, creating new profile for user:', user.id);
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
					console.error('Profile creation error:', insertError);
					throw insertError;
				}
				
				console.log('Profile created successfully');
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

<!-- Premium Modern Layout -->
<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
	<div class="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
		<!-- Premium Header -->
		<div class="text-center mb-12">
			<div class="relative inline-flex items-center justify-center w-20 h-20 mb-6">
				<!-- Gradient background with animated glow -->
				<div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl animate-pulse opacity-20"></div>
				<div class="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
					<Sparkles class="w-8 h-8 text-white" />
				</div>
			</div>
			<h1 class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
				Welcome to Driplo
			</h1>
			<p class="text-lg text-gray-600 max-w-md mx-auto">
				Let's create your perfect fashion profile in just a few simple steps
			</p>
		</div>

		<!-- Enhanced Progress Indicator -->
		<div class="mb-10">
			<div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
				<ModernProgressIndicator 
					steps={activeSteps()}
					{currentStep}
					{completedSteps}
					showLabels={true}
					variant="horizontal"
				/>
			</div>
		</div>

		<!-- Premium Step Content -->
		<div>
			{#key currentStep}
				<div class="relative">
					<!-- Glass morphism card with enhanced styling -->
					<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 sm:p-10 mb-8 transition-all duration-500 hover:shadow-3xl hover:bg-white/85">
						<!-- Gradient overlay for depth -->
						<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
						
						<!-- Premium Step Header -->
						<div class="relative flex items-center gap-4 mb-8 pb-6 border-b border-gray-200/50">
							<!-- Enhanced icon container -->
							<div class="relative">
								<div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
								<div class="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
									<svelte:component 
										this={activeSteps()[currentStepIndex]?.icon || UserIcon} 
										class="w-6 h-6 text-white" 
									/>
								</div>
							</div>
							<div>
								<h2 class="text-2xl font-bold text-gray-900 mb-1">
									{activeSteps()[currentStepIndex]?.name}
								</h2>
								<p class="text-sm text-gray-500">
									Step {currentStepIndex + 1} of {activeSteps().length}
								</p>
							</div>
						</div>

						<!-- Step Content Area -->
						<div class="relative">
							{#if activeSteps()[currentStepIndex]?.name === 'Username'}
								<UsernameSetup 
									bind:username={$form.username}
									{user}
									{supabase}
								/>
							{:else if activeSteps()[currentStepIndex]?.name === 'Account Type'}
								<AccountTypeSelector 
									bind:accountType={$form.accountType}
								/>
							{:else if activeSteps()[currentStepIndex]?.name === 'Profile'}
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
							{:else if activeSteps()[currentStepIndex]?.name === 'Payment'}
								<PaymentMethodSetup 
									bind:selectedMethods={$form.paymentMethods}
									bind:revolut_tag={$form.revolut_tag}
									bind:paypal_tag={$form.paypal_tag}
									{supabase}
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
					</div>
				</div>
			{/key}

			<!-- Premium Navigation -->
			<div class="flex items-center justify-between gap-4">
				<button
					onclick={handleBack}
					disabled={currentStepIndex === 0 || loading}
					class="group flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50 rounded-2xl"
				>
					<ChevronLeft class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
					<span class="font-medium">Back</span>
				</button>

				{#if isLastStep}
					<button
						onclick={handleComplete}
						disabled={loading}
						class="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						<!-- Animated background -->
						<div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
						
						<div class="relative flex items-center gap-3">
							{#if loading}
								<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								<span>Completing Setup...</span>
							{:else}
								<Sparkles class="w-5 h-5" />
								<span>Complete Setup</span>
							{/if}
						</div>
					</button>
				{:else}
					<button
						onclick={handleNext}
						disabled={!canProceed || loading}
						class="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						<!-- Animated background -->
						<div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
						
						<div class="relative flex items-center gap-3">
							{#if loading}
								<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								<span>Saving...</span>
							{:else}
								<span>Continue</span>
								<ChevronRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
							{/if}
						</div>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>