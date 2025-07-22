<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import ConditionSelector from './ConditionSelector.svelte'
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte'
import { formTokens, designTokens } from '$lib/design-tokens'
import { cn } from '$lib/utils'
	import { page } from '$app/stores'
	
	interface Props {
		form: SuperForm<any>
		categories: Array<{
			id: string
			slug: string
		}>
		isMobile?: boolean
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
	
	// Get current locale
	const locale = $derived($page.data.locale || 'en')
	
	// Cyrillic regex for Bulgarian validation
	const cyrillicRegex = /[\u0400-\u04FF]/
	const hasCyrillic = (text: string) => cyrillicRegex.test(text)
	
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

<div class={formTokens.form.section}>
	<!-- Price Field -->
	<div class={formTokens.fieldGroup.base}>
		<Label for="price" class={formTokens.label.base}>
			<span class="text-lg">💰</span>
			{m.listing_price_label()} <span class={formTokens.label.required}>*</span>
		</Label>
		<div class="relative">
			<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">$</span>
			<Input
				id="price"
				type="number"
				bind:value={$formData.price}
				min="0"
				step="0.01"
				placeholder={m.listing_price_placeholder()}
				class={cn(
					formTokens.input.base,
					"pl-9", // Extra padding for $ symbol
					$errors.price && formTokens.input.error
				)}
				aria-invalid={$errors.price ? 'true' : undefined}
				inputmode="decimal"
				autocomplete="off"
			/>
		</div>
		{#if $errors.price}
			<p class={formTokens.label.error}>{$errors.price}</p>
		{/if}
	</div>
	
	<!-- Condition Field -->
	<ConditionSelector bind:value={$formData.condition} required />
	{#if $errors.condition}
		<p class={cn(formTokens.label.error, "-mt-2")}>{$errors.condition}</p>
	{/if}
	
	<!-- Brand and Size Fields -->
	<div class={formTokens.form.grid}>
		<div class={formTokens.fieldGroup.base}>
			<Label for="brand" class={formTokens.label.base}>
				<span class="text-lg">🏷️</span>
				{m.listing_brand_label()} <span class={formTokens.label.required}>*</span>
			</Label>
			<Input
				id="brand"
				bind:value={$formData.brand}
				placeholder={m.listing_brand_placeholder()}
				class={cn(
					formTokens.input.base,
					$errors.brand && formTokens.input.error
				)}
				inputmode="text"
				autocapitalize="words"
			/>
			{#if $errors.brand}
				<p class={formTokens.label.error}>{$errors.brand}</p>
			{/if}
		</div>
		
		<div class={formTokens.fieldGroup.base}>
			<Label for="size" class={formTokens.label.base}>
				<span class="text-lg">📏</span>
				{m.listing_size_label()} 
				{#if isSizeRequired()}<span class={formTokens.label.required}>*</span>{/if}
			</Label>
			<Input
				id="size"
				bind:value={$formData.size}
				placeholder={m.listing_size_placeholder()}
				class={cn(
					formTokens.input.base,
					$errors.size && formTokens.input.error
				)}
				required={isSizeRequired()}
				aria-invalid={$errors.size ? 'true' : undefined}
				inputmode="text"
				autocapitalize="off"
			/>
			{#if $errors.size}
				<p class={formTokens.label.error}>{$errors.size}</p>
			{/if}
		</div>
	</div>
	
	<!-- Color Field -->
	<ColorPicker 
		bind:value={$formData.color} 
		label={m.listing_color_label()}
		required 
	/>
	{#if $errors.color}
		<p class={cn(formTokens.label.error, "-mt-2")}>{$errors.color}</p>
	{/if}
	
	<!-- Materials Field -->
	<div class={formTokens.fieldGroup.withHelper}>
		<Label for="materials" class={formTokens.label.base}>
			<span class="text-lg">🧵</span>
			{m.listing_materials_label()}
		</Label>
		<div class="space-y-2">
			<Input
				id="materials"
				bind:value={materialsInput}
				placeholder={m.listing_materials_placeholder()}
				class={formTokens.input.base}
				onkeydown={addMaterial}
				onblur={addMaterial}
				inputmode="text"
				autocapitalize="off"
			/>
			<p class={formTokens.label.helper}>
				{m.listing_materials_hint()}
			</p>
			
			{#if materials.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each materials as material}
						<span class={cn(
							"inline-flex items-center gap-1.5 px-3 py-1.5",
							designTokens.radius.lg,
							designTokens.fontSize.sm,
							designTokens.fontWeight.medium,
							"bg-gray-100 text-gray-700",
							designTokens.transition.fast
						)}>
							{material}
							<button
								type="button"
								onclick={() => removeMaterial(material)}
								class={cn(
									"ml-1 hover:text-gray-900",
									"focus:outline-none",
									"min-w-[24px] min-h-[24px]", // Touch target
									"-mr-1" // Compensate for padding
								)}
								aria-label="Remove {material}"
							>
								✕
							</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>
		{#if $errors.materials}
			<p class={formTokens.label.error}>{$errors.materials}</p>
		{/if}
	</div>
</div>