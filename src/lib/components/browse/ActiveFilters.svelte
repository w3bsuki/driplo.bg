<script lang="ts">
	import { X } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		filters,
		categories,
		selectedSizes,
		selectedBrands,
		selectedConditions,
		onClearSearch,
		onClearCategory,
		onClearSize,
		onClearBrand,
		onClearCondition,
		onClearPrice,
		onClearAllFilters
	}: {
		filters: any;
		categories: any[];
		selectedSizes: Set<string>;
		selectedBrands: Set<string>;
		selectedConditions: Set<string>;
		onClearSearch: () => void;
		onClearCategory: () => void;
		onClearSize: (size: string) => void;
		onClearBrand: (brand: string) => void;
		onClearCondition: (condition: string) => void;
		onClearPrice: () => void;
		onClearAllFilters: () => void;
	} = $props();

	// Derive categories with "All" option for display
	const categoriesWithAll = $derived([
		{ id: '', name: m.browse_all(), slug: '', icon_url: null, parent_id: null },
		...categories
	]);

	// Available condition options for label lookup
	const conditionOptions = [
		{ value: 'new_with_tags', label: m.condition_new_with_tags() },
		{ value: 'like_new', label: m.condition_like_new() },
		{ value: 'good', label: m.condition_good() },
		{ value: 'fair', label: m.condition_fair() },
		{ value: 'poor', label: m.condition_poor() }
	];

	// Check if any filters are active
	const hasActiveFilters = $derived(
		filters.search || 
		filters.category || 
		selectedSizes.size > 0 || 
		selectedBrands.size > 0 || 
		selectedConditions.size > 0 || 
		filters.minPrice || 
		filters.maxPrice
	);
</script>

{#if hasActiveFilters}
	<div class="bg-white rounded-sm border border-gray-200 p-3 mb-3">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm font-semibold text-gray-900">Active Filters</h3>
			<button
				onclick={onClearAllFilters}
				class="text-sm text-blue-600 hover:text-blue-800 font-medium"
			>
				{m.browse_clear_filters()}
			</button>
		</div>
		<div class="flex flex-wrap gap-2">
			{#if filters.search}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					Search: "{filters.search}"
					<button onclick={onClearSearch} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/if}
			{#if filters.category}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					{categoriesWithAll.find(c => c.slug === filters.category)?.name}
					<button onclick={onClearCategory} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/if}
			{#each Array.from(selectedSizes) as size (size)}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					Size {size}
					<button onclick={() => onClearSize(size)} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/each}
			{#each Array.from(selectedBrands) as brand (brand)}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					{brand}
					<button onclick={() => onClearBrand(brand)} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/each}
			{#each Array.from(selectedConditions) as condition (condition)}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					{conditionOptions.find(c => c.value === condition)?.label}
					<button onclick={() => onClearCondition(condition)} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/each}
			{#if filters.minPrice || filters.maxPrice}
				<span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium">
					${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
					<button onclick={onClearPrice} class="hover:text-blue-900">
						<X class="h-3.5 w-3.5" />
					</button>
				</span>
			{/if}
		</div>
	</div>
{/if}