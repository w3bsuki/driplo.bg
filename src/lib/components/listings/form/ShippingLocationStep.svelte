<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input } from '$lib/components/ui'
	import { Badge } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	import { formTokens, designTokens } from '$lib/design-tokens'
	import { cn } from '$lib/utils'
	
	interface Props {
		form: SuperForm<any>
		isMobile?: boolean
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

<div class={formTokens.form.section}>
	<!-- Location Field -->
	<div class={formTokens.fieldGroup.base}>
		<Label for="location" class={formTokens.label.base}>
			<span class="text-lg">📍</span>
			{m.listing_location_label()} <span class={formTokens.label.required}>*</span>
		</Label>
		<div class="relative">
			<Input
				id="location"
				bind:value={$formData.location_city}
				placeholder={m.listing_location_placeholder()}
				class={cn(
					formTokens.input.base,
					$errors.location_city && formTokens.input.error
				)}
				aria-invalid={$errors.location_city ? 'true' : undefined}
				inputmode="text"
				autocomplete="address-level2"
			/>
		</div>
		{#if $errors.location_city}
			<p class={formTokens.label.error}>{$errors.location_city}</p>
		{:else if locale === 'bg' && $formData.location_city && !hasCyrillic($formData.location_city)}
			<p class={cn(formTokens.label.error, "text-amber-600")}>Местоположението трябва да бъде на български език</p>
		{/if}
	</div>
	
	<!-- Shipping Options -->
	<div>
		<fieldset>
			<legend class={cn(formTokens.label.base, "mb-3")}>
				<span class="text-lg">🚚</span>
				{m.listing_shipping_options()} <span class={formTokens.label.required}>*</span>
			</legend>
			<div class="space-y-3">
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer",
					designTokens.transition.fast,
					"hover:border-gray-300 hover:shadow-sm",
					$formData.shipping_type === 'standard' 
						? "border-blue-500 bg-blue-50/50 shadow-sm" 
						: "border-gray-200 bg-white"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="standard"
						class="mt-0.5 w-4 h-4 text-blue-600"
						aria-label="Standard shipping"
					/>
					<div class="flex-1">
						<div class={cn(designTokens.fontWeight.medium, designTokens.fontSize.base, "text-gray-900")}>
							📦 {m.listing_shipping_standard()}
						</div>
						<div class={cn(designTokens.fontSize.sm, "text-gray-600 mt-0.5")}>
							{m.listing_shipping_standard_time()}
						</div>
					</div>
				</label>
				
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer",
					designTokens.transition.fast,
					"hover:border-gray-300 hover:shadow-sm",
					$formData.shipping_type === 'express' 
						? "border-blue-500 bg-blue-50/50 shadow-sm" 
						: "border-gray-200 bg-white"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="express"
						class="mt-0.5 w-4 h-4 text-blue-600"
						aria-label="Express shipping"
					/>
					<div class="flex-1">
						<div class={cn(designTokens.fontWeight.medium, designTokens.fontSize.base, "text-gray-900")}>
							⚡ {m.listing_shipping_express()}
						</div>
						<div class={cn(designTokens.fontSize.sm, "text-gray-600 mt-0.5")}>
							{m.listing_shipping_express_time()}
						</div>
					</div>
				</label>
				
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer",
					designTokens.transition.fast,
					"hover:border-gray-300 hover:shadow-sm",
					$formData.shipping_type === 'pickup' 
						? "border-blue-500 bg-blue-50/50 shadow-sm" 
						: "border-gray-200 bg-white"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="pickup"
						class="mt-0.5 w-4 h-4 text-blue-600"
						aria-label="Local pickup only"
					/>
					<div class="flex-1">
						<div class={cn(designTokens.fontWeight.medium, designTokens.fontSize.base, "text-gray-900")}>
							🤝 {m.listing_shipping_pickup()}
						</div>
						<div class={cn(designTokens.fontSize.sm, "text-gray-600 mt-0.5")}>
							{m.listing_shipping_pickup_desc()}
						</div>
					</div>
				</label>
			</div>
		</fieldset>
	</div>
	
	<!-- Shipping Cost -->
	{#if $formData.shipping_type !== 'pickup'}
		<div class={cn(formTokens.fieldGroup.withHelper, "animate-in fade-in slide-in-from-bottom-2 duration-200")}>
			<Label for="shipping_cost" class={formTokens.label.base}>
				<span class="text-lg">💸</span>
				{m.listing_shipping_cost_label()}
			</Label>
			<div class="relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">$</span>
				<Input
					id="shipping_cost"
					type="number"
					bind:value={$formData.shipping_cost}
					min="0"
					step="0.01"
					placeholder={m.listing_shipping_cost_placeholder()}
					class={cn(formTokens.input.base, "pl-9")}
					inputmode="decimal"
					autocomplete="off"
				/>
			</div>
			<p class={formTokens.label.helper}>{m.listing_shipping_cost_free()}</p>
		</div>
	{/if}
	
	<!-- Tags -->
	<div class={formTokens.fieldGroup.base}>
		<Label class={formTokens.label.base}>
			<span class="text-lg">🏷️</span>
			{m.listing_tags_label()}
		</Label>
		
		{#if ($formData.tags || []).length > 0}
			<div class="flex flex-wrap gap-2 mb-3">
				{#each $formData.tags || [] as tag}
					<Badge variant="secondary" class={cn(
						"pl-3 pr-1 py-1.5",
						designTokens.fontSize.sm,
						"flex items-center gap-1"
					)}>
						#{tag}
						<button
							type="button"
							onclick={() => removeTag(tag)}
							class={cn(
								"ml-1 p-1 hover:bg-gray-300 rounded-md",
								"min-w-[24px] min-h-[24px]",
								"flex items-center justify-center",
								designTokens.transition.fast
							)}
							aria-label="Remove {tag}"
						>
							✕
						</button>
					</Badge>
				{/each}
			</div>
		{/if}
		
		{#if suggestedTags.length > 0}
			<div class="mb-3">
				<p class={cn(designTokens.fontSize.sm, "text-gray-500 mb-2")}>
					{m.listing_suggested_tags()}
				</p>
				<div class="flex flex-wrap gap-2">
					{#each suggestedTags as tag}
						<button
							type="button"
							onclick={() => addTag(tag)}
							class={cn(
								designTokens.fontSize.sm,
								"bg-gray-100 hover:bg-gray-200",
								"px-3 py-1.5 rounded-full",
								designTokens.transition.fast,
								"active:scale-95"
							)}
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
			class={formTokens.input.base}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					addTag(tagInput)
				}
			}}
		/>
	</div>
</div>

<style>
	@keyframes slide-in-from-bottom-2 {
		from {
			transform: translateY(0.5rem);
		}
		to {
			transform: translateY(0);
		}
	}
	
	.animate-in {
		animation-duration: 200ms;
		animation-fill-mode: both;
	}
	
	.fade-in {
		animation-name: fade-in;
	}
	
	.slide-in-from-bottom-2 {
		animation-name: slide-in-from-bottom-2;
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>