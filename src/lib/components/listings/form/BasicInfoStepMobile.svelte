<script lang="ts">
	import { 
		Type, 
		AlignLeft, 
		Tag, 
		Sparkles, 
		Check,
		AlertCircle,
		ChevronRight,
		Package
	} from 'lucide-svelte'
	import type { SuperForm } from 'sveltekit-superforms'
	import * as m from '$lib/paraglide/messages.js'
	import { cn } from '$lib/utils'
	import { onMount } from 'svelte'
	
	interface Props {
		form: SuperForm<any>
		supabase: any
		userId: string
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	// Categories with beautiful emojis
	let categories = $state<any[]>([])
	let subcategories = $state<any[]>([])
	let loadingCategories = $state(true)
	
	// Condition options with visual indicators
	const conditions = [
		{ 
			value: 'new', 
			label: m.listing_condition_new(), 
			icon: '✨',
			color: 'green',
			description: 'Never worn, with tags'
		},
		{ 
			value: 'likenew', 
			label: m.listing_condition_like_new(), 
			icon: '🌟',
			color: 'blue',
			description: 'Worn once or twice'
		},
		{ 
			value: 'verygood', 
			label: m.condition_very_good(), 
			icon: '👍',
			color: 'indigo',
			description: 'Gently used, great condition'
		},
		{ 
			value: 'good', 
			label: m.condition_good(), 
			icon: '👌',
			color: 'amber',
			description: 'Some signs of wear'
		},
		{ 
			value: 'fair', 
			label: m.condition_fair(), 
			icon: '🤏',
			color: 'orange',
			description: 'Visible wear, still wearable'
		}
	]
	
	// Category emojis mapping
	const categoryEmojis: Record<string, string> = {
		'women': '👩',
		'men': '👨',
		'kids': '👶',
		'designer': '💎',
		'home': '🏠'
	}
	
	const subcategoryEmojis: Record<string, string> = {
		'dresses': '👗',
		'shoes': '👠',
		'bags': '👜',
		'jackets': '🧥',
		'jeans': '👖',
		'tops': '👚',
		'accessories': '⌚',
		'jewelry': '💍',
		'suits': '🤵',
		'shirts': '👔',
		'pants': '👖',
		'sneakers': '👟',
		'toys': '🧸',
		'bedding': '🛏️',
		'decor': '🖼️'
	}
	
	// Load categories
	onMount(async () => {
		try {
			const { data } = await supabase
				.from('categories')
				.select('*')
				.order('name')
			
			if (data) {
				categories = data.filter(c => !c.parent_id)
				// Load subcategories for selected category
				if ($formData.category_id) {
					await loadSubcategories($formData.category_id)
				}
			}
		} catch (error) {
			console.error('Failed to load categories:', error)
		} finally {
			loadingCategories = false
		}
	})
	
	async function loadSubcategories(categoryId: string) {
		try {
			const { data } = await supabase
				.from('categories')
				.select('*')
				.eq('parent_id', categoryId)
				.order('name')
			
			if (data) {
				subcategories = data
			}
		} catch (error) {
			console.error('Failed to load subcategories:', error)
		}
	}
	
	function selectCategory(categoryId: string) {
		$formData.category_id = categoryId
		$formData.subcategory_id = '' // Reset subcategory
		loadSubcategories(categoryId)
	}
	
	// Character counts
	let titleCharCount = $derived($formData.title?.length || 0)
	let descCharCount = $derived($formData.description?.length || 0)
	
	// Title suggestions based on category
	let titleSuggestions = $derived(() => {
		const suggestions = []
		if ($formData.category_id) {
			const category = categories.find(c => c.id === $formData.category_id)
			if (category?.slug === 'women') {
				suggestions.push('Beautiful Summer Dress', 'Elegant Evening Gown', 'Casual Chic Top')
			} else if (category?.slug === 'shoes') {
				suggestions.push('Designer Heels Size 7', 'Comfy Sneakers Like New', 'Vintage Boots')
			}
		}
		return suggestions
	}())
</script>

<div class="space-y-6">
	<!-- Step Header with Emoji -->
	<div class="text-center">
		<div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
			<span class="text-2xl">📝</span>
		</div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">Tell us about your item</h2>
		<p class="text-gray-600">The better the details, the faster it sells!</p>
	</div>
	
	<!-- Title Field -->
	<div class="space-y-2">
		<label for="title" class="flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">
				{m.listing_title_label()} <span class="text-red-500">*</span>
			</span>
			<span class={cn(
				"text-xs",
				titleCharCount > 60 ? "text-red-600" : "text-gray-500"
			)}>
				{titleCharCount}/80
			</span>
		</label>
		
		<div class="relative">
			<input
				id="title"
				bind:value={$formData.title}
				placeholder="e.g., Red Nike Sneakers Size 9"
				maxlength="80"
				class={cn(
					"block w-full px-4 py-3 pr-10 text-base border rounded-xl shadow-sm transition-all duration-200",
					"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
					$errors.title 
						? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
						: "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
				)}
				autocomplete="off"
				inputmode="text"
			/>
			<Type class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
		</div>
		
		{#if $errors.title}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.title}
			</p>
		{/if}
		
		{#if titleSuggestions.length > 0 && !$formData.title}
			<div class="flex gap-2 flex-wrap">
				{#each titleSuggestions as suggestion}
					<button
						type="button"
						onclick={() => $formData.title = suggestion}
						class="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
					>
						{suggestion}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Category Selection -->
	<div class="space-y-3">
		<label class="block text-sm font-medium text-gray-700">
			{m.listing_category_label()} <span class="text-red-500">*</span>
		</label>
		
		{#if loadingCategories}
			<div class="grid grid-cols-2 gap-3">
				{#each Array(4) as _}
					<div class="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-3">
				{#each categories as category}
					{@const isSelected = $formData.category_id === category.id}
					<button
						type="button"
						onclick={() => selectCategory(category.id)}
						class={cn(
							"p-4 rounded-xl border-2 transition-all duration-200 text-left",
							isSelected
								? "bg-blue-50 border-blue-300 shadow-sm"
								: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
						)}
					>
						<div class="flex items-center gap-3">
							<span class="text-2xl">{categoryEmojis[category.slug] || '📦'}</span>
							<div class="flex-1">
								<div class="font-medium text-sm text-gray-900">{category.name}</div>
								<div class="text-xs text-gray-500">Click to select</div>
							</div>
							{#if isSelected}
								<Check class="w-4 h-4 text-blue-600" />
							{/if}
						</div>
					</button>
				{/each}
			</div>
		{/if}
		
		{#if $errors.category_id}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.category_id}
			</p>
		{/if}
	</div>
	
	<!-- Subcategory Selection -->
	{#if subcategories.length > 0}
		<div class="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
			<label class="block text-sm font-medium text-gray-700">
				What type? <span class="text-red-500">*</span>
			</label>
			
			<div class="grid grid-cols-2 gap-2">
				{#each subcategories as subcategory}
					{@const isSelected = $formData.subcategory_id === subcategory.id}
					<button
						type="button"
						onclick={() => $formData.subcategory_id = subcategory.id}
						class={cn(
							"px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-2",
							isSelected
								? "bg-blue-500 border-blue-500 text-white"
								: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
						)}
					>
						<span class="text-base">{subcategoryEmojis[subcategory.slug] || '🏷️'}</span>
						<span class="text-sm font-medium">{subcategory.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Condition Selection -->
	<div class="space-y-3">
		<label class="block text-sm font-medium text-gray-700">
			{m.listing_condition_label()} <span class="text-red-500">*</span>
		</label>
		
		<div class="space-y-2">
			{#each conditions as condition}
				{@const isSelected = $formData.condition === condition.value}
				<button
					type="button"
					onclick={() => $formData.condition = condition.value}
					class={cn(
						"w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
						isSelected
							? `bg-${condition.color}-50 border-${condition.color}-300`
							: "bg-white border-gray-200 hover:border-gray-300"
					)}
				>
					<div class="flex items-start gap-3">
						<span class="text-xl mt-0.5">{condition.icon}</span>
						<div class="flex-1">
							<div class="font-medium text-gray-900">{condition.label}</div>
							<div class="text-xs text-gray-500">{condition.description}</div>
						</div>
						{#if isSelected}
							<Check class="w-5 h-5 text-{condition.color}-600 mt-0.5" />
						{/if}
					</div>
				</button>
			{/each}
		</div>
		
		{#if $errors.condition}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.condition}
			</p>
		{/if}
	</div>
	
	<!-- Description Field -->
	<div class="space-y-2">
		<label for="description" class="flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">
				{m.listing_description_label()} <span class="text-red-500">*</span>
			</span>
			<span class={cn(
				"text-xs",
				descCharCount < 20 ? "text-amber-600" : "text-gray-500"
			)}>
				{descCharCount}/1000
			</span>
		</label>
		
		<textarea
			id="description"
			bind:value={$formData.description}
			placeholder="Describe your item's features, measurements, flaws (if any), and why you're selling..."
			rows="4"
			maxlength="1000"
			class={cn(
				"block w-full px-4 py-3 text-base border rounded-xl shadow-sm transition-all duration-200",
				"placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 resize-none",
				$errors.description 
					? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
					: "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
			)}
			inputmode="text"
		/>
		
		{#if $errors.description}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.description}
			</p>
		{:else if descCharCount < 20}
			<p class="text-xs text-amber-600">
				Add more details to help buyers understand your item better
			</p>
		{/if}
	</div>
	
	<!-- Tips Card -->
	<div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
		<h4 class="font-medium text-blue-900 mb-2 text-sm flex items-center gap-2">
			<Sparkles class="w-4 h-4" />
			Pro tips for faster sales
		</h4>
		<ul class="space-y-1.5 text-xs text-blue-800">
			<li class="flex items-start gap-2">
				<span class="text-blue-500 mt-0.5">•</span>
				<span>Include brand, size, and color in your title</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-blue-500 mt-0.5">•</span>
				<span>Mention any flaws honestly - buyers appreciate transparency</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-blue-500 mt-0.5">•</span>
				<span>Add measurements for clothing items</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-blue-500 mt-0.5">•</span>
				<span>Use keywords buyers might search for</span>
			</li>
		</ul>
	</div>
</div>