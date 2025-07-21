<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	
	interface Props {
		form: SuperForm<any>
		categories: Array<{
			id: string
			slug: string
		}>
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
	
	// Check if size is required based on category
	const isSizeRequired = $derived(() => {
		if (!$formData.category_id) return false
		const category = categories.find(c => c.id === $formData.category_id)
		return category ? ['women', 'men', 'kids', 'shoes'].includes(category.slug) : false
	})
</script>

<div class="space-y-4">
	<div>
		<Label for="price">
			{m.listing_price_label()} <span class="text-red-500">*</span>
		</Label>
		<div class="relative mt-2">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
			<Input
				id="price"
				name="price"
				type="number"
				bind:value={$formData.price}
				min="0"
				step="0.01"
				placeholder={m.listing_price_placeholder()}
				class="pl-8"
				aria-invalid={$errors.price ? 'true' : undefined}
				inputmode="decimal"
				autocomplete="off"
			/>
		</div>
		{#if $errors.price}
			<p class="text-sm text-red-500 mt-1">{$errors.price}</p>
		{/if}
	</div>
	
	<div>
		<Label for="condition">
			{m.listing_condition_label()} <span class="text-red-500">*</span>
		</Label>
		<select
			id="condition"
			name="condition"
			bind:value={$formData.condition}
			class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			aria-invalid={$errors.condition ? 'true' : undefined}
		>
			<option value="">{m.listing_condition_placeholder ? m.listing_condition_placeholder() : 'Select condition'}</option>
			<option value="new">{m.listing_condition_new()}</option>
			<option value="like_new">{m.listing_condition_like_new()}</option>
			<option value="good">{m.listing_condition_good()}</option>
			<option value="fair">{m.listing_condition_fair()}</option>
			<option value="poor">{m.listing_condition_poor()}</option>
		</select>
		{#if $errors.condition}
			<p class="text-sm text-red-500 mt-1">{$errors.condition}</p>
		{/if}
	</div>
	
	<div class="grid grid-cols-2 gap-4">
		<div>
			<Label for="brand">
				{m.listing_brand_label()}
			</Label>
			<Input
				id="brand"
				name="brand"
				bind:value={$formData.brand}
				placeholder={m.listing_brand_placeholder()}
				class="mt-2"
				inputmode="text"
				autocapitalize="words"
			/>
		</div>
		
		<div>
			<Label for="size">
				{m.listing_size_label()} {#if isSizeRequired()}<span class="text-red-500">*</span>{/if}
			</Label>
			<Input
				id="size"
				name="size"
				bind:value={$formData.size}
				placeholder={m.listing_size_placeholder()}
				class="mt-2"
				required={isSizeRequired()}
				aria-invalid={$errors.size ? 'true' : undefined}
				inputmode="text"
				autocapitalize="off"
			/>
			{#if $errors.size}
				<p class="text-sm text-red-500 mt-1">{$errors.size}</p>
			{/if}
		</div>
	</div>
	
	<div>
		<Label for="color">
			{m.listing_color_label()} <span class="text-red-500">*</span>
		</Label>
		<Input
			id="color"
			name="color"
			bind:value={$formData.color}
			placeholder={m.listing_color_placeholder()}
			class="mt-2"
			aria-invalid={$errors.color ? 'true' : undefined}
			inputmode="text"
			autocapitalize="words"
		/>
		{#if $errors.color}
			<p class="text-sm text-red-500 mt-1">{$errors.color}</p>
		{/if}
	</div>
</div>