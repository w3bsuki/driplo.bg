<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let {
		searchInput = $bindable(''),
		searchFocused = $bindable(false),
		showQuickSearch = $bindable(false),
		onSearch,
		onQuickSearch
	}: {
		searchInput: string;
		searchFocused: boolean;
		showQuickSearch: boolean;
		onSearch: (query: string) => void;
		onQuickSearch: (suggestion: string) => void;
	} = $props();

	// Quick search suggestions
	const quickSearchSuggestions = [
		{ text: 'Vintage', emoji: '🕰️' },
		{ text: 'Designer', emoji: '💎' },
		{ text: 'Streetwear', emoji: '🛹' },
		{ text: 'Formal', emoji: '👔' },
		{ text: 'Shoes', emoji: '👟' },
		{ text: 'Bags', emoji: '👜' },
		{ text: 'Jewelry', emoji: '💍' },
		{ text: 'Watches', emoji: '⌚' }
	];
</script>

<!-- Search Bar with Emoji -->
<div class="relative group">
	<div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm blur-xl opacity-20 transition-all duration-100 group-focus-within:opacity-30 group-focus-within:blur-2xl"></div>
	
	<div class="relative bg-white rounded-sm border border-gray-200 transition-all duration-100">
		<div class="flex items-center">
			<div class="pl-3 pr-2">
				<span class="text-2xl">🔍</span>
			</div>
			
			<input
				type="search"
				placeholder={m.header_search_placeholder()}
				bind:value={searchInput}
				onfocus={() => { searchFocused = true; showQuickSearch = true; }}
				onblur={() => { searchFocused = false; setTimeout(() => showQuickSearch = false, 200); }}
				onkeydown={(e) => { if (e.key === 'Enter') { onSearch(searchInput); } }}
				class="flex-1 py-2 md:py-3 pr-3 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent"
			/>
			
			<button
				onclick={() => onSearch(searchInput)}
				class="mr-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-sm text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-100 active:scale-95"
			>
				Search
			</button>
		</div>
		
		<!-- Quick Search Suggestions -->
		{#if showQuickSearch}
			<div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-sm shadow-md border border-gray-200 p-3 z-50">
				<p class="text-sm font-medium text-gray-700 mb-2">Quick searches:</p>
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