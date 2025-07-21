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
	let showPaymentSetup = $state(false)
	
	// Initialize superForm
	const form = superForm($page.data.form, {
		dataType: 'json',
		multipleSubmits: 'prevent',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Clear saved form data on successful submission
				clearFormData('create_listing')
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
		// Load persisted form data
		const savedData = loadFormData<any>('create_listing')
		if (savedData && Object.keys(savedData).length > 0) {
			// Merge saved data with current form data
			Object.assign($formData, savedData)
		} else {
			// Make sure default values are set
			if (!$formData.shipping_type) {
				$formData.shipping_type = 'standard'
			}
		}
		
		await loadCategories()
		await checkPaymentAccount()
	})
	
	// Auto-save form data with debouncing
	const saveForm = debounce(() => {
		saveFormData('create_listing', $formData)
	}, 1000)
	
	// Watch for form changes and auto-save
	$effect(() => {
		// Only save if form has been modified
		if ($formData.title || $formData.description || $formData.price) {
			saveForm()
		}
	})
	
	async function loadCategories() {
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
			// Show specific validation error
			const firstError = validationResult.error.errors[0]
			toast.error(firstError?.message || 'Please fill in all required fields')
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
				<h1 class="text-lg font-semibold">{m.listing_create_title()}</h1>
				<div class="w-5 h-5" />
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
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	{#if isCheckingPayment}
		<div class="flex-1 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
				<p class="text-gray-600 text-sm">Checking payment account...</p>
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
				<div class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-20" role="navigation" aria-label="Form navigation">
					<div class="max-w-lg mx-auto flex gap-2">
						{#if currentStep > 1}
							<Button
								type="button"
								variant="outline"
								onclick={prevStep}
								class="flex-1"
							>
								← {m.listing_btn_previous()}
							</Button>
						{/if}
						
						{#if currentStep < totalSteps}
							<Button
								type="button"
								onclick={nextStep}
								class="flex-1 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white"
							>
								{m.listing_btn_next()} →
							</Button>
						{:else}
							<Button
								type="submit"
								disabled={$submitting || !isStep4Valid}
								class="flex-1 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white"
							>
								{#if $submitting}
									{m.listing_creating()}
								{:else}
									✨ {m.listing_btn_publish()}
								{/if}
							</Button>
						{/if}
					</div>
				</div>
			</form>
		</div>
	{/if}
</div>