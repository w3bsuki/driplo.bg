<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { DollarSign, Tag, Palette, Package, AlertCircle, X } from 'lucide-svelte'
	import * as m from '$lib/paraglide/messages.js'
	import ConditionSelector from './ConditionSelector.svelte'
	import ColorSelector from './ColorSelector.svelte'
	import { page } from '$app/stores'
	import { cn } from '$lib/utils'
	
	interface Props {
		form: SuperForm<any>
		categories: Array<{
			id: string
			slug: string
		}>
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
	
	// Get current locale
	const locale = $derived($page.data.locale || 'en')
	
	// Check if size is required based on category
	const isSizeRequired = $derived(() => {
		if (!$formData.category_id) return false
		const category = categories.find(c => c.id === $formData.category_id)
		return category ? ['women', 'men', 'kids', 'shoes'].includes(category.slug) : false
	})
	
	// Materials state
	let materialsInput = $state('')
	let materials = $state<string[]>($formData.materials || [])
	
	// Initialize materials input from form data
	$effect(() => {
		if ($formData.materials && $formData.materials.length > 0 && materials.length === 0) {
			materials = $formData.materials
		}
	})
	
	// Update form data when materials change
	$effect(() => {
		$formData.materials = materials
	})
	
	function addMaterial(event: KeyboardEvent | FocusEvent) {
		// Handle both Enter key and blur events
		if (event instanceof KeyboardEvent && event.key !== 'Enter') return
		
		const trimmedInput = materialsInput.trim()
		if (!trimmedInput) return
		
		// Split by comma and process each material
		const newMaterials = trimmedInput
			.split(',')
			.map(m => m.trim())
			.filter(m => m && !materials.includes(m))
		
		if (newMaterials.length > 0) {
			materials = [...materials, ...newMaterials]
			materialsInput = ''
		}
		
		// Prevent form submission on Enter
		if (event instanceof KeyboardEvent) {
			event.preventDefault()
		}
	}
	
	function removeMaterial(material: string) {
		materials = materials.filter(m => m !== material)
	}
</script>

<div class="space-y-6">
	<!-- Step Header -->
	<div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">{m.listing_step_pricing_details()}</h2>
		<p class="text-gray-600">Set your price and provide additional details</p>
	</div>
	
	<!-- Price Field -->
	<div class="space-y-2">
		<label for="price" class="block text-sm font-medium text-gray-700">
			{m.listing_price_label()} <span class="text-red-500">*</span>
		</label>
		<div class="relative">
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<DollarSign class="h-5 w-5 text-gray-400" />
			</div>
			<input
				id="price"
				type="number"
				bind:value={$formData.price}
				min="0"
				step="0.01"
				placeholder={m.listing_price_placeholder()}
				class={cn(
					"block w-full pl-10 pr-3 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					$errors.price 
						? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
						: "border-gray-200 focus:border-primary focus:ring-primary/20"
				)}
				aria-invalid={$errors.price ? 'true' : undefined}
				inputmode="decimal"
				autocomplete="off"
			/>
		</div>
		{#if $errors.price}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.price}
			</p>
		{/if}
	</div>
	
	<!-- Condition Field -->
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			{m.listing_condition_label()} <span class="text-red-500">*</span>
		</label>
		<ConditionSelector bind:value={$formData.condition} required />
		{#if $errors.condition}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.condition}
			</p>
		{/if}
	</div>
	
	<!-- Brand and Size Fields -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="space-y-2">
			<label for="brand" class="block text-sm font-medium text-gray-700">
				<Tag class="w-4 h-4 inline mr-1 text-gray-400" />
				{m.listing_brand_label()}
			</label>
			<input
				id="brand"
				bind:value={$formData.brand}
				placeholder={m.listing_brand_placeholder()}
				class={cn(
					"block w-full px-4 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					"border-gray-200 focus:border-primary focus:ring-primary/20"
				)}
				inputmode="text"
				autocapitalize="words"
			/>
		</div>
		
		<div class="space-y-2">
			<label for="size" class="block text-sm font-medium text-gray-700">
				{m.listing_size_label()} 
				{#if isSizeRequired()}
					<span class="text-red-500">*</span>
				{/if}
			</label>
			<input
				id="size"
				bind:value={$formData.size}
				placeholder={m.listing_size_placeholder()}
				class={cn(
					"block w-full px-4 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					$errors.size 
						? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
						: "border-gray-200 focus:border-primary focus:ring-primary/20"
				)}
				required={isSizeRequired()}
				aria-invalid={$errors.size ? 'true' : undefined}
				inputmode="text"
				autocapitalize="off"
			/>
			{#if $errors.size}
				<p class="text-sm text-red-600 flex items-center gap-1">
					<AlertCircle class="w-3 h-3" />
					{$errors.size}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Color Field -->
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			<Palette class="w-4 h-4 inline mr-1 text-gray-400" />
			{m.listing_color_label()} <span class="text-red-500">*</span>
		</label>
		<ColorSelector bind:value={$formData.color} required />
		{#if $errors.color}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.color}
			</p>
		{/if}
	</div>
	
	<!-- Materials Field -->
	<div class="space-y-2">
		<label for="materials" class="block text-sm font-medium text-gray-700">
			<Package class="w-4 h-4 inline mr-1 text-gray-400" />
			{m.listing_materials_label()}
		</label>
		<div class="space-y-3">
			<input
				id="materials"
				bind:value={materialsInput}
				placeholder={m.listing_materials_placeholder()}
				class={cn(
					"block w-full px-4 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					"border-gray-200 focus:border-primary focus:ring-primary/20"
				)}
				onkeydown={addMaterial}
				onblur={addMaterial}
				inputmode="text"
				autocapitalize="off"
			/>
			<p class="text-xs text-gray-500">{m.listing_materials_hint()}</p>
			
			{#if materials.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each materials as material}
						<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 animate-in fade-in slide-in-from-bottom-1 duration-200">
							{material}
							<button
								type="button"
								onclick={() => removeMaterial(material)}
								class="ml-1 hover:text-gray-900 focus:outline-none rounded-full p-0.5 hover:bg-gray-200 transition-colors"
								aria-label="Remove {material}"
							>
								<X class="w-3 h-3" />
							</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>
		{#if $errors.materials}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.materials}
			</p>
		{/if}
	</div>
	
	<!-- Pricing Tips -->
	<div class="bg-blue-50 rounded-lg p-4">
		<h4 class="font-medium text-blue-900 mb-2 text-sm">💡 Pricing tips:</h4>
		<ul class="space-y-1 text-xs text-blue-800">
			<li>• Research similar items to price competitively</li>
			<li>• Consider the condition and brand value</li>
			<li>• Factor in shipping costs if offering free shipping</li>
			<li>• Price ending in .99 or .95 can increase sales</li>
		</ul>
	</div>
</div>