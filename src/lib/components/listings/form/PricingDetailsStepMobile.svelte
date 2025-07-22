<script lang="ts">
	import { 
		DollarSign, 
		Tag, 
		Palette, 
		Ruler, 
		Hash,
		TrendingUp,
		AlertCircle,
		Sparkles,
		Info,
		Zap,
		X,
		Check
	} from 'lucide-svelte'
	import type { SuperForm } from 'sveltekit-superforms'
	import * as m from '$lib/paraglide/messages.js'
	import { cn } from '$lib/utils'
	import { onMount } from 'svelte'
	
	interface Props {
		form: SuperForm<any>
		supabase?: any
		userId?: string
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	// Popular brands with emojis
	const popularBrands = [
		{ name: 'Nike', emoji: '✓' },
		{ name: 'Adidas', emoji: '⚡' },
		{ name: 'Zara', emoji: '🏷️' },
		{ name: 'H&M', emoji: '🅷' },
		{ name: 'Gucci', emoji: '💎' },
		{ name: 'Prada', emoji: '👜' },
		{ name: 'Uniqlo', emoji: '🎌' },
		{ name: 'Forever 21', emoji: '2️⃣1️⃣' }
	]
	
	// Size options based on category
	let sizeOptions = $derived((() => {
		// Could be dynamic based on category
		return {
			clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
			shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
			kids: ['0-3M', '3-6M', '6-12M', '12-18M', '2T', '3T', '4T', '5', '6', '7', '8'],
			oneSize: ['One Size', 'OS']
		}
	})())
	
	// Common colors with visual swatches
	const colorOptions = [
		{ name: 'Black', value: 'black', hex: '#000000' },
		{ name: 'White', value: 'white', hex: '#FFFFFF' },
		{ name: 'Gray', value: 'gray', hex: '#6B7280' },
		{ name: 'Red', value: 'red', hex: '#EF4444' },
		{ name: 'Blue', value: 'blue', hex: '#3B82F6' },
		{ name: 'Green', value: 'green', hex: '#10B981' },
		{ name: 'Yellow', value: 'yellow', hex: '#F59E0B' },
		{ name: 'Pink', value: 'pink', hex: '#EC4899' },
		{ name: 'Purple', value: 'purple', hex: '#8B5CF6' },
		{ name: 'Brown', value: 'brown', hex: '#92400E' },
		{ name: 'Navy', value: 'navy', hex: '#1E3A8A' },
		{ name: 'Beige', value: 'beige', hex: '#D4B896' },
		{ name: 'Multi', value: 'multi', hex: 'gradient' }
	]
	
	// Tag input
	let tagInput = $state('')
	
	// Initialize tags array
	onMount(() => {
		if (!$formData.tags || !Array.isArray($formData.tags)) {
			$formData.tags = []
		}
	})
	
	// Smart tag suggestions based on inputs
	let suggestedTags = $derived((() => {
		const tags: string[] = []
		
		// Brand-based tags
		if ($formData.brand) {
			tags.push($formData.brand.toLowerCase())
			if ($formData.brand.toLowerCase() === 'nike') {
				tags.push('sportswear', 'athletic')
			} else if (['gucci', 'prada', 'chanel'].includes($formData.brand.toLowerCase())) {
				tags.push('luxury', 'designer')
			}
		}
		
		// Condition-based tags
		if ($formData.condition === 'new') {
			tags.push('new-with-tags', 'nwt')
		}
		
		// Color-based tags
		if ($formData.color) {
			tags.push($formData.color)
		}
		
		// Price-based tags
		if ($formData.price && $formData.price < 20) {
			tags.push('budget-friendly', 'affordable')
		} else if ($formData.price && $formData.price > 200) {
			tags.push('premium')
		}
		
		// Category-based tags
		tags.push('trendy', 'vintage', 'retro', 'minimalist', 'boho', 'casual', 'formal')
		
		return tags.filter(tag => !$formData.tags?.includes(tag)).slice(0, 8)
	})())
	
	function addTag(tag: string) {
		if (!tag || $formData.tags?.includes(tag) || ($formData.tags?.length || 0) >= 5) return
		$formData.tags = [...($formData.tags || []), tag.toLowerCase().trim()]
		tagInput = ''
	}
	
	function removeTag(tag: string) {
		$formData.tags = $formData.tags?.filter(t => t !== tag) || []
	}
	
	// Price calculator helpers
	let originalPrice = $derived($formData.original_price || 0)
	let sellingPrice = $derived($formData.price || 0)
	let discount = $derived(originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0)
	let profit = $derived(sellingPrice > 0 ? Math.round(sellingPrice * 0.9) : 0) // After 10% platform fee
	
	// Quick price suggestions
	function suggestPrice() {
		if (originalPrice > 0) {
			const suggestions = [
				{ label: '30% off', price: Math.round(originalPrice * 0.7) },
				{ label: '50% off', price: Math.round(originalPrice * 0.5) },
				{ label: '70% off', price: Math.round(originalPrice * 0.3) }
			]
			return suggestions
		}
		return []
	}
</script>

<div class="space-y-6">
	<!-- Step Header -->
	<div class="text-center">
		<div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
			<span class="text-2xl">💰</span>
		</div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">Set your price & details</h2>
		<p class="text-gray-600">Price it right, sell it fast!</p>
	</div>
	
	<!-- Price Section with Calculator -->
	<div class="space-y-4">
		<!-- Original Price (Optional) -->
		<div class="space-y-2">
			<label for="original_price" class="block text-sm font-medium text-gray-700">
				Original retail price
			</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
				<input
					id="original_price"
					type="number"
					bind:value={$formData.original_price}
					placeholder="0.00"
					min="0"
					step="0.01"
					class="block w-full pl-8 pr-3 py-3 text-base border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
					inputmode="decimal"
				/>
			</div>
		</div>
		
		<!-- Selling Price -->
		<div class="space-y-2">
			<label for="price" class="block text-sm font-medium text-gray-700">
				Your selling price <span class="text-red-500">*</span>
			</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
				<input
					id="price"
					type="number"
					bind:value={$formData.price}
					placeholder="0.00"
					min="0.01"
					step="0.01"
					class={cn(
						"block w-full pl-8 pr-3 py-3 text-lg font-semibold border rounded-xl transition-all duration-200",
						$errors.price 
							? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
							: "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
					)}
					inputmode="decimal"
				/>
			</div>
			
			{#if $errors.price}
				<p class="text-sm text-red-600 flex items-center gap-1">
					<AlertCircle class="w-3 h-3" />
					{$errors.price}
				</p>
			{/if}
			
			<!-- Quick Price Suggestions -->
			{#if suggestPrice().length > 0}
				<div class="flex gap-2 flex-wrap">
					{#each suggestPrice() as suggestion}
						<button
							type="button"
							onclick={() => $formData.price = suggestion.price}
							class="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
						>
							{suggestion.label} = ${suggestion.price}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Price Analytics -->
		{#if sellingPrice > 0}
			<div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
				<div class="grid grid-cols-2 gap-4">
					{#if discount > 0}
						<div class="text-center">
							<p class="text-xs text-gray-600">Discount</p>
							<p class="text-lg font-bold text-green-600">{discount}% OFF</p>
						</div>
					{/if}
					<div class="text-center">
						<p class="text-xs text-gray-600">You'll earn</p>
						<p class="text-lg font-bold text-gray-900">${profit}</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Brand Selection -->
	<div class="space-y-2">
		<label for="brand" class="block text-sm font-medium text-gray-700">
			Brand <span class="text-red-500">*</span>
		</label>
		<input
			id="brand"
			bind:value={$formData.brand}
			placeholder="e.g., Nike, Zara, Vintage"
			class={cn(
				"block w-full px-4 py-3 text-base border rounded-xl transition-all duration-200",
				$errors.brand 
					? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
					: "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
			)}
			autocomplete="off"
		/>
		
		{#if !$formData.brand}
			<div class="flex flex-wrap gap-2">
				{#each popularBrands as brand}
					<button
						type="button"
						onclick={() => $formData.brand = brand.name}
						class="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
					>
						<span>{brand.emoji}</span>
						{brand.name}
					</button>
				{/each}
			</div>
		{/if}
		
		{#if $errors.brand}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.brand}
			</p>
		{/if}
	</div>
	
	<!-- Size Selection -->
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Size <span class="text-red-500">*</span>
		</label>
		
		<!-- Size Grid -->
		<div class="grid grid-cols-4 gap-2">
			{#each sizeOptions.clothing as size}
				<button
					type="button"
					onclick={() => $formData.size = size}
					class={cn(
						"py-2.5 px-3 rounded-lg border font-medium text-sm transition-all duration-200",
						$formData.size === size
							? "bg-blue-500 border-blue-500 text-white"
							: "bg-white border-gray-200 hover:border-blue-300"
					)}
				>
					{size}
				</button>
			{/each}
		</div>
		
		<!-- Custom Size Input -->
		<input
			bind:value={$formData.size}
			placeholder="Or enter custom size"
			class="block w-full px-4 py-2 text-sm border border-gray-200 rounded-lg mt-2"
		/>
		
		{#if $errors.size}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.size}
			</p>
		{/if}
	</div>
	
	<!-- Color Selection -->
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Main color
		</label>
		
		<!-- Color Swatches -->
		<div class="grid grid-cols-6 gap-2">
			{#each colorOptions as color}
				<button
					type="button"
					onclick={() => $formData.color = color.value}
					class={cn(
						"relative aspect-square rounded-lg border-2 transition-all duration-200 overflow-hidden",
						$formData.color === color.value
							? "border-gray-900 scale-110 shadow-lg"
							: "border-gray-300 hover:border-gray-400"
					)}
					title={color.name}
				>
					{#if color.hex === 'gradient'}
						<div class="w-full h-full bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"></div>
					{:else}
						<div 
							class="w-full h-full" 
							style="background-color: {color.hex}"
						></div>
					{/if}
					{#if color.value === 'white'}
						<div class="absolute inset-0 border border-gray-200"></div>
					{/if}
					{#if $formData.color === color.value}
						<div class="absolute inset-0 bg-black/20 flex items-center justify-center">
							<Check class="w-4 h-4 text-white drop-shadow-lg" />
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Tags Section -->
	<div class="space-y-3">
		<label class="block text-sm font-medium text-gray-700">
			Tags (max 5) - Help buyers find your item
		</label>
		
		<!-- Current Tags -->
		{#if $formData.tags?.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each $formData.tags as tag}
					<span class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
						#{tag}
						<button
							type="button"
							onclick={() => removeTag(tag)}
							class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
						>
							<X class="w-3 h-3" />
						</button>
					</span>
				{/each}
			</div>
		{/if}
		
		<!-- Suggested Tags -->
		{#if ($formData.tags?.length || 0) < 5}
			<div>
				<p class="text-xs text-gray-500 mb-2">Popular tags:</p>
				<div class="flex flex-wrap gap-2">
					{#each suggestedTags as tag}
						{#if !$formData.tags?.includes(tag)}
							<button
								type="button"
								onclick={() => addTag(tag)}
								class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors"
							>
								+ {tag}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Tag Input -->
		{#if ($formData.tags?.length || 0) < 5}
			<input
				bind:value={tagInput}
				placeholder="Add custom tag..."
				class="block w-full px-4 py-2 text-sm border border-gray-200 rounded-lg"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault()
						addTag(tagInput)
					}
				}}
			/>
		{/if}
	</div>
	
	<!-- Pricing Tips -->
	<div class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
		<h4 class="font-medium text-amber-900 mb-2 text-sm flex items-center gap-2">
			<TrendingUp class="w-4 h-4" />
			Pricing tips for quick sales
		</h4>
		<ul class="space-y-1.5 text-xs text-amber-800">
			<li class="flex items-start gap-2">
				<Zap class="w-3 h-3 text-amber-600 mt-0.5" />
				<span>Price 20-30% below retail for faster sales</span>
			</li>
			<li class="flex items-start gap-2">
				<Sparkles class="w-3 h-3 text-amber-600 mt-0.5" />
				<span>Round prices (e.g., $25 vs $24.99) feel more trustworthy</span>
			</li>
			<li class="flex items-start gap-2">
				<Info class="w-3 h-3 text-amber-600 mt-0.5" />
				<span>Check similar items to price competitively</span>
			</li>
		</ul>
	</div>
</div>