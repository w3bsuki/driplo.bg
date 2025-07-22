<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import { Badge } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	
	interface Props {
		form: SuperForm<any>
	}
	
	let { form }: Props = $props()
	const { form: formData, errors } = form
	
	// Get current locale
	const locale = $derived($page.data.locale || 'en')
	
	// Cyrillic regex for Bulgarian validation
	const cyrillicRegex = /[\u0400-\u04FF]/
	const hasCyrillic = (text: string) => cyrillicRegex.test(text)
	
	let tagInput = $state('')
	
	const suggestedTags = $derived(() => {
		const tags: string[] = []
		if ($formData.brand) tags.push($formData.brand.toLowerCase())
		if ($formData.color) tags.push($formData.color.toLowerCase())
		if ($formData.condition === 'new') tags.push('new')
		if ($formData.shipping_type === 'express') tags.push('fast-shipping')
		return tags.filter(tag => !$formData.tags?.includes(tag))
	})
	
	function addTag(tag: string) {
		if (!tag || $formData.tags?.includes(tag) || ($formData.tags?.length || 0) >= 10) return
		$formData.tags = [...($formData.tags || []), tag.toLowerCase()]
		tagInput = ''
	}
	
	function removeTag(tag: string) {
		$formData.tags = $formData.tags?.filter(t => t !== tag) || []
	}
</script>

<div class="space-y-[var(--space-3)]">
	<div>
		<Label for="location" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_location_label()} <span class="text-[var(--color-error-main)]">*</span>
		</Label>
		<div class="relative mt-[var(--space-2)]">
			<span class="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] text-[var(--text-lg)]">📍</span>
			<Input
				id="location"
				bind:value={$formData.location_city}
				placeholder={m.listing_location_placeholder()}
				class="input-size-md pl-[var(--space-10)] border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
				aria-invalid={$errors.location_city ? 'true' : undefined}
				inputmode="text"
				autocomplete="address-level2"
			/>
		</div>
		{#if $errors.location_city}
			<p class="text-[var(--text-xs)] text-[var(--color-error-main)] mt-[var(--space-1)]">{$errors.location_city}</p>
		{:else if locale === 'bg' && $formData.location_city && !hasCyrillic($formData.location_city)}
			<p class="text-[var(--text-xs)] text-[var(--color-warning-main)] mt-[var(--space-1)]">Местоположението трябва да бъде на български език</p>
		{/if}
	</div>
	
	<div>
		<fieldset>
			<legend class="text-[var(--text-sm)] font-[var(--font-medium)] mb-[var(--space-2-5)] text-[var(--color-neutral-700)]">
				{m.listing_shipping_options()} <span class="text-[var(--color-error-main)]">*</span>
			</legend>
			<div class="space-y-[var(--space-2-5)]">
			<label class="flex items-start gap-[var(--space-3)] p-[var(--space-3)] border rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--color-primary-500)] transition-colors duration-[var(--duration-fast)] {$formData.shipping_type === 'standard' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-[var(--color-neutral-200)]'}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="standard"
					class="mt-[var(--space-0-5)]"
					aria-label="Standard shipping"
				/>
				<div class="flex-1">
					<div class="font-[var(--font-medium)] text-[var(--text-sm)] text-[var(--color-neutral-900)]">{m.listing_shipping_standard()}</div>
					<div class="text-[var(--text-xs)] text-[var(--color-neutral-600)]">{m.listing_shipping_standard_time()}</div>
				</div>
			</label>
			
			<label class="flex items-start gap-[var(--space-3)] p-[var(--space-3)] border rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--color-primary-500)] transition-colors duration-[var(--duration-fast)] {$formData.shipping_type === 'express' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-[var(--color-neutral-200)]'}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="express"
					class="mt-[var(--space-0-5)]"
					aria-label="Express shipping"
				/>
				<div class="flex-1">
					<div class="font-[var(--font-medium)] text-[var(--text-sm)] text-[var(--color-neutral-900)]">{m.listing_shipping_express()}</div>
					<div class="text-[var(--text-xs)] text-[var(--color-neutral-600)]">{m.listing_shipping_express_time()}</div>
				</div>
			</label>
			
			<label class="flex items-start gap-[var(--space-3)] p-[var(--space-3)] border rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--color-primary-500)] transition-colors duration-[var(--duration-fast)] {$formData.shipping_type === 'pickup' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-[var(--color-neutral-200)]'}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="pickup"
					class="mt-[var(--space-0-5)]"
					aria-label="Local pickup only"
				/>
				<div class="flex-1">
					<div class="font-[var(--font-medium)] text-[var(--text-sm)] text-[var(--color-neutral-900)]">{m.listing_shipping_pickup()}</div>
					<div class="text-[var(--text-xs)] text-[var(--color-neutral-600)]">{m.listing_shipping_pickup_desc()}</div>
				</div>
			</label>
			</div>
		</fieldset>
	</div>
	
	{#if $formData.shipping_type !== 'pickup'}
		<div>
			<Label for="shipping_cost" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
				{m.listing_shipping_cost_label()}
			</Label>
			<div class="relative mt-[var(--space-2)]">
				<span class="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">$</span>
				<Input
					id="shipping_cost"
					type="number"
					bind:value={$formData.shipping_cost}
					min="0"
					step="0.01"
					placeholder={m.listing_shipping_cost_placeholder()}
					class="input-size-md pl-[var(--space-8)] border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
					inputmode="decimal"
					autocomplete="off"
				/>
			</div>
			<p class="text-[var(--text-xs)] text-[var(--color-neutral-500)] mt-[var(--space-1)]">{m.listing_shipping_cost_free()}</p>
		</div>
	{/if}
	
	<div>
		<Label class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">{m.listing_tags_label()}</Label>
		<div class="flex flex-wrap gap-[var(--space-2)] mt-[var(--space-2)] mb-[var(--space-3)]">
			{#each $formData.tags || [] as tag}
				<Badge variant="secondary" class="badge-size-sm pl-[var(--space-3)] pr-[var(--space-1)] py-[var(--space-1)]">
					#{tag}
					<button
						type="button"
						onclick={() => removeTag(tag)}
						class="ml-[var(--space-1)] p-[var(--space-0-5)] hover:bg-[var(--color-neutral-300)] rounded touch-min"
					>
						✕
					</button>
				</Badge>
			{/each}
		</div>
		
		{#if suggestedTags.length > 0}
			<div class="mb-[var(--space-3)]">
				<p class="text-[var(--text-xs)] text-[var(--color-neutral-500)] mb-[var(--space-2)]">{m.listing_suggested_tags()}</p>
				<div class="flex flex-wrap gap-[var(--space-2)]">
					{#each suggestedTags as tag}
						<button
							type="button"
							onclick={() => addTag(tag)}
							class="text-[var(--text-xs)] bg-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-200)] px-[var(--space-2)] py-[var(--space-1)] rounded-full transition-colors duration-[var(--duration-fast)] active-scale"
						>
							+ {tag}
						</button>
					{/each}
				</div>
			</div>
		{/if}
		
		<Input
			bind:value={tagInput}
			placeholder={m.listing_tag_placeholder()}
			class="input-size-md border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] rounded-[var(--radius-lg)]"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					addTag(tagInput)
				}
			}}
		/>
	</div>
</div>