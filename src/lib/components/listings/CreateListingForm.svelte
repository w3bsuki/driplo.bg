<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import { superForm } from 'sveltekit-superforms'
	import { Button } from '$lib/components/ui'
	import { toast } from 'svelte-sonner'
	import { AlertCircle } from 'lucide-svelte'
	import BasicInfoStep from './form/BasicInfoStep.svelte'
	import ImageUploadStep from './form/ImageUploadStep.svelte'
	import PricingDetailsStep from './form/PricingDetailsStep.svelte'
	import ShippingLocationStep from './form/ShippingLocationStep.svelte'
	import ListingPreview from './form/ListingPreview.svelte'
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte'
	import type { Database } from '$lib/types/database'
	import * as m from '$lib/paraglide/messages.js'
	import { validateStep1, validateStep2, validateStep3, validateStep4 } from '$lib/schemas/listing'
	import { saveFormData, loadFormData, clearFormData, debounce } from '$lib/utils/form-persistence'
	import { debugFormSubmission } from '$lib/utils/form-debug'
	
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
		if (!result.success && currentStep === 4) {
			console.log('Step 4 validation failed:', result.error)
			console.log('Form data:', $formData)
		}
		return result.success
	})
	
	// Get step title
	const stepTitle = $derived.by(() => {
		switch (currentStep) {
			case 1: return m.listing_step_basic_info()
			case 2: return m.listing_step_add_photos()
			case 3: return m.listing_step_pricing_details()
			case 4: return m.listing_step_shipping_location()
			default: return ''
		}
	})
	
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

<div class="min-h-screen bg-[var(--color-neutral-50)]">
	<!-- Header -->
	<div class="sticky top-0 z-30 bg-[var(--color-neutral-0)] border-b border-[var(--color-neutral-200)]">
		<div class="w-full px-[var(--space-3)]">
			<div class="flex items-center justify-between h-[var(--space-10)]">
				<button 
					onclick={() => goto('/sell')}
					class="touch-min flex items-center justify-center text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] transition-colors duration-[var(--duration-fast)] rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-100)] active-scale"
				>
					<svg class="w-[var(--space-5)] h-[var(--space-5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="flex items-center gap-[var(--space-2)]">
					<h1 class="text-[var(--text-base)] font-[var(--font-semibold)] text-[var(--color-neutral-900)]">{m.listing_create_title()}</h1>
					{#if draftStatus === 'saved'}
						<span class="text-[var(--text-xs)] text-[var(--color-neutral-500)]">Saved</span>
					{/if}
				</div>
				<div class="w-[var(--space-8)]"></div>
			</div>
			
			<!-- Progress Bar -->
			{#if !showPaymentSetup}
				<div class="pb-[var(--space-2)]">
					<div class="flex items-center justify-between mb-[var(--space-1)]">
						<span class="text-[var(--text-xs)] text-[var(--color-neutral-500)]">Step {currentStep} of {totalSteps}</span>
						<span class="text-[var(--text-xs)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">{stepTitle}</span>
					</div>
					<div class="w-full bg-[var(--color-neutral-200)] rounded-full h-[2px]">
						<div 
							class="bg-[var(--color-primary-500)] h-[2px] rounded-full transition-all duration-[var(--duration-slow)]"
							style="width: {stepProgress}%"
						></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	<div class="pb-[var(--space-20)]">
		{#if isCheckingPayment || isLoadingCategories}
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center">
					<div class="animate-spin rounded-full h-[var(--space-8)] w-[var(--space-8)] border-b-2 border-[var(--color-primary-500)] mx-auto mb-[var(--space-3)]"></div>
					<p class="text-[var(--color-neutral-600)] text-[var(--text-sm)]">
						{#if isCheckingPayment}
							Checking payment account...
						{:else}
							Loading categories...
						{/if}
					</p>
				</div>
			</div>
		{:else if showPaymentSetup}
			<div class="w-full px-[var(--space-3)] py-[var(--space-3)]">
				<div class="mb-[var(--space-3)] bg-[var(--color-warning-light)] border border-[var(--color-warning-main)] rounded-[var(--radius-lg)] p-[var(--space-3)]">
					<div class="flex items-center gap-[var(--space-2)] text-[var(--color-warning-dark)]">
						<AlertCircle class="w-[var(--space-4)] h-[var(--space-4)]" />
						<span class="font-[var(--font-semibold)] text-[var(--text-sm)]">Payment Account Required</span>
					</div>
					<p class="text-[var(--text-xs)] text-[var(--color-warning-dark)] mt-[var(--space-1)]">
						You need to set up a payment account before creating listings.
					</p>
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
			>
				<!-- Form Content -->
				<div class="px-[var(--space-3)] py-[var(--space-2)]">
					<!-- Step 1: Basic Info -->
					{#if currentStep === 1}
						<BasicInfoStep {form} {categories} />
					{/if}
					
					<!-- Step 2: Images -->
					{#if currentStep === 2}
						<ImageUploadStep 
							{form} 
							{supabase} 
							userId={authContext?.user?.id || ''} 
						/>
					{/if}
					
					<!-- Step 3: Pricing & Details -->
					{#if currentStep === 3}
						<PricingDetailsStep {form} {categories} />
					{/if}
					
					<!-- Step 4: Shipping & Location -->
					{#if currentStep === 4}
						<ShippingLocationStep {form} />
					{/if}
				</div>
				
				<!-- Single hidden input with JSON data -->
				<input type="hidden" name="formData" value={JSON.stringify($formData)} />
			</form>
		{/if}
	</div>
	
	<!-- Fixed Navigation -->
	<div class="fixed bottom-0 left-0 right-0 bg-[var(--color-neutral-0)] border-t border-[var(--color-neutral-100)] px-[var(--space-3)] py-[var(--space-2)] z-50" style="padding-bottom: max(env(safe-area-inset-bottom), var(--space-2))">
		<div class="max-w-lg mx-auto flex gap-[var(--space-2)]">
			{#if currentStep > 1}
				<button
					type="button"
					onclick={prevStep}
					class="flex-1 button-size-md font-[var(--font-medium)] text-[var(--color-neutral-700)] bg-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-200)] rounded-[var(--radius-lg)] transition-colors duration-[var(--duration-fast)] active-scale"
				>
					Back
				</button>
			{/if}
			
			{#if currentStep < totalSteps}
				<button
					type="button"
					onclick={nextStep}
					class="flex-1 button-size-md font-[var(--font-medium)] bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-[var(--radius-lg)] transition-all duration-[var(--duration-fast)] active-scale"
				>
					Continue
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
								toast.error('Please fill in all required fields: ' + result.error.errors.map(e => e.message).join(', '));
							}
						}
					}}
					disabled={!isStep4Valid}
					class="flex-1 button-size-md font-[var(--font-medium)] bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-[var(--radius-lg)] transition-all duration-[var(--duration-fast)] active-scale disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Preview & Publish
				</button>
			{/if}
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
	/* Mobile-first optimizations */
	@media (max-width: 640px) {
		/* Ensure minimum touch targets on mobile */
		:global(input[type="text"]),
		:global(input[type="number"]),
		:global(input[type="email"]),
		:global(input[type="tel"]),
		:global(textarea),
		:global(select),
		:global(button) {
			min-height: var(--button-height-md); /* 32px minimum */
			font-size: var(--text-base); /* 14px - prevents zoom on iOS */
			-webkit-appearance: none; /* Remove iOS styling */
		}
		
		/* Compact spacing on mobile */
		:global(.space-y-\[var\(--space-3\)\] > :not([hidden]) ~ :not([hidden])) {
			margin-top: var(--space-2-5); /* Slightly tighter on mobile */
		}
	}
	
	/* Prevent double-tap zoom on all interactive elements */
	:global(button),
	:global(a),
	:global(input),
	:global(select),
	:global(textarea) {
		touch-action: manipulation;
	}
	
	/* Shake animation for validation errors */
	:global(.animate-shake) {
		animation: shake var(--duration-slow) var(--ease-bounce);
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}
	
	/* Optimize for small screens */
	@media (max-width: 375px) {
		:global(.button-size-md) {
			font-size: var(--text-xs);
			padding-inline: var(--space-2);
		}
	}
</style>