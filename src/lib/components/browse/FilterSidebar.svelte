<script lang="ts">
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';

	let {
		categories,
		popularBrands,
		filters,
		selectedSizes = $bindable(new Set()),
		selectedBrands = $bindable(new Set()),
		selectedConditions = $bindable(new Set()),
		priceRange = $bindable({ min: 0, max: 1000 }),
		onCategoryUpdate,
		onPriceUpdate,
		onSizeToggle,
		onBrandToggle,
		onConditionToggle,
		onClearFilters
	}: {
		categories: any[];
		popularBrands: string[];
		filters: any;
		selectedSizes: Set<string>;
		selectedBrands: Set<string>;
		selectedConditions: Set<string>;
		priceRange: { min: number; max: number };
		onCategoryUpdate: (slug: string) => void;
		onPriceUpdate: () => void;
		onSizeToggle: (size: string) => void;
		onBrandToggle: (brand: string) => void;
		onConditionToggle: (condition: string) => void;
		onClearFilters: () => void;
	} = $props();

	// Derive categories with "All" option
	const categoriesWithAll = $derived([
		{ id: '', name: m.browse_all(), slug: '', icon_url: null, parent_id: null },
		...categories
	]);

	// Available condition options
	const conditionOptions = [
		{ value: 'new_with_tags', label: m.condition_new_with_tags() },
		{ value: 'like_new', label: m.condition_like_new() },
		{ value: 'good', label: m.condition_good() },
		{ value: 'fair', label: m.condition_fair() },
		{ value: 'poor', label: m.condition_poor() }
	];

	// Size options
	const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16'];

	// Show clear filters button
	const showClearFilters = $derived(
		filters.search || 
		filters.category || 
		selectedSizes.size > 0 || 
		selectedBrands.size > 0 || 
		selectedConditions.size > 0 || 
		filters.minPrice || 
		filters.maxPrice
	);
</script>

<aside class="hidden md:block w-72 flex-shrink-0">
	<div class="sticky top-24 space-y-3">
		<!-- Categories Card -->
		<div class="bg-white rounded-sm border border-gray-200 p-3">
			<h3 class="font-semibold text-gray-900 mb-2 text-sm">{m.browse_categories()}</h3>
			<div class="space-y-1">
				{#each categoriesWithAll as category (category.slug)}
					<button
						onclick={() => onCategoryUpdate(category.slug)}
						class={cn(
							"w-full text-left px-2 py-2 rounded-sm text-sm transition-all duration-100 flex items-center gap-2",
							filters.category === category.slug
								? "bg-blue-50 text-blue-700 font-medium"
								: "hover:bg-gray-50 text-gray-700"
						)}
					>
						<span class="text-sm">{category.icon_url || '📦'}</span>
						<span>{category.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Price Range Card -->
		<div class="bg-white rounded-sm border border-gray-200 p-3">
			<h3 class="font-semibold text-gray-900 mb-2 text-sm">{m.browse_price_range()}</h3>
			<div class="space-y-2">
				<div class="flex gap-2">
					<input
						type="number"
						placeholder={m.browse_price_min()}
						bind:value={priceRange.min}
						onblur={onPriceUpdate}
						class="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-transparent"
					/>
					<span class="text-gray-400 self-center">-</span>
					<input
						type="number"
						placeholder={m.browse_price_max()}
						bind:value={priceRange.max}
						onblur={onPriceUpdate}
						class="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-transparent"
					/>
				</div>
				<button
					onclick={onPriceUpdate}
					class="w-full px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-sm hover:bg-blue-100 transition-colors duration-100"
				>
					Apply Price Range
				</button>
			</div>
		</div>

		<!-- Sizes Card -->
		<div class="bg-white rounded-sm border border-gray-200 p-3">
			<h3 class="font-semibold text-gray-900 mb-2 text-sm">{m.browse_size()}</h3>
			<div class="grid grid-cols-3 gap-2">
				{#each sizeOptions as size (size)}
					<button
						onclick={() => onSizeToggle(size)}
						class={cn(
							"px-2 py-1.5 rounded-sm text-sm font-medium transition-all duration-100",
							selectedSizes.has(size)
								? "bg-blue-300 text-white border border-blue-400"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						)}
					>
						{size}
					</button>
				{/each}
			</div>
		</div>

		<!-- Conditions Card -->
		<div class="bg-white rounded-sm border border-gray-200 p-3">
			<h3 class="font-semibold text-gray-900 mb-2 text-sm">{m.browse_condition()}</h3>
			<div class="space-y-2">
				{#each conditionOptions as condition (condition.value)}
					<label class="flex items-center gap-3 py-1 cursor-pointer group">
						<input
							type="checkbox"
							checked={selectedConditions.has(condition.value)}
							onchange={() => onConditionToggle(condition.value)}
							class="w-4 h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-1"
						/>
						<span class="text-sm text-gray-700 group-hover:text-gray-900">{condition.label}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Brands Card -->
		<div class="bg-white rounded-sm border border-gray-200 p-3">
			<h3 class="font-semibold text-gray-900 mb-2 text-sm">{m.browse_brand()}</h3>
			<div class="space-y-2 max-h-48 overflow-y-auto">
				{#each popularBrands as brand (brand)}
					<label class="flex items-center gap-3 py-1 cursor-pointer group">
						<input
							type="checkbox"
							checked={selectedBrands.has(brand)}
							onchange={() => onBrandToggle(brand)}
							class="w-4 h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-1"
						/>
						<span class="text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Clear Filters Button -->
		{#if showClearFilters}
			<button
				onclick={onClearFilters}
				class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-sm hover:bg-red-50 transition-colors duration-100"
			>
				{m.browse_clear_filters()}
			</button>
		{/if}
	</div>
</aside>