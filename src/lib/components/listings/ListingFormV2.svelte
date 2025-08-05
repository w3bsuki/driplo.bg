<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema } from '$lib/schemas/listing'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/stores'
	import { user } from '$lib/stores/auth'
	import { 
		Camera, 
		Package2, 
		DollarSign, 
		Truck, 
		Tag, 
		AlertCircle, 
		Loader2,
		Info,
		Check,
		ArrowRight,
		ImagePlus
	} from 'lucide-svelte'
	import { Button, Input } from '$lib/components/native'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import CategorySelector from './CategorySelector.svelte'
	import ConditionSelector from './ConditionSelector.svelte'
	import ImageUploadSection from './sections/ImageUploadSection.svelte'
	import { cn } from '$lib/utils'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		data: any
		categories: Category[]
		hasPaymentAccount?: boolean
	}
	
	let { data, categories = [], hasPaymentAccount = false }: Props = $props()
	
	let isSubmitting = $state(false)
	let currentStep = $state(1)
	
	const { form, enhance, errors } = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		id: 'listing-form-v2',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('🎉 Your listing is now live!')
			} else if (result.type === 'failure') {
				const error = result.data?.error
				toast.error(error || 'Failed to create listing')
				isSubmitting = false
			}
		}
	})
	
	// Get Supabase client from page data
	const supabase = $page.data.supabase
	
	// Form sections for better organization
	const steps = [
		{ id: 1, name: 'Photos', icon: Camera },
		{ id: 2, name: 'Details', icon: Package2 },
		{ id: 3, name: 'Pricing', icon: DollarSign },
		{ id: 4, name: 'Shipping', icon: Truck }
	]
	
	// Validation for each step
	function canProceedToNextStep(): boolean {
		switch (currentStep) {
			case 1:
				return $form.images?.length > 0
			case 2:
				return !!$form.title && !!$form.description && !!$form.category_id
			case 3:
				return $form.price > 0 && !!$form.condition && !!$form.color
			case 4:
				return !!$form.location_city && !!$form.shipping_type
			default:
				return true
		}
	}
	
	function handleSubmit(e: SubmitEvent) {
		if (!hasPaymentAccount) {
			e.preventDefault()
			toast.error('Please set up your payment account first')
			return
		}
		
		isSubmitting = true
	}
	
	function nextStep() {
		if (canProceedToNextStep()) {
			currentStep = Math.min(currentStep + 1, 4)
		}
	}
	
	function prevStep() {
		currentStep = Math.max(currentStep - 1, 1)
	}
	
	// Popular tags for quick selection
	const popularTags = [
		'vintage', 'designer', 'streetwear', 'sustainable', 
		'limited edition', 'handmade', 'rare', 'trending'
	]
	
	// Add/remove tag
	function toggleTag(tag: string) {
		if (!$form.tags) {
			$form.tags = []
		}
		if ($form.tags.includes(tag)) {
			$form.tags = $form.tags.filter(t => t !== tag)
		} else {
			$form.tags = [...$form.tags, tag].slice(0, 5)
		}
	}
	
	// Initialize form defaults
	$effect(() => {
		if (!$form.images) $form.images = []
		if (!$form.tags) $form.tags = []
		if (!$form.shipping_type) $form.shipping_type = 'standard'
		if (!$form.shipping_cost) $form.shipping_cost = 0
		if (!$form.price) $form.price = 0
	})
</script>

<div class="max-w-5xl mx-auto">
	<!-- Progress Steps -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			{#each steps as step, index}
				<div class="flex items-center flex-1">
					<button
						type="button"
						onclick={() => currentStep = step.id}
						disabled={step.id > currentStep && !canProceedToNextStep()}
						class={cn(
							"flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
							currentStep === step.id 
								? "bg-blue-600 border-blue-600 text-white" 
								: currentStep > step.id 
									? "bg-green-500 border-green-500 text-white" 
									: "bg-white border-gray-300 text-gray-400"
						)}
					>
						{#if currentStep > step.id}
							<Check class="w-5 h-5" />
						{:else}
							<svelte:component this={step.icon} class="w-5 h-5" />
						{/if}
					</button>
					
					{#if index < steps.length - 1}
						<div class={cn(
							"flex-1 h-0.5 mx-2 transition-all",
							currentStep > step.id ? "bg-green-500" : "bg-gray-200"
						)} />
					{/if}
				</div>
			{/each}
		</div>
		
		<div class="flex justify-between mt-2">
			{#each steps as step}
				<span class={cn(
					"text-sm font-medium transition-colors",
					currentStep === step.id ? "text-blue-600" : "text-gray-500"
				)}>
					{step.name}
				</span>
			{/each}
		</div>
	</div>

	<form 
		method="POST" 
		action="/sell?/create" 
		use:enhance
		onsubmit={handleSubmit}
		class="bg-white rounded-2xl shadow-lg overflow-hidden"
	>
		<!-- Step 1: Photos -->
		{#if currentStep === 1}
			<div class="p-8">
				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						Add Photos of Your Item
					</h2>
					<p class="text-gray-600">
						Good photos help your item sell faster. Add up to 10 photos.
					</p>
				</div>
				
				<ImageUploadSection 
					bind:images={$form.images}
					maxImages={10}
					{supabase}
					userId={$user?.id}
				/>
				
				{#if $errors.images}
					<p class="text-red-500 text-sm mt-2 flex items-center gap-1">
						<AlertCircle class="w-4 h-4" />
						{$errors.images}
					</p>
				{/if}
			</div>
		{/if}
		
		<!-- Step 2: Details -->
		{#if currentStep === 2}
			<div class="p-8 space-y-6">
				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						Describe Your Item
					</h2>
					<p class="text-gray-600">
						Be honest and detailed to build trust with buyers.
					</p>
				</div>
				
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
						Title
					</label>
					<Input
						id="title"
						bind:value={$form.title}
						placeholder="e.g., Vintage Levi's 501 Jeans - Size 32"
						maxlength={100}
						class="w-full"
					/>
					{#if $errors.title}
						<p class="text-red-500 text-sm mt-1">{$errors.title}</p>
					{/if}
					<p class="text-xs text-gray-500 mt-1 text-right">{$form.title.length}/100</p>
				</div>
				
				<!-- Category -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<CategorySelector
						bind:value={$form.category_id}
						{categories}
						placeholder="Select a category"
					/>
					{#if $errors.category_id}
						<p class="text-red-500 text-sm mt-1">{$errors.category_id}</p>
					{/if}
				</div>
				
				<!-- Description -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<Textarea
						id="description"
						bind:value={$form.description}
						rows={6}
						placeholder="Describe the item's condition, measurements, material, and any flaws..."
						maxlength={2000}
						class="w-full resize-none"
					/>
					{#if $errors.description}
						<p class="text-red-500 text-sm mt-1">{$errors.description}</p>
					{/if}
					<p class="text-xs text-gray-500 mt-1 text-right">{$form.description.length}/2000</p>
				</div>
				
				<!-- Tags -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Tags (optional)
					</label>
					<div class="flex flex-wrap gap-2">
						{#each popularTags as tag}
							<button
								type="button"
								onclick={() => toggleTag(tag)}
								class={cn(
									"px-3 py-1 rounded-full text-sm transition-all",
									$form.tags?.includes(tag)
										? "bg-blue-100 text-blue-700 border border-blue-300"
										: "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
								)}
							>
								{tag}
							</button>
						{/each}
					</div>
					<p class="text-xs text-gray-500 mt-2">
						Select up to 5 tags to help buyers find your item
					</p>
				</div>
			</div>
		{/if}
		
		<!-- Step 3: Pricing -->
		{#if currentStep === 3}
			<div class="p-8 space-y-6">
				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						Set Your Price
					</h2>
					<p class="text-gray-600">
						Price competitively to sell faster.
					</p>
				</div>
				
				<div class="grid md:grid-cols-2 gap-6">
					<!-- Price -->
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
							Price (EUR)
						</label>
						<div class="relative">
							<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<Input
								id="price"
								type="number"
								bind:value={$form.price}
								placeholder="0.00"
								min="0"
								step="0.01"
								class="pl-10 w-full"
							/>
						</div>
						{#if $errors.price}
							<p class="text-red-500 text-sm mt-1">{$errors.price}</p>
						{/if}
					</div>
					
					<!-- Condition -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Condition
						</label>
						<ConditionSelector bind:value={$form.condition} />
						{#if $errors.condition}
							<p class="text-red-500 text-sm mt-1">{$errors.condition}</p>
						{/if}
					</div>
					
					<!-- Brand -->
					<div>
						<label for="brand" class="block text-sm font-medium text-gray-700 mb-2">
							Brand (optional)
						</label>
						<Input
							id="brand"
							bind:value={$form.brand}
							placeholder="e.g., Nike, Zara, Gucci"
							class="w-full"
						/>
					</div>
					
					<!-- Size -->
					<div>
						<label for="size" class="block text-sm font-medium text-gray-700 mb-2">
							Size (optional)
						</label>
						<Input
							id="size"
							bind:value={$form.size}
							placeholder="e.g., M, 42, One Size"
							class="w-full"
						/>
					</div>
					
					<!-- Color -->
					<div class="md:col-span-2">
						<label for="color" class="block text-sm font-medium text-gray-700 mb-2">
							Color
						</label>
						<Input
							id="color"
							bind:value={$form.color}
							placeholder="e.g., Black, Navy Blue, Multicolor"
							class="w-full"
						/>
						{#if $errors.color}
							<p class="text-red-500 text-sm mt-1">{$errors.color}</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		
		<!-- Step 4: Shipping -->
		{#if currentStep === 4}
			<div class="p-8 space-y-6">
				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						Shipping Information
					</h2>
					<p class="text-gray-600">
						Where are you shipping from?
					</p>
				</div>
				
				<div class="grid md:grid-cols-2 gap-6">
					<!-- Location -->
					<div>
						<label for="location_city" class="block text-sm font-medium text-gray-700 mb-2">
							Your City
						</label>
						<Input
							id="location_city"
							bind:value={$form.location_city}
							placeholder="e.g., Sofia, Plovdiv"
							class="w-full"
						/>
						{#if $errors.location_city}
							<p class="text-red-500 text-sm mt-1">{$errors.location_city}</p>
						{/if}
					</div>
					
					<!-- Shipping Type -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Shipping Method
						</label>
						<div class="grid grid-cols-3 gap-2">
							<button
								type="button"
								onclick={() => $form.shipping_type = 'standard'}
								class={cn(
									"p-3 rounded-lg border text-sm font-medium transition-all",
									$form.shipping_type === 'standard'
										? "bg-blue-50 border-blue-500 text-blue-700"
										: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
								)}
							>
								Standard
							</button>
							<button
								type="button"
								onclick={() => $form.shipping_type = 'express'}
								class={cn(
									"p-3 rounded-lg border text-sm font-medium transition-all",
									$form.shipping_type === 'express'
										? "bg-blue-50 border-blue-500 text-blue-700"
										: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
								)}
							>
								Express
							</button>
							<button
								type="button"
								onclick={() => $form.shipping_type = 'pickup'}
								class={cn(
									"p-3 rounded-lg border text-sm font-medium transition-all",
									$form.shipping_type === 'pickup'
										? "bg-blue-50 border-blue-500 text-blue-700"
										: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
								)}
							>
								Pickup Only
							</button>
						</div>
					</div>
					
					<!-- Shipping Cost -->
					{#if $form.shipping_type !== 'pickup'}
						<div>
							<label for="shipping_cost" class="block text-sm font-medium text-gray-700 mb-2">
								Shipping Cost (EUR)
							</label>
							<Input
								id="shipping_cost"
								type="number"
								bind:value={$form.shipping_cost}
								placeholder="0.00"
								min="0"
								step="0.01"
								class="w-full"
							/>
							<p class="text-xs text-gray-500 mt-1">Leave 0 for free shipping</p>
						</div>
						
						<!-- Ships Worldwide -->
						<div class="flex items-center">
							<input
								id="ships_worldwide"
								type="checkbox"
								bind:checked={$form.ships_worldwide}
								class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
							/>
							<label for="ships_worldwide" class="ml-2 text-sm text-gray-700">
								I ship worldwide
							</label>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		
		<!-- Navigation & Submit -->
		<div class="bg-gray-50 px-8 py-6 border-t">
			<div class="flex items-center justify-between">
				<div>
					{#if currentStep > 1}
						<Button
							type="button"
							variant="outline"
							onclick={prevStep}
						>
							← Previous
						</Button>
					{:else}
						<Button
							type="button"
							variant="outline"
							onclick={() => window.history.back()}
						>
							Cancel
						</Button>
					{/if}
				</div>
				
				<div class="flex items-center gap-3">
					{#if currentStep < 4}
						<Button
							type="button"
							onclick={nextStep}
							disabled={!canProceedToNextStep()}
						>
							Next
							<ArrowRight class="w-4 h-4 ml-2" />
						</Button>
					{:else}
						<Button
							type="submit"
							disabled={isSubmitting || !hasPaymentAccount || !canProceedToNextStep()}
							class="min-w-[140px]"
						>
							{#if isSubmitting}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								Publishing...
							{:else}
								Publish Listing
							{/if}
						</Button>
					{/if}
				</div>
			</div>
			
			{#if !hasPaymentAccount && currentStep === 4}
				<div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
					<p class="text-sm text-amber-800 flex items-center gap-2">
						<AlertCircle class="w-4 h-4 flex-shrink-0" />
						Set up your payment account to start selling.
						<a href="/profile/settings" class="font-medium underline hover:text-amber-900">
							Set up now
						</a>
					</p>
				</div>
			{/if}
		</div>
	</form>
</div>