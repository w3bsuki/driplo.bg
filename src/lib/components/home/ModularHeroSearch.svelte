<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import SearchDropdown from '$lib/components/search/SearchDropdown.svelte';
	import TopSellersCarousel from '$lib/components/search/TopSellersCarousel.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		categories?: any[];
		topSellers?: any[];
	}
	
	let { categories = [], topSellers = [] }: Props = $props();
	
	// State
	let searchQuery = $state('');
	let isFocused = $state(false);
	let isSearching = $state(false);
	let showCategories = $state(false);
	let expandedCategories = $state<Set<string>>(new Set());
	let searchBarRef: SearchBar;
	
	// Handlers
	function handleSearch() {
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		showCategories = false;
		
		const params = new URLSearchParams();
		params.set('q', searchQuery.trim());
		goto(`/browse?${params.toString()}`);
		
		setTimeout(() => {
			isSearching = false;
		}, 500);
	}
	
	function handleCategorySelect(category: string, subcategory?: string) {
		// Only close dropdown and navigate when actually selecting a category/subcategory
		showCategories = false;
		if (subcategory) {
			goto(`/${category}/${subcategory}`);
		} else {
			goto(`/${category}`);
		}
	}
	
	function toggleCategory(categorySlug: string) {
		console.log('Toggling category:', categorySlug);
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categorySlug)) {
			newExpanded.delete(categorySlug);
		} else {
			newExpanded.add(categorySlug);
		}
		expandedCategories = newExpanded;
		console.log('Expanded categories:', expandedCategories);
	}
	
	function handleTrendingClick(term: string) {
		searchQuery = term;
		handleSearch();
	}
	
	function handleSellerClick(username: string) {
		goto(`/profile/${username}`);
	}
	
	function handleCloseDropdown() {
		showCategories = false;
	}
	
	function handleSearchFocus() {
		isFocused = true;
		showCategories = true;
	}
	
	function handleSearchClick(e: MouseEvent) {
		e.stopPropagation();
		showCategories = true;
	}
	
	function handleSearchBlur(e: FocusEvent) {
		setTimeout(() => {
			isFocused = false;
			// Don't close dropdown on blur - let user interact with dropdown
			// Only close when explicitly clicking outside or selecting an item
		}, 200);
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		} else if (e.key === 'Escape') {
			showCategories = false;
		}
	}
	
	let searchContainerRef: HTMLDivElement;

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		
		// Don't close if clicking inside our search container
		if (searchContainerRef?.contains(target)) {
			return;
		}
		
		// Close dropdown when clicking outside
		showCategories = false;
	}

	onMount(() => {
		document.addEventListener('click', handleDocumentClick);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<section data-hero-search class="relative bg-white py-8 md:py-12">
	<div class="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none"></div>
	
	<div class="container px-4 relative">
		<div class="max-w-5xl mx-auto">
			
			<!-- Top Sellers as Main Headline -->
			<TopSellersCarousel sellers={topSellers} onSellerClick={handleSellerClick} />

			<!-- Search Section -->
			<div bind:this={searchContainerRef} class="relative max-w-2xl mx-auto search-container" style="z-index: 10;">
				<SearchBar
					bind:this={searchBarRef}
					bind:value={searchQuery}
					placeholder={m.browse_search_placeholder()}
					{isFocused}
					{isSearching}
					{showCategories}
					onFocus={handleSearchFocus}
					onClick={handleSearchClick}
					onBlur={handleSearchBlur}
					onKeydown={handleKeydown}
					onInput={() => {}}
					onClear={() => { 
						searchQuery = ''; 
						searchBarRef?.focus(); 
					}}
					onSearch={handleSearch}
				/>
				
				<SearchDropdown
					isOpen={showCategories}
					{isFocused}
					{expandedCategories}
					onCategoryToggle={toggleCategory}
					onCategorySelect={handleCategorySelect}
					onTrendingClick={handleTrendingClick}
					onClose={handleCloseDropdown}
				/>
			</div>

		</div>
	</div>
</section>