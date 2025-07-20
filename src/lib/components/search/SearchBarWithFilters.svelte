<script lang="ts">
	import { Search, ChevronDown, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		value?: string;
		placeholder?: string;
		onSearch?: (value: string) => void;
		onFilterChange?: (filters: QuickFilters) => void;
		class?: string;
		showQuickFilters?: boolean;
		activeFilterCount?: number;
	}

	interface QuickFilters {
		condition?: string[];
		size?: string[];
		priceRange?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search for items...',
		onSearch,
		onFilterChange,
		class: className = '',
		showQuickFilters = true,
		activeFilterCount = 0
	}: Props = $props();

	// Quick filter state
	let quickFilters = $state<QuickFilters>({
		condition: [],
		size: [],
		priceRange: ''
	});

	// Dropdown state
	let isDropdownOpen = $state(false);
	
	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}
	
	function closeDropdown() {
		isDropdownOpen = false;
	}

	// Filter options
	const conditionOptions = [
		{ value: 'new_with_tags', label: 'New with tags', emoji: '✨' },
		{ value: 'like_new', label: 'Like new', emoji: '🌟' },
		{ value: 'good', label: 'Good', emoji: '👍' },
		{ value: 'fair', label: 'Fair', emoji: '👌' }
	];

	const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

	const priceRanges = [
		{ value: '0-20', label: 'Under £20', emoji: '💸' },
		{ value: '20-50', label: '£20-£50', emoji: '💷' },
		{ value: '50-100', label: '£50-£100', emoji: '💰' },
		{ value: '100+', label: '£100+', emoji: '💎' }
	];

	// Calculate active filter count
	const activeQuickFilterCount = $derived(
		quickFilters.condition.length + 
		quickFilters.size.length + 
		(quickFilters.priceRange ? 1 : 0)
	);

	function handleSearch() {
		onSearch?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}

	function toggleCondition(condition: string) {
		if (quickFilters.condition.includes(condition)) {
			quickFilters.condition = quickFilters.condition.filter(c => c !== condition);
		} else {
			quickFilters.condition = [...quickFilters.condition, condition];
		}
		onFilterChange?.(quickFilters);
	}

	function toggleSize(size: string) {
		if (quickFilters.size.includes(size)) {
			quickFilters.size = quickFilters.size.filter(s => s !== size);
		} else {
			quickFilters.size = [...quickFilters.size, size];
		}
		onFilterChange?.(quickFilters);
	}

	function setPriceRange(range: string) {
		quickFilters.priceRange = quickFilters.priceRange === range ? '' : range;
		onFilterChange?.(quickFilters);
	}

	function clearQuickFilters() {
		quickFilters = {
			condition: [],
			size: [],
			priceRange: ''
		};
		onFilterChange?.(quickFilters);
	}
</script>

<div class={cn("relative", className)}>
	<div class="flex items-center gap-2">
		<!-- Search Input -->
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<input
				type="search"
				bind:value
				{placeholder}
				onkeydown={handleKeydown}
				class={cn(
					"w-full pl-10 pr-4 py-2.5 text-sm",
					"bg-white border border-gray-200 rounded-lg",
					"placeholder:text-gray-400",
					"focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent",
					"transition-all duration-200"
				)}
			/>
		</div>

		<!-- Quick Filters Button -->
		{#if showQuickFilters}
			<button
				onclick={toggleDropdown}
				class={cn(
					"flex items-center gap-2 px-4 py-2.5",
					"bg-white border rounded-lg",
					"text-sm font-medium",
					"transition-all duration-200",
					isDropdownOpen ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:bg-gray-50",
					"focus:outline-none focus:ring-2 focus:ring-blue-300"
				)}
			>
				<span>Filters</span>
				{#if activeQuickFilterCount > 0}
					<span class="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
						{activeQuickFilterCount}
					</span>
				{/if}
				<ChevronDown class={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
			</button>
		{/if}

		<!-- Search Button -->
		<Button
			onclick={handleSearch}
			size="sm"
			class="px-4 py-2.5"
		>
			Search
		</Button>
	</div>

	<!-- Quick Filters Dropdown -->
	{#if isDropdownOpen}
		<div
			transition:fly={{ y: -10, duration: 200 }}
			class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
		>
			<!-- Header -->
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-semibold text-gray-900">Quick Filters</h3>
				{#if activeQuickFilterCount > 0}
					<button
						onclick={clearQuickFilters}
						class="text-sm text-blue-600 hover:text-blue-700 font-medium"
					>
						Clear all
					</button>
				{/if}
			</div>

			<!-- Condition -->
			<div class="mb-4">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Condition</h4>
				<div class="grid grid-cols-2 gap-2">
					{#each conditionOptions as option}
						<button
							onclick={() => toggleCondition(option.value)}
							class={cn(
								"flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
								quickFilters.condition.includes(option.value)
									? "bg-blue-100 text-blue-700 border border-blue-300"
									: "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
							)}
						>
							<span>{option.emoji}</span>
							<span>{option.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Size -->
			<div class="mb-4">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Size</h4>
				<div class="grid grid-cols-6 gap-1.5">
					{#each sizeOptions as size}
						<button
							onclick={() => toggleSize(size)}
							class={cn(
								"py-1.5 rounded text-sm font-medium transition-all",
								quickFilters.size.includes(size)
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>

			<!-- Price Range -->
			<div>
				<h4 class="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
				<div class="grid grid-cols-2 gap-2">
					{#each priceRanges as range}
						<button
							onclick={() => setPriceRange(range.value)}
							class={cn(
								"flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
								quickFilters.priceRange === range.value
									? "bg-blue-100 text-blue-700 border border-blue-300"
									: "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
							)}
						>
							<span>{range.emoji}</span>
							<span>{range.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Note about more filters -->
			<div class="mt-4 pt-4 border-t border-gray-200">
				<p class="text-xs text-gray-500 text-center">
					For more filters, tap the filter icon in the bottom navigation
				</p>
			</div>
		</div>
	{/if}
</div>

{#if isDropdownOpen}
	<button
		class="fixed inset-0 z-40"
		onclick={closeDropdown}
		aria-label="Close dropdown"
	/>
{/if}