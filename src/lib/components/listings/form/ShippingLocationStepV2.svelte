<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { MapPin, Truck, Zap, Package, Tag, X, AlertCircle } from 'lucide-svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	import { cn } from '$lib/utils'
	
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
		if ($formData.category_id) tags.push('trending')
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

<div class="space-y-6">
	<!-- Step Header -->
	<div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">{m.listing_step_shipping_location()}</h2>
		<p class="text-gray-600">Set your location and shipping preferences</p>
	</div>
	
	<!-- Location Field -->
	<div class="space-y-2">
		<label for="location" class="block text-sm font-medium text-gray-700">
			{m.listing_location_label()} <span class="text-red-500">*</span>
		</label>
		<div class="relative">
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<MapPin class="h-5 w-5 text-gray-400" />
			</div>
			<input
				id="location"
				bind:value={$formData.location_city}
				placeholder={m.listing_location_placeholder()}
				class={cn(
					"block w-full pl-10 pr-3 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					$errors.location_city 
						? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
						: "border-gray-200 focus:border-primary focus:ring-primary/20"
				)}
				aria-invalid={$errors.location_city ? 'true' : undefined}
				inputmode="text"
				autocomplete="address-level2"
			/>
		</div>
		{#if $errors.location_city}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.location_city}
			</p>
		{:else if locale === 'bg' && $formData.location_city && !hasCyrillic($formData.location_city)}
			<p class="text-sm text-amber-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				Местоположението трябва да бъде на български език
			</p>
		{/if}
	</div>
	
	<!-- Shipping Options -->
	<div class="space-y-2">
		<fieldset>
			<legend class="block text-sm font-medium text-gray-700 mb-3">
				{m.listing_shipping_options()} <span class="text-red-500">*</span>
			</legend>
			<div class="space-y-3">
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
					$formData.shipping_type === 'standard' 
						? "border-primary bg-primary/5" 
						: "border-gray-200 hover:border-gray-300"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="standard"
						class="mt-1 text-primary focus:ring-primary"
						aria-label="Standard shipping"
					/>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<Truck class="w-4 h-4 text-gray-600" />
							<span class="font-medium text-gray-900">{m.listing_shipping_standard()}</span>
						</div>
						<p class="text-sm text-gray-600 mt-1">{m.listing_shipping_standard_time()}</p>
					</div>
				</label>
				
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
					$formData.shipping_type === 'express' 
						? "border-primary bg-primary/5" 
						: "border-gray-200 hover:border-gray-300"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="express"
						class="mt-1 text-primary focus:ring-primary"
						aria-label="Express shipping"
					/>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<Zap class="w-4 h-4 text-amber-500" />
							<span class="font-medium text-gray-900">{m.listing_shipping_express()}</span>
						</div>
						<p class="text-sm text-gray-600 mt-1">{m.listing_shipping_express_time()}</p>
					</div>
				</label>
				
				<label class={cn(
					"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
					$formData.shipping_type === 'pickup' 
						? "border-primary bg-primary/5" 
						: "border-gray-200 hover:border-gray-300"
				)}>
					<input
						type="radio"
						bind:group={$formData.shipping_type}
						value="pickup"
						class="mt-1 text-primary focus:ring-primary"
						aria-label="Local pickup only"
					/>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<Package class="w-4 h-4 text-gray-600" />
							<span class="font-medium text-gray-900">{m.listing_shipping_pickup()}</span>
						</div>
						<p class="text-sm text-gray-600 mt-1">{m.listing_shipping_pickup_desc()}</p>
					</div>
				</label>
			</div>
		</fieldset>
	</div>
	
	<!-- Shipping Cost -->
	{#if $formData.shipping_type !== 'pickup'}
		<div class="space-y-2">
			<label for="shipping_cost" class="block text-sm font-medium text-gray-700">
				{m.listing_shipping_cost_label()}
			</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
				<input
					id="shipping_cost"
					type="number"
					bind:value={$formData.shipping_cost}
					min="0"
					step="0.01"
					placeholder={m.listing_shipping_cost_placeholder()}
					class={cn(
						"block w-full pl-8 pr-3 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
						"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
						"border-gray-200 focus:border-primary focus:ring-primary/20"
					)}
					inputmode="decimal"
					autocomplete="off"
				/>
			</div>
			<p class="text-xs text-gray-500">{m.listing_shipping_cost_free()}</p>
		</div>
	{/if}
	
	<!-- Tags -->
	<div class="space-y-3">
		<label class="block text-sm font-medium text-gray-700">
			<Tag class="w-4 h-4 inline mr-1 text-gray-400" />
			{m.listing_tags_label()}
		</label>
		
		<!-- Current Tags -->
		{#if $formData.tags?.length}
			<div class="flex flex-wrap gap-2">
				{#each $formData.tags as tag}
					<span class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
						#{tag}
						<button
							type="button"
							onclick={() => removeTag(tag)}
							class="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					</span>
				{/each}
			</div>
		{/if}
		
		<!-- Suggested Tags -->
		{#if suggestedTags.length > 0}
			<div>
				<p class="text-xs text-gray-500 mb-2">{m.listing_suggested_tags()}</p>
				<div class="flex flex-wrap gap-2">
					{#each suggestedTags as tag}
						<button
							type="button"
							onclick={() => addTag(tag)}
							class="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
						>
							+ {tag}
						</button>
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Tag Input -->
		<input
			bind:value={tagInput}
			placeholder={m.listing_tag_placeholder()}
			class={cn(
				"block w-full px-4 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
				"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
				"border-gray-200 focus:border-primary focus:ring-primary/20"
			)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					addTag(tagInput)
				}
			}}
		/>
		<p class="text-xs text-gray-500">
			{#if $formData.tags?.length}
				{$formData.tags.length}/10 tags added
			{:else}
				Add up to 10 tags to help buyers find your item
			{/if}
		</p>
	</div>
	
	<!-- Shipping Tips -->
	<div class="bg-green-50 rounded-lg p-4">
		<h4 class="font-medium text-green-900 mb-2 text-sm">📦 Shipping tips:</h4>
		<ul class="space-y-1 text-xs text-green-800">
			<li>• Offering free shipping can increase sales by up to 30%</li>
			<li>• Use sturdy packaging to protect items during transit</li>
			<li>• Consider eco-friendly packaging options</li>
			<li>• Always provide tracking numbers for buyer confidence</li>
		</ul>
	</div>
</div>