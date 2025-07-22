<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import { superForm } from 'sveltekit-superforms'
	import { toast } from 'svelte-sonner'
	import { 
		ChevronLeft, 
		ChevronRight, 
		Package, 
		Camera, 
		Tag, 
		Truck,
		Check,
		AlertCircle,
		Sparkles,
		Info
	} from 'lucide-svelte'
	import BasicInfoStepV2 from './form/BasicInfoStepV2.svelte'
	import ImageUploadStepV2 from './form/ImageUploadStepV2.svelte'
	import PricingDetailsStepV2 from './form/PricingDetailsStepV2.svelte'
	import ShippingLocationStepV2 from './form/ShippingLocationStepV2.svelte'
	import ListingPreview from './form/ListingPreview.svelte'
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte'
	import type { Database } from '$lib/types/database'
	import * as m from '$lib/paraglide/messages.js'
	import { validateStep1, validateStep2, validateStep3, validateStep4 } from '$lib/schemas/listing'
	import { saveFormData, loadFormData, clearFormData, debounce } from '$lib/utils/form-persistence'
	import { cn } from '$lib/utils'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		supabase: any
	}
	
	let { supabase }: Props = $props()
	
	// Get auth context
	const authContext = getAuthContext()
	
	// Form state
	let currentStep = $state(1)
	let categories = $state<Category[]>([])
	let paymentAccount = $state<any>(null)
	let isCheckingPayment = $state(true)
	let isLoadingCategories = $state(true)
	let showPaymentSetup = $state(false)
	let draftStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle')
	let lastSaved = $state<Date | null>(null)
	let showPreview = $state(false)
	
	// Initialize superForm
	const form = superForm($page.data.form, {
		dataType: 'json',
		multipleSubmits: 'prevent',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Clear saved form data on successful submission
				deleteDraft()
			}
		},
		onError: () => {
			toast.error(m.listing_error_create())
		}
	})
	
	const { form: formData, errors, submitting, message, enhance } = form
	
	const totalSteps = 4
	const stepProgress = $derived((currentStep / totalSteps) * 100)
	
	// Step configuration
	const steps = [
		{ 
			number: 1, 
			title: m.listing_step_basic_info(), 
			icon: Package,
			description: 'Tell us about your item'
		},
		{ 
			number: 2, 
			title: m.listing_step_add_photos(), 
			icon: Camera,
			description: 'Add photos to showcase your item'
		},
		{ 
			number: 3, 
			title: m.listing_step_pricing_details(), 
			icon: Tag,
			description: 'Set your price and details'
		},
		{ 
			number: 4, 
			title: m.listing_step_shipping_location(), 
			icon: Truck,
			description: 'Choose shipping options'
		}
	]
	
	// Validation for each step using Zod schemas
	const isStep1Valid = $derived.by(() => {
		const result = validateStep1($formData)
		return result.success
	})
	
	const isStep2Valid = $derived.by(() => {
		const result = validateStep2($formData)
		return result.success
	})
	
	const isStep3Valid = $derived.by(() => {
		const result = validateStep3($formData)
		return result.success
	})
	
	const isStep4Valid = $derived.by(() => {
		const result = validateStep4($formData)
		return result.success
	})
	
	// Get current step
	const currentStepData = $derived(steps[currentStep - 1])
	
	onMount(async () => {
		// First try to load draft from database
		await loadDraft()
		
		// If no draft in database, check localStorage (migration path)
		if (!lastSaved) {
			const savedData = loadFormData<any>('create_listing')
			if (savedData && Object.keys(savedData).length > 0) {
				Object.assign($formData, savedData)
				// Clear localStorage after migrating to database
				clearFormData('create_listing')
			}
		}
		
		// Make sure default values are set
		if (!$formData.shipping_type) {
			$formData.shipping_type = 'standard'
		}
		
		await loadCategories()
		await checkPaymentAccount()
	})
	
	// Load draft from database
	async function loadDraft() {
		// Only try to load draft if user is authenticated
		if (!authContext?.user) return
		
		try {
			const response = await fetch('/api/drafts/listing')
			if (response.ok) {
				const { draft, updated_at } = await response.json()
				if (draft) {
					Object.assign($formData, draft)
					lastSaved = new Date(updated_at)
					draftStatus = 'saved'
				}
			} else if (response.status === 401) {
				// User not authenticated, skip draft loading
				console.log('User not authenticated, skipping draft load')
			}
		} catch (error) {
			console.error('Failed to load draft:', error)
		}
	}
	
	// Save draft to database
	async function saveDraft() {
		if (draftStatus === 'saving') return
		
		draftStatus = 'saving'
		
		try {
			const response = await fetch('/api/drafts/listing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify($formData)
			})
			
			if (response.ok) {
				const { updated_at } = await response.json()
				lastSaved = new Date(updated_at)
				draftStatus = 'saved'
			} else {
				draftStatus = 'error'
			}
		} catch (error) {
			console.error('Failed to save draft:', error)
			draftStatus = 'error'
			// Fall back to localStorage on error
			saveFormData('create_listing', $formData)
		}
	}
	
	// Delete draft after successful submission
	async function deleteDraft() {
		try {
			await fetch('/api/drafts/listing', { method: 'DELETE' })
			clearFormData('create_listing') // Also clear localStorage
		} catch (error) {
			console.error('Failed to delete draft:', error)
		}
	}
	
	// Auto-save form data with debouncing
	const saveForm = debounce(() => {
		saveDraft()
	}, 2000) // Increased to 2 seconds to reduce API calls
	
	// Watch for form changes and auto-save
	$effect(() => {
		// Only save if form has been modified and user is authenticated
		if (authContext?.user && ($formData.title || $formData.description || $formData.price)) {
			saveForm()
		}
	})
	
	async function loadCategories() {
		isLoadingCategories = true
		try {
			const { data, error } = await supabase
				.from('categories')
				.select('*')
				.is('parent_id', null)
				.eq('is_active', true)
				.order('display_order')
			
			if (error) {
				toast.error(m.listing_error_categories())
				categories = []
			} else {
				categories = data || []
			}
		} finally {
			isLoadingCategories = false
		}
	}
	
	async function checkPaymentAccount() {
		if (!authContext?.user) return
		
		try {
			const response = await fetch('/api/payment/account/setup')
			const data = await response.json()
			
			if (response.ok) {
				paymentAccount = data.payment_account
				if (!data.has_payment_account) {
					showPaymentSetup = true
				}
			} else {
				toast.error('Failed to check payment account')
			}
		} catch (error) {
			console.error('Payment account check failed:', error)
			toast.error('Failed to check payment account')
		} finally {
			isCheckingPayment = false
		}
	}
	
	function handlePaymentAccountSetup(event: CustomEvent) {
		paymentAccount = event.detail
		showPaymentSetup = false
		toast.success('Payment account set up successfully!')
	}
	
	let formElement = $state<HTMLFormElement>()
	
	function nextStep() {
		let isValid = false
		let validationResult: any = null
		
		switch (currentStep) {
			case 1: 
				validationResult = validateStep1($formData)
				isValid = validationResult.success
				break
			case 2: 
				validationResult = validateStep2($formData)
				isValid = validationResult.success
				break
			case 3: 
				validationResult = validateStep3($formData)
				isValid = validationResult.success
				break
			case 4: 
				validationResult = validateStep4($formData)
				isValid = validationResult.success
				break
		}
		
		if (isValid && currentStep < totalSteps) {
			currentStep++
			// Smooth scroll to top
			window.scrollTo({ top: 0, behavior: 'smooth' })
		} else if (!isValid && validationResult?.error) {
			// Show specific validation error with visual feedback
			const firstError = validationResult.error.errors[0]
			toast.error(firstError?.message || 'Please fill in all required fields')
			
			// Add shake animation to form
			if (formElement) {
				formElement.classList.add('animate-shake')
				setTimeout(() => {
					formElement?.classList.remove('animate-shake')
				}, 500)
			}
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}
	
	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		// Alt+Left for previous step
		if (event.altKey && event.key === 'ArrowLeft' && currentStep > 1) {
			event.preventDefault()
			prevStep()
		}
		// Alt+Right for next step
		else if (event.altKey && event.key === 'ArrowRight' && currentStep < totalSteps) {
			event.preventDefault()
			nextStep()
		}
	}
	
	// Show form errors
	$effect(() => {
		if ($message) {
			toast.error($message)
		}
	})
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-50">
	<!-- Modern Header -->
	<div class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
		<div class="container mx-auto px-4">
			<div class="flex items-center justify-between h-16">
				<button 
					onclick={() => goto('/')}
					class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-600 hover:text-gray-900"
				>
					<ChevronLeft class="w-5 h-5" />
					<span class="hidden sm:inline text-sm font-medium">Cancel</span>
				</button>
				
				<div class="flex items-center gap-3">
					<h1 class="text-lg font-semibold text-gray-900">Create Listing</h1>
					{#if draftStatus === 'saving'}
						<span class="text-xs text-gray-500 flex items-center gap-1">
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
							Saving...
						</span>
					{:else if draftStatus === 'saved'}
						<span class="text-xs text-green-600 flex items-center gap-1">
							<Check class="w-3 h-3" />
							Saved
						</span>
					{/if}
				</div>
				
				<div class="w-20"></div>
			</div>
			
			<!-- Beautiful Progress Bar -->
			{#if !showPaymentSetup}
				<div class="pb-4">
					<!-- Step Indicators -->
					<div class="flex items-center justify-between mb-4">
						{#each steps as step}
							{@const isActive = step.number === currentStep}
							{@const isCompleted = step.number < currentStep}
							<button
								type="button"
								onclick={() => {
									if (step.number < currentStep) {
										currentStep = step.number
									}
								}}
								disabled={step.number > currentStep}
								class={cn(
									"flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
									isActive && "bg-primary/10 text-primary",
									isCompleted && "text-green-600 hover:bg-gray-100 cursor-pointer",
									!isActive && !isCompleted && "text-gray-400 cursor-not-allowed"
								)}
							>
								<div class={cn(
									"w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
									isActive && "bg-primary text-white",
									isCompleted && "bg-green-100 text-green-600",
									!isActive && !isCompleted && "bg-gray-100 text-gray-400"
								)}>
									{#if isCompleted}
										<Check class="w-4 h-4" />
									{:else}
										{step.number}
									{/if}
								</div>
								<div class="hidden sm:block text-left">
									<div class="text-xs font-medium">{step.title}</div>
								</div>
							</button>
						{/each}
					</div>
					
					<!-- Progress Bar -->
					<div class="relative">
						<div class="absolute inset-0 bg-gray-200 rounded-full h-2"></div>
						<div 
							class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full h-2 transition-all duration-500 ease-out"
							style="width: {stepProgress}%"
						></div>
						<!-- Sparkle effect at the end -->
						{#if stepProgress < 100}
							<div 
								class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
								style="left: {stepProgress}%"
							>
								<Sparkles class="w-4 h-4 text-primary animate-pulse" />
							</div>
						{/if}
					</div>
					
					<!-- Current Step Info -->
					<div class="mt-4 text-center">
						<div class="flex items-center justify-center gap-2 text-gray-600">
							<svelte:component this={currentStepData.icon} class="w-4 h-4" />
							<span class="text-sm">{currentStepData.description}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	<div class="container mx-auto px-4 py-6 pb-32">
		{#if isCheckingPayment || isLoadingCategories}
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center">
					<div class="relative w-16 h-16 mx-auto mb-4">
						<div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
						<div class="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
							<Package class="w-8 h-8 text-primary animate-pulse" />
						</div>
					</div>
					<p class="text-gray-600 text-sm">
						{#if isCheckingPayment}
							Checking payment account...
						{:else}
							Loading categories...
						{/if}
					</p>
				</div>
			</div>
		{:else if showPaymentSetup}
			<div class="max-w-2xl mx-auto">
				<div class="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
					<div class="flex items-start gap-3">
						<AlertCircle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
						<div>
							<h3 class="font-semibold text-amber-900">Payment Account Required</h3>
							<p class="text-sm text-amber-700 mt-1">
								You need to set up a payment account before creating listings. This ensures you can receive payments for your sales.
							</p>
						</div>
					</div>
				</div>
				
				<PaymentAccountSetup on:success={handlePaymentAccountSetup} />
			</div>
		{:else}
			<form 
				method="POST" 
				action="?/createListing"
				use:enhance
				aria-label={m.listing_create_title()}
				bind:this={formElement}
				class="max-w-2xl mx-auto"
			>
				<!-- Form Content with Card Style -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
					<!-- Step 1: Basic Info -->
					{#if currentStep === 1}
						<BasicInfoStepV2 {form} {categories} />
					{/if}
					
					<!-- Step 2: Images -->
					{#if currentStep === 2}
						<ImageUploadStepV2 
							{form} 
							{supabase} 
							userId={authContext?.user?.id || ''} 
						/>
					{/if}
					
					<!-- Step 3: Pricing & Details -->
					{#if currentStep === 3}
						<PricingDetailsStepV2 {form} {categories} />
					{/if}
					
					<!-- Step 4: Shipping & Location -->
					{#if currentStep === 4}
						<ShippingLocationStepV2 {form} />
					{/if}
				</div>
				
				<!-- Tips Card -->
				<div class="mt-4 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
					<Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
					<div class="text-sm text-blue-800">
						<p class="font-medium mb-1">Pro tip:</p>
						<p>
							{#if currentStep === 1}
								Write a clear, detailed title to help buyers find your item easily.
							{:else if currentStep === 2}
								Good photos are key! Use natural lighting and show your item from multiple angles.
							{:else if currentStep === 3}
								Research similar items to price yours competitively.
							{:else}
								Offering free shipping can increase your chances of making a sale.
							{/if}
						</p>
					</div>
				</div>
				
				<!-- Single hidden input with JSON data -->
				<input type="hidden" name="formData" value={JSON.stringify($formData)} />
			</form>
		{/if}
	</div>
	
	<!-- Beautiful Fixed Navigation -->
	<div class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-4 py-4 z-50 safe-area-pb">
		<div class="container mx-auto max-w-2xl">
			<div class="flex gap-3">
				{#if currentStep > 1}
					<button
						type="button"
						onclick={prevStep}
						class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
					>
						<ChevronLeft class="w-4 h-4" />
						Back
					</button>
				{/if}
				
				{#if currentStep < totalSteps}
					<button
						type="button"
						onclick={nextStep}
						class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
					>
						Continue
						<ChevronRight class="w-4 h-4" />
					</button>
				{:else}
					<button
						type="button"
						onclick={() => {
							if (isStep4Valid) {
								showPreview = true;
							} else {
								const result = validateStep4($formData);
								if (!result.success) {
									toast.error('Please fill in all required fields');
								}
							}
						}}
						disabled={!isStep4Valid}
						class={cn(
							"flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-xl transition-all duration-200 shadow-lg",
							isStep4Valid 
								? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl" 
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						)}
					>
						<Sparkles class="w-4 h-4" />
						Preview & Publish
					</button>
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Listing Preview Modal -->
	<ListingPreview
		formData={$formData}
		user={authContext?.user}
		isOpen={showPreview}
		onClose={() => showPreview = false}
		onEdit={() => showPreview = false}
		onPublish={() => {
			showPreview = false;
			// Submit the form programmatically
			if (formElement) {
				formElement.requestSubmit();
			}
		}}
		isSubmitting={$submitting}
	/>
</div>

<style>
	/* Add safe area padding for iOS */
	.safe-area-pb {
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
	}
	
	/* Shake animation for validation errors */
	:global(.animate-shake) {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}
</style>