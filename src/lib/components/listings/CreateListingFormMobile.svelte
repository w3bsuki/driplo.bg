<script lang="ts">
	import { 
		Camera, 
		Package, 
		DollarSign, 
		Truck, 
		ChevronRight, 
		ChevronLeft,
		Check,
		Sparkles,
		AlertCircle,
		X,
		Save,
		Eye
	} from 'lucide-svelte'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema } from '$lib/schemas/listing'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import * as m from '$lib/paraglide/messages.js'
	import { cn } from '$lib/utils'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	
	// Import step components
	import BasicInfoStepMobile from './form/BasicInfoStepMobile.svelte'
	import ImageUploadStepMobile from './form/ImageUploadStepMobile.svelte'
	import PricingDetailsStepMobile from './form/PricingDetailsStepMobile.svelte'
	import ShippingLocationStepMobile from './form/ShippingLocationStepMobile.svelte'
	import ListingPreview from './form/ListingPreview.svelte'
	
	interface Props {
		data: any
		supabase: any
		userId: string
		draftId?: string
	}
	
	let { data, supabase, userId, draftId }: Props = $props()
	
	const dispatch = createEventDispatcher()
	
	// Form setup
	const form = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('🎉 Listing created successfully!')
			}
		}
	})
	
	const { form: formData, enhance, submitting, errors } = form
	
	// Step management
	let currentStep = $state(1)
	const totalSteps = 4
	
	// Beautiful step configuration with emojis
	const steps = [
		{ 
			id: 1, 
			name: 'Details', 
			icon: '📝',
			component: BasicInfoStepMobile,
			color: 'blue'
		},
		{ 
			id: 2, 
			name: 'Photos', 
			icon: '📸',
			component: ImageUploadStepMobile,
			color: 'pink'
		},
		{ 
			id: 3, 
			name: 'Pricing', 
			icon: '💰',
			component: PricingDetailsStepMobile,
			color: 'green'
		},
		{ 
			id: 4, 
			name: 'Shipping', 
			icon: '📦',
			component: ShippingLocationStepMobile,
			color: 'amber'
		}
	]
	
	let showPreview = $state(false)
	let savingDraft = $state(false)
	let lastSavedTime = $state<Date | null>(null)
	
	// Auto-save draft
	let saveTimeout: NodeJS.Timeout
	$effect(() => {
		// Watch for form changes
		const formValues = $formData
		
		if (draftId && formValues) {
			clearTimeout(saveTimeout)
			saveTimeout = setTimeout(() => {
				saveDraft()
			}, 2000) // Save after 2 seconds of inactivity
		}
		
		return () => clearTimeout(saveTimeout)
	})
	
	async function saveDraft() {
		if (!draftId || savingDraft) return
		
		savingDraft = true
		try {
			const { error } = await supabase
				.from('listing_drafts')
				.update({
					data: $formData,
					updated_at: new Date().toISOString()
				})
				.eq('id', draftId)
				.eq('user_id', userId)
			
			if (!error) {
				lastSavedTime = new Date()
			}
		} catch (e) {
			console.error('Failed to save draft:', e)
		} finally {
			savingDraft = false
		}
	}
	
	// Navigation
	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}
	
	function goToStep(step: number) {
		currentStep = step
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
	
	// Step validation
	function isStepValid(step: number): boolean {
		switch (step) {
			case 1:
				return !!(
					$formData.title && 
					$formData.description && 
					$formData.category_id && 
					$formData.subcategory_id &&
					$formData.condition
				)
			case 2:
				return !!($formData.images && $formData.images.length > 0)
			case 3:
				return !!(
					$formData.price && 
					$formData.price > 0 &&
					$formData.size &&
					$formData.brand
				)
			case 4:
				return !!(
					$formData.location_city &&
					$formData.shipping_type
				)
			default:
				return false
		}
	}
	
	// Check if all steps are complete
	let allStepsComplete = $derived([1, 2, 3, 4].every(step => isStepValid(step)))
	
	// Format time
	function formatSavedTime(date: Date) {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const seconds = Math.floor(diff / 1000)
		
		if (seconds < 60) return 'Just now'
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
		return `${Math.floor(seconds / 3600)}h ago`
	}
	
	// Keyboard navigation
	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.altKey) {
				if (e.key === 'ArrowRight' && currentStep < totalSteps) {
					nextStep()
				} else if (e.key === 'ArrowLeft' && currentStep > 1) {
					prevStep()
				}
			}
		}
		
		window.addEventListener('keydown', handleKeydown)
		return () => window.removeEventListener('keydown', handleKeydown)
	})
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile-First Header with Progress -->
	<div class="bg-white sticky top-0 z-20 shadow-sm">
		<div class="px-4 py-3">
			<!-- Top Bar -->
			<div class="flex items-center justify-between mb-3">
				<button
					onclick={() => goto('/sell')}
					class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<X class="w-5 h-5" />
				</button>
				
				<h1 class="text-lg font-semibold text-gray-900">Create Listing</h1>
				
				{#if lastSavedTime}
					<div class="flex items-center gap-1 text-xs text-gray-500">
						<Save class="w-3 h-3" />
						{formatSavedTime(lastSavedTime)}
					</div>
				{:else}
					<div class="w-16"></div>
				{/if}
			</div>
			
			<!-- Progress Steps -->
			<div class="flex items-center justify-between gap-2">
				{#each steps as step}
					{@const isActive = currentStep === step.id}
					{@const isComplete = isStepValid(step.id)}
					{@const isPast = currentStep > step.id}
					
					<button
						onclick={() => goToStep(step.id)}
						disabled={!isPast && !isActive}
						class={cn(
							"flex-1 relative transition-all duration-200",
							(isPast || isActive) && "cursor-pointer"
						)}
					>
						<!-- Progress Line -->
						<div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
							<div 
								class={cn(
									"h-full transition-all duration-300",
									isPast || isComplete ? "bg-blue-500" : "bg-transparent"
								)}
								style="width: {isPast ? '100%' : isComplete ? '50%' : '0%'}"
							></div>
						</div>
						
						<!-- Step Circle -->
						<div class="relative flex flex-col items-center">
							<div class={cn(
								"w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 relative z-10",
								isActive ? `bg-${step.color}-500 text-white shadow-lg scale-110` :
								isPast || isComplete ? "bg-blue-500 text-white" :
								"bg-white border-2 border-gray-300"
							)}>
								{#if isPast || (isComplete && !isActive)}
									<Check class="w-4 h-4" />
								{:else}
									<span class="text-base">{step.icon}</span>
								{/if}
							</div>
							
							<!-- Step Name -->
							<span class={cn(
								"text-xs mt-1 font-medium transition-colors",
								isActive ? "text-gray-900" : "text-gray-500"
							)}>
								{step.name}
							</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Form Content -->
	<form 
		method="POST" 
		action="?/createListing"
		use:enhance
		class="pb-32" 
	>
		<div class="px-4 py-6">
			<!-- Animated Step Content -->
			<div class="relative">
				{#each steps as step}
					<div 
						class={cn(
							"transition-all duration-300",
							currentStep === step.id 
								? "opacity-100 translate-x-0" 
								: currentStep > step.id 
									? "opacity-0 -translate-x-full absolute" 
									: "opacity-0 translate-x-full absolute"
						)}
					>
						{#if currentStep === step.id}
							<svelte:component 
								this={step.component} 
								{form}
								{supabase}
								{userId}
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</form>
	
	<!-- Fixed Bottom Navigation -->
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-safe">
		<div class="flex gap-3">
			{#if currentStep > 1}
				<button
					onclick={prevStep}
					class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2"
				>
					<ChevronLeft class="w-4 h-4" />
					Back
				</button>
			{/if}
			
			{#if currentStep < totalSteps}
				<button
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
		
		<!-- Quick Step Indicators -->
		<div class="flex justify-center gap-1.5 mt-3">
			{#each steps as step}
				<button
					onclick={() => goToStep(step.id)}
					disabled={currentStep < step.id && !isStepValid(step.id - 1)}
					class={cn(
						"w-2 h-2 rounded-full transition-all duration-200",
						currentStep === step.id 
							? "w-8 bg-blue-500" 
							: isStepValid(step.id) 
								? "bg-blue-500" 
								: "bg-gray-300"
					)}
				/>
			{/each}
		</div>
	</div>
</div>

<!-- Preview Modal -->
{#if showPreview}
	<ListingPreview 
		listing={{
			...$formData,
			profiles: {
				username: $page.data.user?.username || 'You',
				avatar_url: $page.data.user?.avatar_url
			}
		}}
		onClose={() => showPreview = false}
		onConfirm={() => {
			showPreview = false
			// Submit form
			const form = document.querySelector('form') as HTMLFormElement
			form?.requestSubmit()
		}}
		{submitting}
	/>
{/if}

<style>
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom, 1rem);
	}
</style>