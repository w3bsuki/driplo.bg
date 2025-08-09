<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { page } from '$app/stores';
	import HorizontalCategorySelector from '$lib/components/search/HorizontalCategorySelector.svelte';
	import { Menu, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let {
		searchInput = $bindable(''),
		searchFocused = $bindable(false),
		showQuickSearch = $bindable(false),
		categories = [],
		activeCategory = '',
		onSearch,
		onQuickSearch,
		onCategorySelect
	}: {
		searchInput: string;
		searchFocused: boolean;
		showQuickSearch: boolean;
		categories?: any[];
		activeCategory?: string;
		onSearch: (query: string) => void;
		onQuickSearch: (suggestion: string) => void;
		onCategorySelect?: (category: string) => void;
	} = $props();

	// State for showing categories
	let showCategories = $state(false);

	// Quick search suggestions with proper translations
	const quickSearchSuggestions = $derived([
		{ text: m.designer_vintage_pieces().split(' ')[0], emoji: '🕰️' }, // Vintage
		{ text: m.category_designer(), emoji: '💎' },
		{ text: 'Streetwear', emoji: '🛹' }, // No translation available
		{ text: m.men_suits_formal().split(' ')[2] || 'Formal', emoji: '👔' },
		{ text: m.women_shoes(), emoji: '👟' },
		{ text: m.category_bags(), emoji: '👜' },
		{ text: m.subcategory_jewelry(), emoji: '💍' },
		{ text: m.subcategory_watches(), emoji: '⌚' }
	]);

	function toggleCategories() {
		showCategories = !showCategories;
		if (showCategories) {
			showQuickSearch = false;
		}
	}
</script>

<!-- Search Bar with Category Button -->
<div class="space-y-3">
	<div class="relative group">
		<div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-xl opacity-20 transition-all duration-100 group-focus-within:opacity-30 group-focus-within:blur-2xl"></div>
		
		<div class="relative bg-white rounded-xl border border-gray-200 transition-all duration-100 group-focus-within:border-blue-400">
			<div class="flex items-center">
				<!-- Category Toggle Button -->
				<button
					onclick={toggleCategories}
					type="button"
					class={cn(
						"ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
						showCategories 
							? "bg-blue-500 text-white hover:bg-blue-600" 
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					)}
				>
					{#if showCategories}
						<X class="h-4 w-4" />
					{:else}
						<Menu class="h-4 w-4" />
					{/if}
					<span class="hidden sm:inline">{m.filter_categories()}</span>
				</button>
				
				<div class="pl-3 pr-2">
					<span class="text-lg">🔍</span>
				</div>
				
				<input
					type="search"
					placeholder={m.header_search_placeholder()}
					bind:value={searchInput}
					onfocus={() => { 
						searchFocused = true; 
						showQuickSearch = true; 
						showCategories = false; 
					}}
					onblur={() => { 
						searchFocused = false; 
						setTimeout(() => {
							showQuickSearch = false;
						}, 200); 
					}}
					onkeydown={(e) => { 
						if (e.key === 'Enter') { 
							onSearch(searchInput); 
							showQuickSearch = false;
						} 
					}}
					class="flex-1 py-3 md:py-3.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent"
				/>
				
				<!-- Search Icon Button -->
				<button
					onclick={() => onSearch(searchInput)}
					type="button"
					class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
					aria-label="{m.nav_search()}"
				>
					<span class="text-lg">🔍</span>
				</button>
			</div>
		
			<!-- Quick Search Suggestions -->
			{#if showQuickSearch}
				<div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-sm shadow-md border border-gray-200 p-3 z-50">
					<p class="text-sm font-medium text-gray-700 mb-2">Popular searches:</p>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
						{#each quickSearchSuggestions as suggestion (suggestion.text)}
							<button
								onmousedown={() => onQuickSearch(suggestion.text)}
								class="flex items-center gap-2 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-sm transition-colors duration-100 text-sm"
							>
								<span class="text-lg">{suggestion.emoji}</span>
								<span class="text-gray-700">{suggestion.text}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Horizontal Category Selector -->
	{#if showCategories}
		<div class="bg-white rounded-xl border border-gray-200 p-4">
			<HorizontalCategorySelector
				{categories}
				{activeCategory}
				{onCategorySelect}
			/>
		</div>
	{/if}
</div>