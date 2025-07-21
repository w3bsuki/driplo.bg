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

<div class="min-h-[100dvh] bg-gradient-to-b from-blue-50/30 to-white flex flex-col supports-[height:100dvh]:min-h-[100dvh]">
	<!-- Header -->
	<div class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-blue-100/50 flex-shrink-0">
		<div class="w-full px-4">
			<div class="flex items-center justify-between py-3">
				<button 
					onclick={() => goto('/sell')}
					class="p-2 -m-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
				>
					<span class="text-lg">←</span>
				</button>
				<div class="flex items-center gap-3">
					<h1 class="text-lg font-semibold">{m.listing_create_title()}</h1>
					{#if draftStatus !== 'idle'}
						<div class="flex items-center gap-1 text-xs">
							{#if draftStatus === 'saving'}
								<span class="animate-pulse">☁️</span>
								<span class="text-gray-600">Saving...</span>
							{:else if draftStatus === 'saved'}
								<span>✅</span>
								<span class="text-gray-600">
									{#if lastSaved}
										Saved {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
											Math.round((lastSaved.getTime() - Date.now()) / 60000),
											'minute'
										)}
									{:else}
										Saved
									{/if}
								</span>
							{:else if draftStatus === 'error'}
								<span>⚠️</span>
								<span class="text-red-600">Save failed</span>
							{/if}
						</div>
					{/if}
				</div>
				<div class="w-5 h-5"></div>
			</div>
			
			<!-- Progress Bar -->
			{#if !showPaymentSetup}
				<div class="pb-3">
					<div class="flex items-center justify-between mb-2">
						<span class="text-xs text-gray-600">{m.listing_step_of({ step: currentStep, total: totalSteps })}</span>
						<span class="text-xs font-medium">{stepTitle}</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-1.5" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps} aria-label="Form progress">
						<div 
							class="bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] h-1.5 rounded-full transition-all duration-300"
							style="width: {stepProgress}%"
						></div>
					</div>
					<!-- Step indicators with validation status -->
					<div class="flex justify-between mt-3">
						{#each Array(totalSteps) as _, step}
							{@const stepNum = step + 1}
							{@const isComplete = stepNum < currentStep}
							{@const isCurrent = stepNum === currentStep}
							{@const hasError = 
								(stepNum === 1 && !isStep1Valid && currentStep > 1) ||
								(stepNum === 2 && !isStep2Valid && currentStep > 2) ||
								(stepNum === 3 && !isStep3Valid && currentStep > 3) ||
								(stepNum === 4 && !isStep4Valid && currentStep > 4)
							}
							<div class="flex flex-col items-center">
								<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
									{isComplete && !hasError ? 'bg-green-500 text-white' : ''}
									{isCurrent ? 'bg-[#87CEEB] text-white' : ''}
									{hasError ? 'bg-red-500 text-white' : ''}
									{!isComplete && !isCurrent && !hasError ? 'bg-gray-300 text-gray-600' : ''}
								">
									{#if isComplete && !hasError}
										✓
									{:else if hasError}
										!
									{:else}
										{stepNum}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	{#if isCheckingPayment || isLoadingCategories}
		<div class="flex-1 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
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
		<div class="flex-1 w-full px-4 py-4">
			<div class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
				<div class="flex items-center gap-2 text-yellow-800">
					<AlertCircle class="w-4 h-4" />
					<span class="font-semibold text-sm">Payment Account Required</span>
				</div>
				<p class="text-xs text-yellow-700 mt-1">
					You need to set up a payment account before creating listings.
				</p>
			</div>
			
			<PaymentAccountSetup on:success={handlePaymentAccountSetup} />
		</div>
	{:else}
		<div class="flex-1 w-full px-4 py-6 overflow-y-auto pb-32">
			<form 
				method="POST" 
				action="?/createListing"
				use:enhance
				aria-label={m.listing_create_title()}
				bind:this={formElement}
			>
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
				
				<!-- Hidden inputs for all form data to ensure proper submission -->
				<input type="hidden" name="title" value={$formData.title || ''} />
				<input type="hidden" name="description" value={$formData.description || ''} />
				<input type="hidden" name="category_id" value={$formData.category_id || ''} />
				<input type="hidden" name="subcategory_id" value={$formData.subcategory_id || ''} />
				<input type="hidden" name="price" value={$formData.price || 0} />
				<input type="hidden" name="condition" value={$formData.condition || 'new'} />
				<input type="hidden" name="color" value={$formData.color || ''} />
				<input type="hidden" name="brand" value={$formData.brand || ''} />
				<input type="hidden" name="size" value={$formData.size || ''} />
				<input type="hidden" name="location_city" value={$formData.location_city || ''} />
				<input type="hidden" name="shipping_type" value={$formData.shipping_type || 'standard'} />
				<input type="hidden" name="shipping_cost" value={$formData.shipping_cost || 0} />
				<input type="hidden" name="ships_worldwide" value={$formData.ships_worldwide || false} />
				
				<!-- Hidden inputs for array fields -->
				{#each $formData.images || [] as image}
					<input type="hidden" name="images" value={image} />
				{/each}
				{#each $formData.tags || [] as tag}
					<input type="hidden" name="tags" value={tag} />
				{/each}
				{#each $formData.materials || [] as material}
					<input type="hidden" name="materials" value={material} />
				{/each}
				
				<!-- Navigation -->
				<div class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 z-20 safe-area-inset-bottom" role="navigation" aria-label="Form navigation">
					<div class="max-w-lg mx-auto flex gap-3">
						{#if currentStep > 1}
							<Button
								type="button"
								variant="outline"
								onclick={prevStep}
								class="flex-1 min-h-[48px] text-base font-medium touch-manipulation"
							>
								← {m.listing_btn_previous()}
							</Button>
						{/if}
						
						{#if currentStep < totalSteps}
							<Button
								type="button"
								onclick={nextStep}
								class="flex-1 min-h-[48px] text-base font-medium bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white touch-manipulation"
							>
								{m.listing_btn_next()} →
							</Button>
						{:else}
							<Button
								type="button"
								onclick={() => {
									console.log('Preview button clicked');
									console.log('isStep4Valid:', isStep4Valid);
									console.log('Form data:', $formData);
									if (isStep4Valid) {
										showPreview = true;
									} else {
										const result = validateStep4($formData);
										console.log('Validation result:', result);
										if (!result.success) {
											toast.error('Please fill in all required fields: ' + result.error.errors.map(e => e.message).join(', '));
										}
									}
								}}
								disabled={!isStep4Valid}
								class="flex-1 min-h-[48px] text-base font-medium bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-all"
							>
								👀 Preview & Publish
							</Button>
						{/if}
					</div>
				</div>
			</form>
		</div>
	{/if}
	
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
	/* Handle safe area insets for devices with notches */
	.safe-area-inset-bottom {
		padding-bottom: env(safe-area-inset-bottom, 1rem);
	}
	
	/* Improve touch targets on mobile */
	@media (max-width: 640px) {
		:global(input[type="text"]),
		:global(input[type="number"]),
		:global(textarea),
		:global(select) {
			min-height: 48px;
			font-size: 16px; /* Prevents zoom on iOS */
		}
	}
	
	/* Prevent double-tap zoom on buttons */
	:global(.touch-manipulation) {
		touch-action: manipulation;
	}
	
	/* Shake animation for validation errors */
	:global(.animate-shake) {
		animation: shake 0.5s ease-in-out;
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
		20%, 40%, 60%, 80% { transform: translateX(5px); }
	}
</style>