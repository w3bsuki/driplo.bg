<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import SearchDropdown from '$lib/components/search/SearchDropdown.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
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
		
		if (searchContainerRef?.contains(target)) {
			return;
		}
		
		showCategories = false;
	}

	onMount(() => {
		document.addEventListener('click', handleDocumentClick);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<section data-hero-search class="relative bg-white">
	<!-- Search Section -->
	<div class="container px-4 py-3">
		<div class="max-w-2xl mx-auto">
			<div bind:this={searchContainerRef} class="relative">
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
					onCloseDropdown={handleCloseDropdown}
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