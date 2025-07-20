<script lang="ts">
	import { Filter, X, Sparkles } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Sheet } from '$lib/components/ui';
	import type { Category } from '$lib/types';
	
	interface FilterOption {
		label: string;
		value: string;
	}
	
	interface FilterGroup {
		type: string;
		label: string;
		options: FilterOption[];
	}
	
	interface Props {
		filters: FilterGroup[];
		selectedFilters: Record<string, string | string[]>;
		onFilterChange: (type: string, value: string | string[]) => void;
		onClearFilters: () => void;
		subcategories?: Category[];
		showSubcategories?: boolean;
		selectedSubcategory?: string;
		onSubcategoryChange?: (subcategory: string) => void;
	}
	
	let {
		filters,
		selectedFilters,
		onFilterChange,
		onClearFilters,
		subcategories = [],
		showSubcategories = false,
		selectedSubcategory = 'all',
		onSubcategoryChange
	}: Props = $props();
	
	let showAllFilters = $state(false);
	
	const activeFilterCount = $derived(() => {
		let count = 0;
		if (selectedSubcategory !== 'all') count++;
		
		Object.entries(selectedFilters).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				count += value.length;
			} else if (value && value !== 'recent') {
				count++;
			}
		});
		
		return count;
	});
	
	function getFilterLabel(filterType: string): string {
		const filter = filters.find(f => f.type === filterType);
		const value = selectedFilters[filterType];
		
		if (!value) return filter?.label || filterType;
		
		if (Array.isArray(value)) {
			return value.length > 0 ? value.join(', ') : filter?.label || filterType;
		}
		
		const option = filter?.options.find(o => o.value === value);
		return option?.label || filter?.label || filterType;
	}
	
	function handleFilterChange(type: string, value: string) {
		const currentValue = selectedFilters[type];
		
		// Handle multi-select (for sizes, conditions, etc.)
		if (type === 'size' || type === 'condition') {
			const currentArray = Array.isArray(currentValue) ? currentValue : [];
			const newArray = currentArray.includes(value)
				? currentArray.filter(v => v !== value)
				: [...currentArray, value];
			onFilterChange(type, newArray);
		} else {
			// Handle single select (for price, etc.)
			onFilterChange(type, currentValue === value ? '' : value);
		}
	}
	
	function isFilterActive(type: string, value: string): boolean {
		const currentValue = selectedFilters[type];
		
		if (Array.isArray(currentValue)) {
			return currentValue.includes(value);
		}
		
		return currentValue === value;
	}
	
	function clearFilter(type: string) {
		onFilterChange(type, Array.isArray(selectedFilters[type]) ? [] : '');
	}
</script>

<!-- Subcategories (if enabled) -->
{#if showSubcategories && subcategories.length > 0}
	<div class="bg-white border-b sticky top-0 z-20">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
				<button
					onclick={() => onSubcategoryChange?.('all')}
					class={cn(
						"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
						selectedSubcategory === 'all'
							? "bg-blue-500 text-white"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					)}
				>
					All
				</button>
				{#each subcategories as subcategory}
					<button
						onclick={() => onSubcategoryChange?.(subcategory.id)}
						class={cn(
							"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
							selectedSubcategory === subcategory.id
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						)}
					>
						{subcategory.icon} {subcategory.name}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Main Filters -->
<section class="bg-gray-50 border-b sticky top-[60px] z-30">
	<div class="container px-4 py-2">
		<!-- Mobile Layout -->
		<div class="md:hidden">
			<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
				<!-- Filter Toggle Button -->
				<Sheet.Root bind:open={showAllFilters}>
					<Sheet.Trigger>
						<button
							class={cn(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all duration-200 flex-shrink-0 text-xs",
								activeFilterCount() > 0
									? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
									: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
							)}
						>
							<Filter class="h-3.5 w-3.5" />
							<span class="font-medium">Filters</span>
							{#if activeFilterCount() > 0}
								<span class="bg-white text-blue-500 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
									{activeFilterCount()}
								</span>
							{/if}
						</button>
					</Sheet.Trigger>
					
					<Sheet.Content side="bottom" class="h-[80vh]">
						<Sheet.Header>
							<Sheet.Title>Filters</Sheet.Title>
						</Sheet.Header>
						
						<div class="space-y-6 pt-4">
							{#each filters as filter}
								<div>
									<h3 class="text-sm font-semibold text-gray-700 mb-2">
										{filter.label}
									</h3>
									<div class="flex flex-wrap gap-2">
										{#each filter.options as option}
											<button
												onclick={() => handleFilterChange(filter.type, option.value)}
												class={cn(
													"px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
													isFilterActive(filter.type, option.value)
														? "bg-blue-500 text-white border-blue-500"
														: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
												)}
											>
												{option.label}
											</button>
										{/each}
									</div>
								</div>
							{/each}
							
							{#if activeFilterCount() > 0}
								<button
									onclick={onClearFilters}
									class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
								>
									Clear All Filters
								</button>
							{/if}
						</div>
					</Sheet.Content>
				</Sheet.Root>
				
				<!-- Quick Filter Pills -->
				{#each filters as filter}
					<div class="relative">
						<select
							value={Array.isArray(selectedFilters[filter.type]) ? selectedFilters[filter.type][0] || '' : selectedFilters[filter.type] || ''}
							onchange={(e) => handleFilterChange(filter.type, e.currentTarget.value)}
							class={cn(
								"appearance-none pl-3 pr-6 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 min-w-[70px] max-w-[120px]",
								selectedFilters[filter.type] && (Array.isArray(selectedFilters[filter.type]) ? selectedFilters[filter.type].length > 0 : selectedFilters[filter.type])
									? "bg-blue-100 border-blue-300 text-blue-700"
									: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
							)}
						>
							<option value="">{filter.label}</option>
							{#each filter.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						{#if selectedFilters[filter.type] && (Array.isArray(selectedFilters[filter.type]) ? selectedFilters[filter.type].length > 0 : selectedFilters[filter.type])}
							<button
								onclick={() => clearFilter(filter.type)}
								class="absolute right-1.5 top-1/2 -translate-y-1/2"
							>
								<X class="h-2.5 w-2.5 text-blue-600" />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Desktop Layout -->
		<div class="hidden md:flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#each filters as filter}
					<div class="relative">
						<select
							value={Array.isArray(selectedFilters[filter.type]) ? selectedFilters[filter.type][0] || '' : selectedFilters[filter.type] || ''}
							onchange={(e) => handleFilterChange(filter.type, e.currentTarget.value)}
							class={cn(
								"appearance-none pl-3 pr-8 py-2 rounded-lg border cursor-pointer transition-all duration-200 min-w-[120px] font-medium",
								selectedFilters[filter.type] && (Array.isArray(selectedFilters[filter.type]) ? selectedFilters[filter.type].length > 0 : selectedFilters[filter.type])
									? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
									: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
							)}
						>
							<option value="">{filter.label}</option>
							{#each filter.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				{/each}
				
				{#if activeFilterCount() > 0}
					<button
						onclick={onClearFilters}
						class="text-sm text-gray-600 hover:text-blue-600 font-medium ml-2"
					>
						Clear all
					</button>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>