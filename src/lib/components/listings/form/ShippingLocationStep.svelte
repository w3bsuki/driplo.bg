<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import { Badge } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	
	interface Props {
		form: SuperForm<any>
	}
	
	let { form }: Props = $props()
	const { form: formData, errors } = form
	
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

<div class="space-y-4">
	<div>
		<Label for="location">
			{m.listing_location_label()} <span class="text-red-500">*</span>
		</Label>
		<div class="relative mt-2">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📍</span>
			<Input
				id="location"
				bind:value={$formData.location_city}
				placeholder={m.listing_location_placeholder()}
				class="pl-10"
				aria-invalid={$errors.location_city ? 'true' : undefined}
				inputmode="text"
				autocomplete="address-level2"
			/>
		</div>
		{#if $errors.location_city}
			<p class="text-sm text-red-500 mt-1">{$errors.location_city}</p>
		{/if}
	</div>
	
	<div>
		<fieldset>
			<legend class="text-sm font-medium mb-3">
				{m.listing_shipping_options()} <span class="text-red-500">*</span>
			</legend>
			<div class="space-y-3">
			<label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-300 {$formData.shipping_type === 'standard' ? 'border-blue-300 bg-blue-50' : ''}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="standard"
					class="mt-1"
					aria-label="Standard shipping"
				/>
				<div class="flex-1">
					<div class="font-medium">{m.listing_shipping_standard()}</div>
					<div class="text-sm text-gray-600">{m.listing_shipping_standard_time()}</div>
				</div>
			</label>
			
			<label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-300 {$formData.shipping_type === 'express' ? 'border-blue-300 bg-blue-50' : ''}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="express"
					class="mt-1"
					aria-label="Express shipping"
				/>
				<div class="flex-1">
					<div class="font-medium">{m.listing_shipping_express()}</div>
					<div class="text-sm text-gray-600">{m.listing_shipping_express_time()}</div>
				</div>
			</label>
			
			<label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-300 {$formData.shipping_type === 'pickup' ? 'border-blue-300 bg-blue-50' : ''}">
				<input
					type="radio"
					bind:group={$formData.shipping_type}
					value="pickup"
					class="mt-1"
					aria-label="Local pickup only"
				/>
				<div class="flex-1">
					<div class="font-medium">{m.listing_shipping_pickup()}</div>
					<div class="text-sm text-gray-600">{m.listing_shipping_pickup_desc()}</div>
				</div>
			</label>
			</div>
		</fieldset>
	</div>
	
	{#if $formData.shipping_type !== 'pickup'}
		<div>
			<Label for="shipping_cost">
				{m.listing_shipping_cost_label()}
			</Label>
			<div class="relative mt-2">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
				<Input
					id="shipping_cost"
					type="number"
					bind:value={$formData.shipping_cost}
					min="0"
					step="0.01"
					placeholder={m.listing_shipping_cost_placeholder()}
					class="pl-8"
					inputmode="decimal"
					autocomplete="off"
				/>
			</div>
			<p class="text-xs text-muted-foreground mt-1">{m.listing_shipping_cost_free()}</p>
		</div>
	{/if}
	
	<div>
		<Label>{m.listing_tags_label()}</Label>
		<div class="flex flex-wrap gap-2 mt-2 mb-3">
			{#each $formData.tags || [] as tag}
				<Badge variant="secondary" class="pl-3 pr-1 py-1">
					#{tag}
					<button
						type="button"
						onclick={() => removeTag(tag)}
						class="ml-1 p-0.5 hover:bg-secondary rounded"
					>
						✕
					</button>
				</Badge>
			{/each}
		</div>
		
		{#if suggestedTags.length > 0}
			<div class="mb-3">
				<p class="text-xs text-muted-foreground mb-2">{m.listing_suggested_tags()}</p>
				<div class="flex flex-wrap gap-2">
					{#each suggestedTags as tag}
						<button
							type="button"
							onclick={() => addTag(tag)}
							class="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-full transition-colors"
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
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					addTag(tagInput)
				}
			}}
		/>
	</div>
</div>