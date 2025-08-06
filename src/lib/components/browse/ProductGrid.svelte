<script lang="ts">
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		listings,
		userFavorites,
		hasMore,
		onLoadMore,
		totalCount,
		filters,
		categories,
		sortBy,
		onSortUpdate
	}: {
		listings: any[];
		userFavorites: any;
		hasMore: boolean;
		onLoadMore: () => void;
		totalCount: number;
		filters: any;
		categories: any[];
		sortBy: string;
		onSortUpdate: (sort: string) => void;
	} = $props();

	// Derive categories with "All" option for display
	const categoriesWithAll = $derived([
		{ id: '', name: m.browse_all(), slug: '', icon_url: null, parent_id: null },
		...categories
	]);

	const sortOptions = [
		{ value: 'recent', label: m.sort_recent() },
		{ value: 'price-low', label: m.sort_price_low() },
		{ value: 'price-high', label: m.sort_price_high() },
		{ value: 'popular', label: m.sort_popular() },
		{ value: 'liked', label: m.sort_liked() }
	];
</script>

<!-- Results Header with Sort Options -->
<div class="bg-white rounded-sm border border-gray-200 p-3 mb-3">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-sm font-semibold text-gray-900">
				{filters.category ? categoriesWithAll.find(c => c.slug === filters.category)?.name : 'All Items'}
			</h2>
			{#if filters.search}
				<p class="text-sm text-gray-500 mt-1">
					Results for "{filters.search}"
				</p>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-500">{totalCount.toLocaleString()} items</span>
			<select
				bind:value={sortBy}
				onchange={(e) => onSortUpdate(e.currentTarget.value)}
				class="rounded-sm border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-transparent"
			>
				{#each sortOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<!-- Product Grid -->
<ListingGrid 
	{listings}
	title="" 
	infiniteScroll={true}
	{hasMore}
	onLoadMore={onLoadMore}
	{userFavorites}
/>

<!-- Items Counter -->
{#if listings.length > 0}
	<div class="mt-4 text-center text-sm text-muted-foreground">
		Showing {listings.length.toLocaleString()} of {totalCount.toLocaleString()} results
		{#if hasMore}
			• Scroll down to load more
		{/if}
	</div>
{/if}