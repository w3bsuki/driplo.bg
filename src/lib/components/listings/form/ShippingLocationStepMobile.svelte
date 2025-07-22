<script lang="ts">
	import { 
		MapPin, 
		Truck, 
		Zap, 
		Package, 
		DollarSign,
		AlertCircle,
		Check,
		Globe,
		Home,
		Clock,
		Shield
	} from 'lucide-svelte'
	import type { SuperForm } from 'sveltekit-superforms'
	import * as m from '$lib/paraglide/messages.js'
	import { cn } from '$lib/utils'
	import { page } from '$app/stores'
	
	interface Props {
		form: SuperForm<any>
		supabase?: any
		userId?: string
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	// Get current locale
	const locale = $derived($page.data.locale || 'en')
	
	// Shipping options with beautiful visual design
	const shippingOptions = [
		{
			id: 'standard',
			name: m.listing_shipping_standard(),
			description: '3-5 business days',
			icon: Truck,
			color: 'blue',
			emoji: '📦',
			benefits: ['Tracking included', 'Insured up to $50']
		},
		{
			id: 'express',
			name: m.listing_shipping_express(),
			description: '1-2 business days',
			icon: Zap,
			color: 'amber',
			emoji: '⚡',
			benefits: ['Priority handling', 'Full tracking', 'Insured up to $100']
		},
		{
			id: 'pickup',
			name: m.listing_shipping_pickup(),
			description: 'Meet in person',
			icon: Home,
			color: 'green',
			emoji: '🤝',
			benefits: ['No shipping cost', 'Instant exchange', 'Cash accepted']
		}
	]
	
	// Popular cities based on country/region
	const popularCities = [
		'София', 'Пловдив', 'Варна', 'Бургас', 
		'Русе', 'Стара Загора', 'Плевен', 'Велико Търново'
	]
	
	// Shipping cost calculator
	let shippingCostSuggestions = $derived((() => {
		if ($formData.shipping_type === 'pickup') return []
		
		const weight = estimateWeight()
		const suggestions = []
		
		if ($formData.shipping_type === 'standard') {
			suggestions.push(
				{ label: 'Small item', cost: 5 },
				{ label: 'Medium item', cost: 8 },
				{ label: 'Large item', cost: 12 }
			)
		} else if ($formData.shipping_type === 'express') {
			suggestions.push(
				{ label: 'Small item', cost: 10 },
				{ label: 'Medium item', cost: 15 },
				{ label: 'Large item', cost: 20 }
			)
		}
		
		return suggestions
	})())
	
	// Estimate weight based on category
	function estimateWeight() {
		// This could be more sophisticated based on category/subcategory
		return 'medium'
	}
	
	// Free shipping threshold
	let freeShippingThreshold = $derived($formData.price >= 50)
	
	// Location validation for Bulgarian
	const cyrillicRegex = /[\u0400-\u04FF]/
	const hasCyrillic = (text: string) => cyrillicRegex.test(text)
	
	// Package protection add-on
	let includeProtection = $state(false)
	const protectionCost = 2.99
</script>

<div class="space-y-6">
	<!-- Step Header -->
	<div class="text-center">
		<div class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
			<span class="text-2xl">📦</span>
		</div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">Shipping & location</h2>
		<p class="text-gray-600">Choose how buyers will receive their purchase</p>
	</div>
	
	<!-- Location Field -->
	<div class="space-y-2">
		<label for="location" class="flex items-center gap-2">
			<MapPin class="w-4 h-4 text-gray-400" />
			<span class="text-sm font-medium text-gray-700">
				Your location <span class="text-red-500">*</span>
			</span>
		</label>
		
		<input
			id="location"
			bind:value={$formData.location_city}
			placeholder="Enter your city"
			class={cn(
				"block w-full px-4 py-3 text-base border rounded-xl transition-all duration-200",
				"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
				$errors.location_city 
					? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
					: "border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
			)}
			autocomplete="address-level2"
		/>
		
		{#if $errors.location_city}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.location_city}
			</p>
		{:else if locale === 'bg' && $formData.location_city && !hasCyrillic($formData.location_city)}
			<p class="text-sm text-amber-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				Местоположението трябва да бъде на български
			</p>
		{/if}
		
		<!-- Popular Cities -->
		{#if !$formData.location_city}
			<div class="flex flex-wrap gap-2">
				{#each popularCities.slice(0, 6) as city}
					<button
						type="button"
						onclick={() => $formData.location_city = city}
						class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors"
					>
						{city}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Shipping Method Selection -->
	<div class="space-y-3">
		<label class="block text-sm font-medium text-gray-700">
			How will you ship? <span class="text-red-500">*</span>
		</label>
		
		{#each shippingOptions as option}
			{@const isSelected = $formData.shipping_type === option.id}
			<button
				type="button"
				onclick={() => {
					$formData.shipping_type = option.id
					if (option.id === 'pickup') {
						$formData.shipping_cost = 0
					}
				}}
				class={cn(
					"w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
					isSelected
						? `bg-${option.color}-50 border-${option.color}-300 shadow-sm`
						: "bg-white border-gray-200 hover:border-gray-300"
				)}
			>
				<div class="flex items-start gap-3">
					<!-- Icon -->
					<div class={cn(
						"w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
						isSelected ? `bg-${option.color}-100` : "bg-gray-100"
					)}>
						<span class="text-xl">{option.emoji}</span>
					</div>
					
					<!-- Content -->
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h4 class="font-semibold text-gray-900">{option.name}</h4>
							{#if isSelected}
								<Check class="w-5 h-5 text-{option.color}-600" />
							{/if}
						</div>
						<p class="text-sm text-gray-600 mt-0.5">{option.description}</p>
						
						<!-- Benefits -->
						<div class="flex flex-wrap gap-2 mt-2">
							{#each option.benefits as benefit}
								<span class={cn(
									"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
									isSelected 
										? `bg-${option.color}-100 text-${option.color}-700`
										: "bg-gray-100 text-gray-600"
								)}>
									<Check class="w-3 h-3" />
									{benefit}
								</span>
							{/each}
						</div>
					</div>
				</div>
			</button>
		{/each}
		
		{#if $errors.shipping_type}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				Please select a shipping method
			</p>
		{/if}
	</div>
	
	<!-- Shipping Cost (if not pickup) -->
	{#if $formData.shipping_type && $formData.shipping_type !== 'pickup'}
		<div class="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
			<label for="shipping_cost" class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-700">
					Shipping cost
				</span>
				{#if freeShippingThreshold}
					<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
						Free shipping eligible! 🎉
					</span>
				{/if}
			</label>
			
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
				<input
					id="shipping_cost"
					type="number"
					bind:value={$formData.shipping_cost}
					placeholder="0.00"
					min="0"
					step="0.01"
					class="block w-full pl-8 pr-3 py-3 text-base border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
					inputmode="decimal"
				/>
			</div>
			
			<!-- Quick Shipping Cost Options -->
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					onclick={() => $formData.shipping_cost = 0}
					class={cn(
						"py-2 px-3 rounded-lg border text-sm font-medium transition-all",
						$formData.shipping_cost === 0
							? "bg-green-500 border-green-500 text-white"
							: "bg-white border-gray-200 hover:border-green-300"
					)}
				>
					Free
				</button>
				{#each shippingCostSuggestions as suggestion}
					<button
						type="button"
						onclick={() => $formData.shipping_cost = suggestion.cost}
						class={cn(
							"py-2 px-3 rounded-lg border text-sm font-medium transition-all",
							$formData.shipping_cost === suggestion.cost
								? "bg-amber-500 border-amber-500 text-white"
								: "bg-white border-gray-200 hover:border-amber-300"
						)}
					>
						${suggestion.cost}
					</button>
				{/each}
			</div>
			
			<p class="text-xs text-gray-500">
				💡 Free shipping increases sales by up to 30%
			</p>
		</div>
	{/if}
	
	<!-- Package Protection Add-on -->
	{#if $formData.shipping_type && $formData.shipping_type !== 'pickup'}
		<div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
			<label class="flex items-start gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={includeProtection}
					class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
				/>
				<div class="flex-1">
					<div class="flex items-center gap-2">
						<Shield class="w-4 h-4 text-purple-600" />
						<span class="font-medium text-gray-900">Package Protection</span>
						<span class="text-sm text-purple-600">+${protectionCost}</span>
					</div>
					<p class="text-xs text-gray-600 mt-1">
						Covers loss, damage, or theft during shipping
					</p>
				</div>
			</label>
		</div>
	{/if}
	
	<!-- Shipping Summary -->
	{#if $formData.shipping_type}
		<div class="bg-gray-50 rounded-xl p-4 space-y-2">
			<h4 class="font-medium text-gray-900 text-sm">Shipping summary</h4>
			
			<div class="space-y-1">
				<div class="flex items-center justify-between text-sm">
					<span class="text-gray-600">Method:</span>
					<span class="font-medium">
						{shippingOptions.find(o => o.id === $formData.shipping_type)?.name}
					</span>
				</div>
				
				{#if $formData.shipping_type !== 'pickup'}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600">Shipping cost:</span>
						<span class="font-medium">
							{$formData.shipping_cost === 0 ? 'Free' : `$${$formData.shipping_cost}`}
						</span>
					</div>
					
					{#if includeProtection}
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-600">Protection:</span>
							<span class="font-medium">${protectionCost}</span>
						</div>
					{/if}
					
					<div class="border-t pt-1 mt-1">
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-600">Buyer pays:</span>
							<span class="font-bold text-gray-900">
								${($formData.shipping_cost || 0) + (includeProtection ? protectionCost : 0)}
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	
	<!-- Shipping Tips -->
	<div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
		<h4 class="font-medium text-blue-900 mb-2 text-sm flex items-center gap-2">
			<Truck class="w-4 h-4" />
			Shipping best practices
		</h4>
		<ul class="space-y-1.5 text-xs text-blue-800">
			<li class="flex items-start gap-2">
				<Package class="w-3 h-3 text-blue-600 mt-0.5" />
				<span>Ship within 1-2 days for happy buyers</span>
			</li>
			<li class="flex items-start gap-2">
				<Globe class="w-3 h-3 text-blue-600 mt-0.5" />
				<span>Use recycled packaging when possible</span>
			</li>
			<li class="flex items-start gap-2">
				<Clock class="w-3 h-3 text-blue-600 mt-0.5" />
				<span>Always provide tracking information</span>
			</li>
		</ul>
	</div>
</div>