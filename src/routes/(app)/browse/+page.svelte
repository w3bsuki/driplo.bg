<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { X } from 'lucide-svelte';
	import StickySearchBar from '$lib/components/search/StickySearchBar.svelte';
	import { throttle, debounce } from '$lib/utils/performance';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { browser } from '$app/environment';
	
	// Import new components
	import SimplifiedTopSellers from '$lib/components/home/SimplifiedTopSellers.svelte';
	import BrowseHeader from '$lib/components/browse/BrowseHeader.svelte';
	import FilterSidebar from '$lib/components/browse/FilterSidebar.svelte';
	import ProductGrid from '$lib/components/browse/ProductGrid.svelte';
	import ActiveFilters from '$lib/components/browse/ActiveFilters.svelte';
	import NoResultsMessage from '$lib/components/browse/NoResultsMessage.svelte';
	import LoadingState from '$lib/components/browse/LoadingState.svelte';
	
	// Error boundaries and UI components
	import { DataErrorBoundary } from '$lib/components/error-boundaries';
	import { ProductCardSkeleton } from '$lib/components/skeletons';
	import { EmptyState } from '$lib/components/ui';

	let { data }: { data: PageData } = $props();

	// Search state
	let searchFocused = $state(false);
	let showQuickSearch = $state(false);
	let showStickySearch = $state(false);


	// Flag to prevent reactive loops during navigation - define early
	let isNavigating = $state(false);

	// Reactive filter states from server data - prevent reactive loops
	let searchInput = $state(data.filters.search || '');
	let sortBy = $state(data.filters.sortBy);
	let priceRange = $state({ 
		min: data.filters.minPrice || 0, 
		max: data.filters.maxPrice || 1000 
	});
	let selectedSizes = $state(new Set(data.filters.sizes));
	let selectedBrands = $state(new Set(data.filters.brands));
	let selectedConditions = $state(new Set(data.filters.conditions));

	// Infinite scroll state
	let allListings = $state([...data.listings]);
	let currentPage = $state(data.pagination.currentPage);
	let hasMoreItems = $state(data.pagination.hasNextPage);
	let loadingMore = $state(false);


	function buildFilterUrl(updates: Record<string, any> = {}) {
		const url = new URL($page.url);
		
		// Apply updates to current filters
		const newFilters = {
			category: updates.category ?? data.filters.category,
			subcategory: updates.subcategory ?? data.filters.subcategory,
			q: updates.search ?? searchInput?.trim(),
			min_price: updates.minPrice ?? (priceRange.min > 0 ? priceRange.min : null),
			max_price: updates.maxPrice ?? (priceRange.max < 10000 ? priceRange.max : null),
			sizes: updates.sizes ?? (selectedSizes.size > 0 ? Array.from(selectedSizes).join(',') : null),
			brands: updates.brands ?? (selectedBrands.size > 0 ? Array.from(selectedBrands).join(',') : null),
			conditions: updates.conditions ?? (selectedConditions.size > 0 ? Array.from(selectedConditions).join(',') : null),
			sort: updates.sort ?? sortBy,
			page: updates.page ?? 1 // Reset to page 1 on filter changes
		};

		// Clear existing params and set new ones
		url.search = '';
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value && value !== '' && value !== 'recent') {
				url.searchParams.set(key, String(value));
			}
		});

		return url.toString();
	}

	// Throttled navigation to prevent double calls
	const throttledNavigate = throttle((url: string) => {
		if (!isNavigating) {
			isNavigating = true;
			goto(url).finally(() => {
				// Reset flag after navigation completes
				setTimeout(() => { isNavigating = false; }, 100);
			});
		}
	}, 200);

	function updateCategory(categorySlug: string) {
		throttledNavigate(buildFilterUrl({ category: categorySlug || null }));
	}

	function handleSearch(query: string) {
		throttledNavigate(buildFilterUrl({ search: query?.trim() || null }));
	}

	// Create debounced search handler
	const debouncedSearch = debounce((query: string) => {
		handleSearch(query);
	}, 500);

	function handleSearchInput(query: string) {
		searchInput = query;
		debouncedSearch(query);
	}

	function handleQuickSearch(suggestion: string) {
		searchInput = suggestion;
		handleSearch(suggestion);
		showQuickSearch = false;
	}

	// Clean up debounced search and throttled navigation on unmount
	$effect(() => {
		return () => {
			debouncedSearch.cancel();
			throttledNavigate.cancel();
		};
	});

	// Scroll detection for sticky search bar
	$effect(() => {
		if (!browser) return;

		function handleScroll() {
			const scrollY = window.scrollY;
			// Show sticky search when scrolled past hero section (approximately 400px)
			showStickySearch = scrollY > 400;
		}

		const throttledHandleScroll = throttle(handleScroll, 100);

		window.addEventListener('scroll', throttledHandleScroll);
		handleScroll(); // Check initial position

		return () => {
			window.removeEventListener('scroll', throttledHandleScroll);
		};
	});

	function updateSort(newSort: string) {
		sortBy = newSort;
		throttledNavigate(buildFilterUrl({ sort: newSort }));
	}

	function updatePriceRange() {
		throttledNavigate(buildFilterUrl({ 
			minPrice: priceRange.min > 0 ? priceRange.min : null,
			maxPrice: priceRange.max < 10000 ? priceRange.max : null
		}));
	}

	function toggleSize(size: string) {
		if (selectedSizes.has(size)) {
			selectedSizes.delete(size);
		} else {
			selectedSizes.add(size);
		}
		selectedSizes = new Set(selectedSizes);
		throttledNavigate(buildFilterUrl({ sizes: selectedSizes.size > 0 ? Array.from(selectedSizes).join(',') : null }));
	}

	function toggleBrand(brand: string) {
		if (selectedBrands.has(brand)) {
			selectedBrands.delete(brand);
		} else {
			selectedBrands.add(brand);
		}
		selectedBrands = new Set(selectedBrands);
		throttledNavigate(buildFilterUrl({ brands: selectedBrands.size > 0 ? Array.from(selectedBrands).join(',') : null }));
	}

	function toggleCondition(condition: string) {
		if (selectedConditions.has(condition)) {
			selectedConditions.delete(condition);
		} else {
			selectedConditions.add(condition);
		}
		selectedConditions = new Set(selectedConditions);
		throttledNavigate(buildFilterUrl({ conditions: selectedConditions.size > 0 ? Array.from(selectedConditions).join(',') : null }));
	}

	function clearAllFilters() {
		throttledNavigate('/browse');
	}

	// Reset infinite scroll state when data changes (filter applied)
	// Only update if we're not currently navigating to prevent loops
	$effect(() => {
		if (!isNavigating) {
			allListings = [...data.listings];
			currentPage = data.pagination.currentPage;
			hasMoreItems = data.pagination.hasNextPage;
			loadingMore = false;
			
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

	async function loadMoreItems() {
		if (loadingMore || !hasMoreItems) return;
		
		loadingMore = true;
		const nextPage = currentPage + 1;

		try {
			const params = new URLSearchParams();
			
			// Add all current filters to the API call
			if (data.filters.category) params.set('category', data.filters.category);
			if (data.filters.subcategory) params.set('subcategory', data.filters.subcategory);
			if (data.filters.search) params.set('q', data.filters.search);
			if (data.filters.minPrice) params.set('min_price', data.filters.minPrice.toString());
			if (data.filters.maxPrice) params.set('max_price', data.filters.maxPrice.toString());
			if (data.filters.sizes.length > 0) params.set('sizes', data.filters.sizes.join(','));
			if (data.filters.brands.length > 0) params.set('brands', data.filters.brands.join(','));
			if (data.filters.conditions.length > 0) params.set('conditions', data.filters.conditions.join(','));
			if (data.filters.sortBy !== 'recent') params.set('sort', data.filters.sortBy);
			params.set('page', nextPage.toString());
			params.set('limit', data.pagination.limit.toString());

			const response = await fetch(`/api/browse/load-more?${params.toString()}`);
			
			if (response.ok) {
				const result = await response.json();
				
				if (result.listings && result.listings.length > 0) {
					allListings = [...allListings, ...result.listings];
					currentPage = nextPage;
					hasMoreItems = result.hasMore;
				} else {
					hasMoreItems = false;
				}
			} else {
				logger.error('Failed to load more items');
				hasMoreItems = false;
			}
		} catch (error) {
			logger.error('Error loading more items:', error);
			hasMoreItems = false;
		} finally {
			loadingMore = false;
		}
	}
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
					onSearch={handleSearch}
					onQuickSearch={handleQuickSearch}
				/>
			</div>
		</div>
	</section>

	<!-- Sticky Search Bar (Desktop & Mobile) -->
	<StickySearchBar
		bind:value={searchInput}
		placeholder="Search for vintage 🕰️, designer 💎, streetwear 🛹..."
		onSearch={handleSearch}
		onCategorySelect={updateCategory}
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
				onCategoryUpdate={updateCategory}
				onPriceUpdate={updatePriceRange}
				onSizeToggle={toggleSize}
				onBrandToggle={toggleBrand}
				onConditionToggle={toggleCondition}
				onClearFilters={clearAllFilters}
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
					onClearSearch={() => throttledNavigate(buildFilterUrl({ search: null }))}
					onClearCategory={() => updateCategory('')}
					onClearSize={toggleSize}
					onClearBrand={toggleBrand}
					onClearCondition={toggleCondition}
					onClearPrice={() => throttledNavigate(buildFilterUrl({ minPrice: null, maxPrice: null }))}
					onClearAllFilters={clearAllFilters}
				/>

				<!-- Product Grid or Empty State with error boundary -->
				<DataErrorBoundary 
					loading={loadingMore}
					data={allListings}
					emptyState={{
						title: allListings.length === 0 ? "No products found" : "Unable to load products",
						description: allListings.length === 0 ? 
							(data.filters.search ? `No results for "${data.filters.search}"` : "Try adjusting your filters") :
							"There was a problem loading the product listings.",
						actionText: allListings.length === 0 ? "Clear Filters" : "Retry",
						onAction: allListings.length === 0 ? clearAllFilters : () => window.location.reload()
					}}
					autoRetry={true}
					maxRetries={2}
				>
					{#if allListings.length > 0}
						<ProductGrid
							listings={allListings}
							userFavorites={data.userFavorites}
							hasMore={hasMoreItems}
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
							onClearFilters={clearAllFilters}
						/>
					{/if}
				</DataErrorBoundary>
			</main>
		</div>
	</div>

</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>