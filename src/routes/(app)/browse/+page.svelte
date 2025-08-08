<script lang="ts">
	import { page } from '$app/stores';
	import StickySearchBar from '$lib/components/search/StickySearchBar.svelte';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	// Import components
	import SimplifiedTopSellers from '$lib/components/home/SimplifiedTopSellers.svelte';
	import BrowseHeader from '$lib/components/browse/BrowseHeader.svelte';
	import FilterSidebar from '$lib/components/browse/FilterSidebar.svelte';
	import ProductGrid from '$lib/components/browse/ProductGrid.svelte';
	import ActiveFilters from '$lib/components/browse/ActiveFilters.svelte';
	import NoResultsMessage from '$lib/components/browse/NoResultsMessage.svelte';

	// Error boundaries
	import { DataErrorBoundary } from '$lib/components/error-boundaries';

	// Import custom hooks
	import { useFilterNavigation } from '$lib/utils/useFilterNavigation';
	import { useInfiniteScroll } from '$lib/utils/useInfiniteScroll';
	import { useSearchState } from '$lib/utils/useSearchState';

	let { data }: { data: PageData } = $props();

	// Search state
	let searchInput = $state(data.filters.search || '');
	let searchFocused = $state(false);
	let showQuickSearch = $state(false);
	let showStickySearch = $state(false);

	// Navigation state
	let isNavigating = $state(false);

	// Filter states
	let sortBy = $state(data.filters.sortBy);
	let priceRange = $state({ 
		min: data.filters.minPrice || 0, 
		max: data.filters.maxPrice || 1000 
	});
	let selectedSizes = $state(new Set(data.filters.sizes));
	let selectedBrands = $state(new Set(data.filters.brands));
	let selectedConditions = $state(new Set(data.filters.conditions));

	// Initialize hooks
	const filterNavigation = useFilterNavigation({
		data,
		currentUrl: $page.url,
		isNavigating,
		setNavigating: (value: boolean) => { isNavigating = value; }
	});

	const infiniteScroll = useInfiniteScroll({
		data,
		apiEndpoint: '/api/browse/load-more'
	});

	const searchState = useSearchState({
		initialSearchTerm: data.filters.search || '',
		onSearch: filterNavigation.handlers.updateSearch
	});

	// Infinite scroll state
	let scrollState = $state(infiniteScroll.initializeState());

	// Handler functions using the hooks
	function handleSearchInput(query: string) {
		searchState.handleSearchInput(query, (value) => { searchInput = value; });
	}

	function handleQuickSearch(suggestion: string) {
		searchState.handleQuickSearch(
			suggestion,
			(value) => { searchInput = value; },
			(show) => { showQuickSearch = show; }
		);
	}

	function toggleSize(size: string) {
		if (selectedSizes.has(size)) {
			selectedSizes.delete(size);
		} else {
			selectedSizes.add(size);
		}
		selectedSizes = new Set(selectedSizes);
		filterNavigation.handlers.updateSizes(selectedSizes);
	}

	function toggleBrand(brand: string) {
		if (selectedBrands.has(brand)) {
			selectedBrands.delete(brand);
		} else {
			selectedBrands.add(brand);
		}
		selectedBrands = new Set(selectedBrands);
		filterNavigation.handlers.updateBrands(selectedBrands);
	}

	function toggleCondition(condition: string) {
		if (selectedConditions.has(condition)) {
			selectedConditions.delete(condition);
		} else {
			selectedConditions.add(condition);
		}
		selectedConditions = new Set(selectedConditions);
		filterNavigation.handlers.updateConditions(selectedConditions);
	}

	function updatePriceRange() {
		filterNavigation.handlers.updatePriceRange(priceRange.min, priceRange.max);
	}

	function updateSort(newSort: string) {
		sortBy = newSort;
		filterNavigation.handlers.updateSort(newSort);
	}

	async function loadMoreItems() {
		scrollState = await infiniteScroll.loadMoreItems(scrollState, data.filters, data.pagination);
	}

	// Reset infinite scroll state when data changes (filter applied)
	$effect(() => {
		if (!isNavigating) {
			scrollState = infiniteScroll.resetState(data);
			
			// Sync filter states with server data (without triggering navigation)
			searchInput = data.filters.search || '';
			sortBy = data.filters.sortBy;
			priceRange = { 
				min: data.filters.minPrice || 0, 
				max: data.filters.maxPrice || 1000 
			};
			selectedSizes = new Set(data.filters.sizes);
			selectedBrands = new Set(data.filters.brands);
			selectedConditions = new Set(data.filters.conditions);
		}
	});

	// Set up scroll listener for sticky search
	$effect(() => {
		const cleanup = searchState.setupScrollListener((show) => { showStickySearch = show; });
		return cleanup;
	});

	// Cleanup on unmount
	$effect(() => {
		return () => {
			filterNavigation.cleanup();
			searchState.cleanup();
		};
	});
</script>

<svelte:head>
	<title>{m.header_browse()} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Hero Section with Top Sellers and Search -->
	<section class="relative bg-gradient-to-b from-blue-50 to-white py-3 md:py-4">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto">
				<!-- Top Sellers Section with error boundary -->
				<DataErrorBoundary 
					emptyState={{
						title: "Unable to load top sellers",
						description: "There was a problem loading the top sellers section.",
						actionText: "Retry",
						onAction: () => window.location.reload()
					}}
				>
					<SimplifiedTopSellers sellers={data.topSellers || []} />
				</DataErrorBoundary>
				
				<!-- Search Header -->
				<BrowseHeader
					bind:searchInput
					bind:searchFocused
					bind:showQuickSearch
					onSearch={filterNavigation.handlers.updateSearch}
					onQuickSearch={handleQuickSearch}
				/>
			</div>
		</div>
	</section>

	<!-- Sticky Search Bar (Desktop & Mobile) -->
	<StickySearchBar
		bind:value={searchInput}
		placeholder="Search for vintage 🕰️, designer 💎, streetwear 🛹..."
		onSearch={filterNavigation.handlers.updateSearch}
		onCategorySelect={filterNavigation.handlers.updateCategory}
		categories={data.categories}
		activeCategory={data.filters.category}
		visible={showStickySearch}
	/>

	<div class="container mx-auto px-4 py-3">
		<div class="flex gap-3">
			<!-- Filter Sidebar -->
			<FilterSidebar
				categories={data.categories}
				popularBrands={data.popularBrands}
				filters={data.filters}
				bind:selectedSizes
				bind:selectedBrands
				bind:selectedConditions
				bind:priceRange
				onCategoryUpdate={filterNavigation.handlers.updateCategory}
				onPriceUpdate={updatePriceRange}
				onSizeToggle={toggleSize}
				onBrandToggle={toggleBrand}
				onConditionToggle={toggleCondition}
				onClearFilters={filterNavigation.handlers.clearAllFilters}
			/>

			<!-- Main Content -->
			<main class="flex-1">
				<!-- Active Filters -->
				<ActiveFilters
					filters={data.filters}
					categories={data.categories}
					{selectedSizes}
					{selectedBrands}
					{selectedConditions}
					onClearSearch={() => filterNavigation.handlers.clearFilter('search')}
					onClearCategory={() => filterNavigation.handlers.clearFilter('category')}
					onClearSize={toggleSize}
					onClearBrand={toggleBrand}
					onClearCondition={toggleCondition}
					onClearPrice={() => filterNavigation.handlers.clearFilter('price')}
					onClearAllFilters={filterNavigation.handlers.clearAllFilters}
				/>

				<!-- Product Grid or Empty State with error boundary -->
				<DataErrorBoundary 
					loading={scrollState.loadingMore}
					data={scrollState.allListings}
					emptyState={{
						title: scrollState.allListings.length === 0 ? "No products found" : "Unable to load products",
						description: scrollState.allListings.length === 0 ? 
							(data.filters.search ? `No results for "${data.filters.search}"` : "Try adjusting your filters") :
							"There was a problem loading the product listings.",
						actionText: scrollState.allListings.length === 0 ? "Clear Filters" : "Retry",
						onAction: scrollState.allListings.length === 0 ? filterNavigation.handlers.clearAllFilters : () => window.location.reload()
					}}
					autoRetry={true}
					maxRetries={2}
				>
					{#if scrollState.allListings.length > 0}
						<ProductGrid
							listings={scrollState.allListings}
							userFavorites={data.userFavorites}
							hasMore={scrollState.hasMoreItems}
							onLoadMore={loadMoreItems}
							totalCount={data.totalCount}
							filters={data.filters}
							categories={data.categories}
							bind:sortBy
							onSortUpdate={updateSort}
						/>
					{:else}
						<NoResultsMessage
							searchTerm={data.filters.search}
							onClearFilters={filterNavigation.handlers.clearAllFilters}
						/>
					{/if}
				</DataErrorBoundary>
			</main>
		</div>
	</div>
</div>