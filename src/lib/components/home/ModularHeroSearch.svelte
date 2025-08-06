<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import SearchDropdown from '$lib/components/search/SearchDropdown.svelte';
	import TopSellersCarousel from '$lib/components/search/TopSellersCarousel.svelte';
	
	interface Props {
		categories?: any[];
	}
	
	let { categories = [] }: Props = $props();
	
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
		showCategories = false;
		if (subcategory) {
			goto(`/${category}/${subcategory}`);
		} else {
			goto(`/${category}`);
		}
	}
	
	function toggleCategory(categorySlug: string) {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categorySlug)) {
			newExpanded.delete(categorySlug);
		} else {
			newExpanded.add(categorySlug);
		}
		expandedCategories = newExpanded;
	}
	
	function handleTrendingClick(term: string) {
		searchQuery = term;
		handleSearch();
	}
	
	function handleSellerClick(username: string) {
		goto(`/profile/${username}`);
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
			if (!searchQuery) {
				showCategories = false;
			}
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
	
	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const searchContainer = document.querySelector('.search-container');
		if (!searchContainer?.contains(target)) {
			showCategories = false;
		}
	}
	
	onMount(() => {
		document.addEventListener('click', handleDocumentClick);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<section class="relative bg-white py-8 md:py-12">
	<div class="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none"></div>
	
	<div class="container px-4 relative">
		<div class="max-w-5xl mx-auto">
			
			<!-- Top Sellers as Main Headline -->
			<TopSellersCarousel onSellerClick={handleSellerClick} />

			<!-- Search Section -->
			<div class="relative max-w-2xl mx-auto search-container" style="z-index: 10;">
				<SearchBar
					bind:this={searchBarRef}
					bind:value={searchQuery}
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
				/>
			</div>

		</div>
	</div>
</section>