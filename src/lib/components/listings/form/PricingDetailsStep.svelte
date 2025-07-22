<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import ConditionSelector from './ConditionSelector.svelte'
	import ColorSelector from './ColorSelector.svelte'
	import { page } from '$app/stores'
	
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

<div class="space-y-[var(--space-3)]">
	<!-- Price Field -->
	<div class="space-y-[var(--space-1)]">
		<Label for="price" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_price_label()} <span class="text-[var(--color-error-main)]">*</span>
		</Label>
		<div class="relative">
			<span class="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)] text-[var(--text-sm)]">$</span>
			<Input
				id="price"
				type="number"
				bind:value={$formData.price}
				min="0"
				step="0.01"
				placeholder={m.listing_price_placeholder()}
				class="input-size-md pl-[var(--space-8)] border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
				aria-invalid={$errors.price ? 'true' : undefined}
				inputmode="decimal"
				autocomplete="off"
			/>
		</div>
		{#if $errors.price}
			<p class="text-[var(--text-xs)] text-[var(--color-error-main)]">{$errors.price}</p>
		{/if}
	</div>
	
	<!-- Condition Field -->
	<ConditionSelector bind:value={$formData.condition} required />
	{#if $errors.condition}
		<p class="text-[var(--text-xs)] text-[var(--color-error-main)] -mt-[var(--space-2)]">{$errors.condition}</p>
	{/if}
	
	<!-- Brand and Size Fields -->
	<div class="grid grid-cols-2 gap-[var(--space-2-5)]">
		<div class="space-y-[var(--space-1)]">
			<Label for="brand" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
				{m.listing_brand_label()}
			</Label>
			<Input
				id="brand"
				bind:value={$formData.brand}
				placeholder={m.listing_brand_placeholder()}
				class="input-size-md border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
				inputmode="text"
				autocapitalize="words"
			/>
		</div>
		
		<div class="space-y-[var(--space-1)]">
			<Label for="size" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
				{m.listing_size_label()} {#if isSizeRequired()}<span class="text-[var(--color-error-main)]">*</span>{/if}
			</Label>
			<Input
				id="size"
				bind:value={$formData.size}
				placeholder={m.listing_size_placeholder()}
				class="input-size-md border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
				required={isSizeRequired()}
				aria-invalid={$errors.size ? 'true' : undefined}
				inputmode="text"
				autocapitalize="off"
			/>
			{#if $errors.size}
				<p class="text-[var(--text-xs)] text-[var(--color-error-main)]">{$errors.size}</p>
			{/if}
		</div>
	</div>
	
	<!-- Color Field -->
	<ColorSelector bind:value={$formData.color} required />
	{#if $errors.color}
		<p class="text-[var(--text-xs)] text-[var(--color-error-main)] -mt-[var(--space-2)]">{$errors.color}</p>
	{/if}
	
	<!-- Materials Field -->
	<div class="space-y-[var(--space-1)]">
		<Label for="materials" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_materials_label()}
		</Label>
		<div class="space-y-[var(--space-2)]">
			<Input
				id="materials"
				bind:value={materialsInput}
				placeholder={m.listing_materials_placeholder()}
				class="input-size-md border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
				onkeydown={addMaterial}
				onblur={addMaterial}
				inputmode="text"
				autocapitalize="off"
			/>
			<p class="text-[var(--text-xs)] text-[var(--color-neutral-500)]">{m.listing_materials_hint()}</p>
			
			{#if materials.length > 0}
				<div class="flex flex-wrap gap-[var(--space-1-5)]">
					{#each materials as material}
						<span class="inline-flex items-center gap-[var(--space-1)] px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-[var(--font-medium)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]">
							{material}
							<button
								type="button"
								onclick={() => removeMaterial(material)}
								class="ml-[var(--space-1)] hover:text-[var(--color-neutral-600)] focus:outline-none touch-min"
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
			<p class="text-[var(--text-sm)] text-[var(--color-error-main)] mt-[var(--space-1)]">{$errors.materials}</p>
		{/if}
	</div>
</div>