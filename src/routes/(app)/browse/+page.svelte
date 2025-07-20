<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Search, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	import SearchInput from '$lib/components/search/SearchInput.svelte';
	import { cn } from '$lib/utils';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();

	// Reactive filter states from server data
	let searchInput = $state(data.filters.search);
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

	// Derive categories with "All" option
	const categoriesWithAll = $derived([
		{ id: '', name: m.browse_all(), slug: '', icon_url: null, parent_id: null },
		...data.categories
	]);

	// Available condition options
	const conditionOptions = [
		{ value: 'new_with_tags', label: m.condition_new_with_tags() },
		{ value: 'like_new', label: m.condition_like_new() },
		{ value: 'good', label: m.condition_good() },
		{ value: 'fair', label: m.condition_fair() },
		{ value: 'poor', label: m.condition_poor() }
	];

	const sortOptions = [
		{ value: 'recent', label: m.sort_recent() },
		{ value: 'price-low', label: m.sort_price_low() },
		{ value: 'price-high', label: m.sort_price_high() },
		{ value: 'popular', label: m.sort_popular() },
		{ value: 'liked', label: m.sort_liked() }
	];

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

	function updateCategory(categorySlug: string) {
		goto(buildFilterUrl({ category: categorySlug || null }));
	}

	function handleSearch(query: string) {
		goto(buildFilterUrl({ search: query?.trim() || null }));
	}

	function handleSearchInput(query: string) {
		searchInput = query;
	}

	function updateSort(newSort: string) {
		sortBy = newSort;
		goto(buildFilterUrl({ sort: newSort }));
	}

	function updatePriceRange() {
		goto(buildFilterUrl({ 
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
		goto(buildFilterUrl({ sizes: selectedSizes.size > 0 ? Array.from(selectedSizes).join(',') : null }));
	}

	function toggleBrand(brand: string) {
		if (selectedBrands.has(brand)) {
			selectedBrands.delete(brand);
		} else {
			selectedBrands.add(brand);
		}
		selectedBrands = new Set(selectedBrands);
		goto(buildFilterUrl({ brands: selectedBrands.size > 0 ? Array.from(selectedBrands).join(',') : null }));
	}

	function toggleCondition(condition: string) {
		if (selectedConditions.has(condition)) {
			selectedConditions.delete(condition);
		} else {
			selectedConditions.add(condition);
		}
		selectedConditions = new Set(selectedConditions);
		goto(buildFilterUrl({ conditions: selectedConditions.size > 0 ? Array.from(selectedConditions).join(',') : null }));
	}

	function clearAllFilters() {
		goto('/browse');
	}


	// Size options
	const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16'];

	// Reset infinite scroll state when data changes (filter applied)
	$effect(() => {
		allListings = [...data.listings];
		currentPage = data.pagination.currentPage;
		hasMoreItems = data.pagination.hasNextPage;
		loadingMore = false;
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
				console.error('Failed to load more items');
				hasMoreItems = false;
			}
		} catch (error) {
			console.error('Error loading more items:', error);
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
	<!-- Page Header -->
	<div class="bg-white border-b">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-semibold text-gray-900">{m.header_browse()}</h1>
				<span class="text-sm text-gray-500">{data.totalCount.toLocaleString()} {m.browse_items_count({ count: '' }).replace('{count}', '').trim()}</span>
			</div>
		</div>
	</div>

	<!-- Mobile Search & Filters -->
	<div class="sticky top-[64px] z-40 bg-white border-b block md:hidden">
		<div class="p-4 space-y-3">
			<!-- Search Bar -->
			<SearchInput
				value={searchInput}
				onSearch={handleSearch}
				onInput={handleSearchInput}
				class="w-full"
			/>

			<!-- Category Pills -->
			<div class="overflow-x-auto -mx-4 px-4">
				<div class="flex gap-2 pb-2">
					{#each categoriesWithAll as category}
						<button
							onclick={() => updateCategory(category.slug)}
							class={cn(
								"whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all flex-shrink-0",
								data.filters.category === category.slug
									? "bg-blue-300 text-white shadow-sm"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							{category.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Active Filters Bar -->
			{#if data.filters.search || selectedSizes.size > 0 || selectedBrands.size > 0 || selectedConditions.size > 0 || (priceRange.min > 0 || priceRange.max < 10000)}
				<div class="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
					<span class="text-sm text-blue-800 font-medium">Active filters</span>
					<button
						onclick={clearAllFilters}
						class="text-sm text-blue-600 hover:text-blue-800 font-medium"
					>
						{m.filter_clear_all()}
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="container mx-auto px-4 py-6">
		<div class="flex gap-6">
			<!-- Desktop Sidebar -->
			<aside class="hidden md:block w-72 flex-shrink-0">
				<div class="sticky top-24 space-y-4">
					<!-- Search Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">Search</h3>
						<SearchInput
							value={searchInput}
							onSearch={handleSearch}
							onInput={handleSearchInput}
							class="w-full"
						/>
					</div>

					<!-- Categories Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">{m.browse_categories()}</h3>
						<div class="space-y-1">
							{#each categoriesWithAll as category}
								<button
									onclick={() => updateCategory(category.slug)}
									class={cn(
										"w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
										data.filters.category === category.slug
											? "bg-blue-50 text-blue-700 font-medium"
											: "hover:bg-gray-50 text-gray-700"
									)}
								>
									<span class="text-base">{category.icon_url || '📦'}</span>
									<span>{category.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Price Range Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">{m.browse_price_range()}</h3>
						<div class="space-y-3">
							<div class="flex gap-2">
								<input
									type="number"
									placeholder={m.browse_price_min()}
									bind:value={priceRange.min}
									onblur={updatePriceRange}
									class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
								/>
								<span class="text-gray-400 self-center">-</span>
								<input
									type="number"
									placeholder={m.browse_price_max()}
									bind:value={priceRange.max}
									onblur={updatePriceRange}
									class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
								/>
							</div>
							<button
								onclick={updatePriceRange}
								class="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
							>
								Apply Price Range
							</button>
						</div>
					</div>

					<!-- Sizes Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">{m.browse_size()}</h3>
						<div class="grid grid-cols-3 gap-2">
							{#each sizeOptions as size}
								<button
									onclick={() => toggleSize(size)}
									class={cn(
										"px-3 py-2 rounded-lg text-sm font-medium transition-all",
										selectedSizes.has(size)
											? "bg-blue-300 text-white shadow-sm"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									)}
								>
									{size}
								</button>
							{/each}
						</div>
					</div>

					<!-- Conditions Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">{m.browse_condition()}</h3>
						<div class="space-y-2">
							{#each conditionOptions as condition}
								<label class="flex items-center gap-3 py-1 cursor-pointer group">
									<input
										type="checkbox"
										checked={selectedConditions.has(condition.value)}
										onchange={() => toggleCondition(condition.value)}
										class="w-4 h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-2"
									/>
									<span class="text-sm text-gray-700 group-hover:text-gray-900">{condition.label}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Brands Card -->
					<div class="bg-white rounded-xl border border-gray-200 p-4">
						<h3 class="font-semibold text-gray-900 mb-3">{m.browse_brand()}</h3>
						<div class="space-y-2 max-h-48 overflow-y-auto">
							{#each data.popularBrands as brand}
								<label class="flex items-center gap-3 py-1 cursor-pointer group">
									<input
										type="checkbox"
										checked={selectedBrands.has(brand)}
										onchange={() => toggleBrand(brand)}
										class="w-4 h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-2"
									/>
									<span class="text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Clear Filters Button -->
					{#if data.filters.search || data.filters.category || selectedSizes.size > 0 || selectedBrands.size > 0 || selectedConditions.size > 0 || data.filters.minPrice || data.filters.maxPrice}
						<button
							onclick={clearAllFilters}
							class="w-full px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
						>
							{m.browse_clear_filters()}
						</button>
					{/if}
				</div>
			</aside>

			<!-- Main Content -->
			<main class="flex-1">
				<!-- Desktop Sort Options -->
				<div class="hidden md:block bg-white rounded-xl border border-gray-200 p-4 mb-4">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-lg font-semibold text-gray-900">
								{data.filters.category ? categoriesWithAll.find(c => c.slug === data.filters.category)?.name : 'All Items'}
							</h2>
							{#if data.filters.search}
								<p class="text-sm text-gray-500 mt-1">
									Results for "{data.filters.search}"
								</p>
							{/if}
						</div>
						<div class="flex items-center gap-4">
							<span class="text-sm text-gray-500">{data.totalCount.toLocaleString()} items</span>
							<select
								bind:value={sortBy}
								onchange={(e) => updateSort(e.currentTarget.value)}
								class="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
							>
								{#each sortOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Active Filters Display -->
				{#if data.filters.search || data.filters.category || selectedSizes.size > 0 || selectedBrands.size > 0 || selectedConditions.size > 0 || data.filters.minPrice || data.filters.maxPrice}
					<div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
						<div class="flex items-center justify-between mb-3">
							<h3 class="text-sm font-semibold text-gray-900">Active Filters</h3>
							<button
								onclick={clearAllFilters}
								class="text-sm text-blue-600 hover:text-blue-800 font-medium"
							>
								{m.browse_clear_filters()}
							</button>
						</div>
						<div class="flex flex-wrap gap-2">
							{#if data.filters.search}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									Search: "{data.filters.search}"
									<button onclick={() => goto(buildFilterUrl({ search: null }))} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/if}
							{#if data.filters.category}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									{categoriesWithAll.find(c => c.slug === data.filters.category)?.name}
									<button onclick={() => updateCategory('')} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/if}
							{#each Array.from(selectedSizes) as size}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									Size {size}
									<button onclick={() => toggleSize(size)} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/each}
							{#each Array.from(selectedBrands) as brand}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									{brand}
									<button onclick={() => toggleBrand(brand)} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/each}
							{#each Array.from(selectedConditions) as condition}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									{conditionOptions.find(c => c.value === condition)?.label}
									<button onclick={() => toggleCondition(condition)} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/each}
							{#if data.filters.minPrice || data.filters.maxPrice}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
									${data.filters.minPrice || 0} - ${data.filters.maxPrice || '∞'}
									<button onclick={() => goto(buildFilterUrl({ minPrice: null, maxPrice: null }))} class="hover:text-blue-900">
										<X class="h-3.5 w-3.5" />
									</button>
								</span>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Product Grid -->
				<ListingGrid 
					listings={allListings} 
					title="" 
					infiniteScroll={true}
					hasMore={hasMoreItems}
					onLoadMore={loadMoreItems}
					userFavorites={data.userFavorites}
					supabase={data.supabase}
				/>

				<!-- Items Counter -->
				{#if allListings.length > 0}
					<div class="mt-4 text-center text-sm text-muted-foreground">
						Showing {allListings.length.toLocaleString()} of {data.totalCount.toLocaleString()} results
						{#if hasMoreItems}
							• Scroll down to load more
						{/if}
					</div>
				{/if}
			</main>
		</div>
	</div>

</div>