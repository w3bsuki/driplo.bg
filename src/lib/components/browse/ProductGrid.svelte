<script lang="ts">
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { ChevronDown } from 'lucide-svelte';

	let {
		listings,
		userFavorites,
		hasMore,
		onLoadMore,
		totalCount,
		filters,
		categories,
		sortBy,
		onSortUpdate,
		onConditionUpdate = (condition: string[]) => {},
		onBrandUpdate = (brands: string[]) => {}
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
		onConditionUpdate?: (condition: string[]) => void;
		onBrandUpdate?: (brands: string[]) => void;
	} = $props();

	// Derive categories with "All" option for display
	const categoriesWithAll = $derived([
		{ id: '', name: m.browse_all(), slug: '', icon_url: null, parent_id: null },
		...categories
	]);

	const sortOptions = [
		{ value: 'recent', label: m.sort_recent(), mobileLabel: m.mobile_sort_recent() },
		{ value: 'price-low', label: m.sort_price_low(), mobileLabel: m.mobile_sort_price_low() },
		{ value: 'price-high', label: m.sort_price_high(), mobileLabel: m.mobile_sort_price_high() },
		{ value: 'popular', label: m.sort_popular(), mobileLabel: m.mobile_sort_popular() },
		{ value: 'liked', label: m.sort_liked(), mobileLabel: m.sort_liked() }
	];

	// Condition options
	const conditionOptions = [
		{ value: 'new', label: m.listing_condition_new() },
		{ value: 'like-new', label: m.listing_condition_like_new() },
		{ value: 'good', label: m.listing_condition_good() },
		{ value: 'fair', label: m.listing_condition_fair() }
	];

	// Popular brands (simplified list for mobile)
	const popularBrands = [
		'Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Prada'
	];
</script>

<!-- Results Header with Sort Options -->
<div class="bg-white rounded-sm border border-gray-200 mb-3">
	<!-- Desktop Title Row -->
	<div class="hidden sm:block p-3 border-b border-gray-100">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-sm font-semibold text-gray-900">
					{filters.category ? categoriesWithAll.find(c => c.slug === filters.category)?.name : m.browse_all()}
				</h2>
				{#if filters.search}
					<p class="text-xs text-gray-500 mt-0.5">
						{m.browse_results_for()} "{filters.search}"
					</p>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs text-gray-500">{m.browse_items_count({ count: totalCount.toLocaleString() })}</span>
			</div>
		</div>
	</div>
	
	<!-- Mobile Filters Row -->
	<div class="px-3 py-2 flex gap-2 sm:hidden bg-white border-t border-gray-100">
		<!-- Sort Filter -->
		<div class="relative flex-1">
			<select
				bind:value={sortBy}
				onchange={(e) => onSortUpdate(e.currentTarget.value)}
				class="mobile-filter-btn"
			>
				{#each sortOptions as option (option.value)}
					<option value={option.value}>{option.mobileLabel || option.label}</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
		</div>
		
		<!-- Condition Filter -->
		<div class="relative flex-1">
			<select
				value={filters.conditions?.[0] || ''}
				onchange={(e) => onConditionUpdate(e.currentTarget.value ? [e.currentTarget.value] : [])}
				class="mobile-filter-btn"
			>
				<option value="">{m.filter_condition()}</option>
				{#each conditionOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
		</div>
		
		<!-- Brand Filter -->
		<div class="relative flex-1">
			<select
				value={filters.brands?.[0] || ''}
				onchange={(e) => onBrandUpdate(e.currentTarget.value ? [e.currentTarget.value] : [])}
				class="mobile-filter-btn"
			>
				<option value="">{m.filter_brand()}</option>
				{#each popularBrands as brand}
					<option value={brand}>{brand}</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
		</div>
	</div>
	
	<!-- Desktop Sort (moved to its own row) -->
	<div class="p-3 hidden sm:block">
		<div class="flex justify-end">
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
	useContainer={false}
/>

<!-- Items Counter -->
{#if listings.length > 0}
	<div class="mt-4 text-center text-sm text-muted-foreground">
		Showing {listings.length.toLocaleString()} of {totalCount.toLocaleString()} items
		{#if hasMore}
			• Scroll for more
		{/if}
	</div>
{/if}

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	.mobile-filter-btn {
		/* Full width clean design */
		appearance: none;
		width: 100%;
		padding: 7px 24px 7px 10px;
		font-size: 12px;
		font-weight: 500;
		color: rgb(55 65 81);
		background: rgb(255 255 255);
		border: 1px solid rgb(229 231 235);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.1s ease;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	
	.mobile-filter-btn:hover {
		background: rgb(249 250 251);
		border-color: rgb(209 213 219);
	}
	
	.mobile-filter-btn:focus {
		outline: none;
		border-color: rgb(59 130 246);
		box-shadow: 0 0 0 2px rgb(59 130 246 / 0.1);
	}
</style>