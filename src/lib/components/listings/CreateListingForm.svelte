<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { toast } from 'svelte-sonner'
	import { cn } from '$lib/utils'
	import { 
		ChevronRight, 
		ChevronLeft, 
		Check, 
		X,
		Save,
		Eye,
		Package,
		Camera,
		DollarSign,
		Truck,
		AlertCircle,
		Sparkles
	} from 'lucide-svelte'
	import BasicInfoStep from './form/BasicInfoStep.svelte'
	import ImageUploadStep from './form/ImageUploadStep.svelte'
	import PricingDetailsStep from './form/PricingDetailsStep.svelte'
	import ShippingLocationStep from './form/ShippingLocationStep.svelte'
	import ListingPreview from './form/ListingPreview.svelte'
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte'
	import type { Database } from '$lib/types/database'
	import * as m from '$lib/paraglide/messages.js'
	import { createListingSchema, validateStep1, validateStep2, validateStep3, validateStep4 } from '$lib/schemas/listing'
	import { debounce } from '$lib/utils/form-persistence'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		data: any
		supabase: any
		userId: string
		draftId?: string
	}
	
	let { data, supabase, userId, draftId }: Props = $props()
	
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
	let isMobile = $state(false)
	
	// Initialize superForm
	const form = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			console.log('Form result:', result)
			if (result.type === 'redirect') {
				toast.success('🎉 Listing created successfully!')
				// Clear saved form data on successful submission
				deleteDraft()
			} else if (result.type === 'failure') {
				console.error('Form failure:', result)
				toast.error(result.data?.error || 'Failed to create listing')
			}
		},
		onError: (error) => {
			console.error('Form error:', error)
			toast.error(m.listing_error_create())
		}
	})
	
	const { form: formData, errors, submitting, message, enhance } = form
	
	const totalSteps = 4
	
	// Step configuration with emojis
	const steps = [
		{ 
			id: 1, 
			name: 'Details', 
			emoji: '✏️',
			emojiActive: '📝',
			color: 'blue'
		},
		{ 
			id: 2, 
			name: 'Photos', 
			emoji: '📷',
			emojiActive: '📸',
			color: 'pink'
		},
		{ 
			id: 3, 
			name: 'Pricing', 
			emoji: '💰',
			emojiActive: '💵',
			color: 'green'
		},
		{ 
			id: 4, 
			name: 'Shipping', 
			emoji: '📦',
			emojiActive: '🚚',
			color: 'amber'
		}
	]
	
	// Step validation helper
	function isStepValid(stepId: number): boolean {
		switch (stepId) {
			case 1:
				return !!(
					$formData.title?.trim() && 
					$formData.description?.trim() && 
					$formData.category_id && 
					$formData.condition
				)
			case 2:
				return !!($formData.images && $formData.images.length > 0)
			case 3:
				return !!(
					$formData.price && 
					$formData.price > 0 &&
					$formData.size &&
					$formData.brand &&
					$formData.color
				)
			case 4:
				return !!(
					$formData.location_city?.trim() &&
					$formData.shipping_type
				)
			default:
				return false
		}
	}
	
	// Check if all steps are complete
	let allStepsComplete = $derived(steps.every(step => isStepValid(step.id)))
	
	// Can navigate to step
	function canNavigateToStep(stepId: number): boolean {
		if (stepId === 1) return true
		// Can only go to a step if all previous steps are valid
		for (let i = 1; i < stepId; i++) {
			if (!isStepValid(i)) return false
		}
		return true
	}
	
	// Format saved time
	function formatSavedTime(date: Date): string {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const seconds = Math.floor(diff / 1000)
		
		if (seconds < 60) return 'Just now'
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
		return `${Math.floor(seconds / 3600)}h ago`
	}
	
	onMount(async () => {
		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 768
		}
		
		checkMobile()
		window.addEventListener('resize', checkMobile)
		
		// First try to load draft from database
		await loadDraft()
		
		// Make sure default values are set
		if (!$formData.shipping_type) {
			$formData.shipping_type = 'standard'
		}
		
		await loadCategories()
		await checkPaymentAccount()
		
		return () => {
			window.removeEventListener('resize', checkMobile)
		}
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
			if (draftId) {
				await supabase
					.from('listing_drafts')
					.delete()
					.eq('id', draftId)
					.eq('user_id', userId)
			}
		} catch (error) {
			console.error('Failed to delete draft:', error)
		}
	}
	
	// Auto-save draft functionality
	let saveTimeout: NodeJS.Timeout
	
	$effect(() => {
		// Watch for form changes
		const formValues = $formData
		
		if (draftId && formValues && ($formData.title || $formData.description || $formData.price)) {
			clearTimeout(saveTimeout)
			saveTimeout = setTimeout(() => {
				saveDraft()
			}, 2000)
		}
		
		return () => clearTimeout(saveTimeout)
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
	
	let formElement: HTMLFormElement
	
	// Navigation
	function goToStep(stepId: number) {
		if (canNavigateToStep(stepId)) {
			currentStep = stepId
			// Smooth scroll to top on mobile
			if (isMobile) {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}
		}
	}
	
	function nextStep() {
		if (currentStep < totalSteps && isStepValid(currentStep)) {
			goToStep(currentStep + 1)
		} else if (!isStepValid(currentStep)) {
			const validationResult = currentStep === 1 ? validateStep1($formData) :
									currentStep === 2 ? validateStep2($formData) :
									currentStep === 3 ? validateStep3($formData) :
									validateStep4($formData)
			
			if (!validationResult.success) {
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
	}
	
	function prevStep() {
		if (currentStep > 1) {
			goToStep(currentStep - 1)
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
	<!-- Header -->
	<div class="bg-white sticky top-0 z-20 border-b border-gray-100">
		<div class="max-w-4xl mx-auto px-4 py-2.5 md:py-3">
			<!-- Top Bar -->
			<div class="flex items-center justify-between mb-3">
				<button
					onclick={() => goto('/sell')}
					class="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
					aria-label="Close form"
				>
					<X class="w-5 h-5" />
				</button>
				
				<h1 class="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
					<span class="text-xl">🏷️</span>
					{m.listing_create_title()}
				</h1>
				
				{#if lastSaved}
					<div class="flex items-center gap-1 text-xs text-gray-500">
						<span class="text-sm">💾</span>
						<span class="hidden sm:inline">Saved</span>
						{formatSavedTime(lastSaved)}
					</div>
				{:else}
					<div class="w-16"></div>
				{/if}
			</div>
			
			<!-- Progress Steps -->
			{#if !showPaymentSetup}
				<div class="flex items-center justify-between gap-2 md:gap-4">
					{#each steps as step}
						{@const isActive = currentStep === step.id}
						{@const isComplete = isStepValid(step.id)}
						{@const canNavigate = canNavigateToStep(step.id)}
						
						<button
							onclick={() => goToStep(step.id)}
							disabled={!canNavigate}
							class={cn(
								"flex-1 relative transition-all duration-200",
								canNavigate && "cursor-pointer"
							)}
						>
							<!-- Progress Line (hidden on first step) -->
							{#if step.id > 1}
								<div class="absolute top-5 -left-2 md:-left-4 right-1/2 h-0.5 bg-gray-200">
									<div 
										class={cn(
											"h-full transition-all duration-300",
											isStepValid(step.id - 1) ? "bg-blue-500" : "bg-transparent"
										)}
										style="width: 100%"
									></div>
								</div>
							{/if}
							
							<!-- Step Circle & Info -->
							<div class="relative flex flex-col items-center">
								<div class={cn(
									"w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-200 relative z-10 text-base md:text-lg",
									isActive 
										? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg scale-110 ring-4 ring-blue-100" 
										: isComplete 
											? "bg-gradient-to-br from-green-500 to-green-600" 
											: canNavigate
												? "bg-white border-2 border-gray-300 hover:border-gray-400 hover:scale-105"
												: "bg-gray-50 border-2 border-gray-200"
								)}>
									{#if isComplete && !isActive}
										<span class="text-white">✓</span>
									{:else}
										<span class={isActive || isComplete ? "" : "opacity-60"}>
											{isActive ? step.emojiActive : step.emoji}
										</span>
									{/if}
								</div>
								
								<!-- Step Name -->
								<span class={cn(
									"text-[10px] md:text-xs mt-0.5 font-medium transition-colors",
									isActive 
										? "text-gray-900" 
										: canNavigate 
											? "text-gray-600"
											: "text-gray-400"
								)}>
									{step.name}
								</span>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	<div class="pb-32">
		{#if isCheckingPayment || isLoadingCategories}
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
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
			<div class="max-w-5xl mx-auto px-4 py-6">
				<div class="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
					<div class="flex items-center gap-2 text-amber-800">
						<AlertCircle class="w-4 h-4" />
						<span class="font-semibold text-sm">Payment Account Required</span>
					</div>
					<p class="text-xs text-amber-700 mt-1">
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
				class="max-w-4xl mx-auto"
			>
				<!-- Form Content -->
				<div class="px-4 py-4 md:py-6">
					<!-- Step Content with Animation -->
					<div class="relative min-h-[400px]">
						{#if currentStep === 1}
							<div class="animate-in fade-in slide-in-from-right-5 duration-200">
								<BasicInfoStep {form} {categories} isMobile={isMobile} />
							</div>
						{:else if currentStep === 2}
							<div class="animate-in fade-in slide-in-from-right-5 duration-200">
								<ImageUploadStep 
									{form} 
									{supabase} 
									userId={userId} 
									isMobile={isMobile}
								/>
							</div>
						{:else if currentStep === 3}
							<div class="animate-in fade-in slide-in-from-right-5 duration-200">
								<PricingDetailsStep {form} {categories} isMobile={isMobile} />
							</div>
						{:else if currentStep === 4}
							<div class="animate-in fade-in slide-in-from-right-5 duration-200">
								<ShippingLocationStep {form} isMobile={isMobile} />
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Single hidden input with JSON data -->
				<input type="hidden" name="formData" value={JSON.stringify($formData)} />
			</form>
		{/if}
	</div>
	
	<!-- Bottom Navigation -->
	<div class={cn(
		"bg-white border-t border-gray-200",
		isMobile 
			? "fixed bottom-0 left-0 right-0 px-4 py-3 safe-area-padding-bottom"
			: "sticky bottom-0 py-4"
	)}>
		<div class="max-w-4xl mx-auto px-4 md:px-0">
			<div class="flex gap-3">
				{#if currentStep > 1}
					<button
						type="button"
						onclick={prevStep}
						class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2"
					>
						<ChevronLeft class="w-4 h-4" />
						<span class="hidden sm:inline">Back</span>
					</button>
				{/if}
				
				{#if currentStep < totalSteps}
					<button
						type="button"
						onclick={nextStep}
						disabled={!isStepValid(currentStep)}
						class={cn(
							"flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2",
							isStepValid(currentStep)
								? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						)}
					>
						Continue
						<ChevronRight class="w-4 h-4" />
					</button>
				{:else}
					<button
						type="button"
						onclick={() => showPreview = true}
						disabled={!allStepsComplete || $submitting}
						class={cn(
							"flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2",
							allStepsComplete && !$submitting
								? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						)}
					>
						{#if $submitting}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Creating...
						{:else}
							<Eye class="w-4 h-4" />
							Preview & Publish
						{/if}
					</button>
				{/if}
			</div>
			
			<!-- Progress dots on mobile -->
			{#if isMobile && !showPaymentSetup}
				<div class="flex justify-center gap-1.5 mt-3">
					{#each steps as step}
						<button
							type="button"
							onclick={() => goToStep(step.id)}
							disabled={!canNavigateToStep(step.id)}
							class={cn(
								"h-2 rounded-full transition-all duration-200",
								currentStep === step.id 
									? "w-8 bg-blue-500" 
									: "w-2",
								isStepValid(step.id) 
									? "bg-blue-500" 
									: "bg-gray-300"
							)}
							aria-label={`Go to ${step.name}`}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Preview Modal -->
	<ListingPreview 
		formData={$formData}
		user={authContext?.user}
		isOpen={showPreview}
		onClose={() => showPreview = false}
		onEdit={() => showPreview = false}
		onPublish={() => {
			showPreview = false
			// Submit form
			if (formElement) {
				console.log('Submitting form with data:', $formData)
				formElement.requestSubmit()
			} else {
				console.error('Form element not found')
			}
		}}
		isSubmitting={$submitting}
	/>
</div>

<style>
	.safe-area-padding-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0.75rem);
	}
	
	@keyframes slide-in-from-right-5 {
		from {
			transform: translateX(1.25rem);
		}
		to {
			transform: translateX(0);
		}
	}
	
	.animate-in {
		animation-duration: 200ms;
		animation-fill-mode: both;
	}
	
	.fade-in {
		animation-name: fade-in;
	}
	
	.slide-in-from-right-5 {
		animation-name: slide-in-from-right-5;
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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
	
	/* Ensure proper touch targets on mobile */
	@media (max-width: 640px) {
		:global(button),
		:global(input),
		:global(textarea),
		:global(select) {
			min-height: 44px;
			-webkit-tap-highlight-color: transparent;
		}
	}
</style>