<script lang="ts">
	import { fly } from 'svelte/transition';
	import CategoryAccordion from './CategoryAccordion.svelte';
	import TrendingSearches from './TrendingSearches.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		isOpen: boolean;
		isFocused?: boolean;
		expandedCategories: Set<string>;
		onCategoryToggle: (slug: string) => void;
		onCategorySelect: (category: string, subcategory?: string) => void;
		onTrendingClick: (term: string) => void;
		onClose?: () => void;
	}
	
	let { 
		isOpen, 
		isFocused = false,
		expandedCategories,
		onCategoryToggle,
		onCategorySelect,
		onTrendingClick,
		onClose
	}: Props = $props();
	
	let dropdownRef: HTMLDivElement;
	
	// Categories with subcategories
	const categoryTree = [
		{
			name: m.category_women(),
			slug: 'women',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses' },
				{ name: m.subcategory_tops(), slug: 'tops' },
				{ name: m.subcategory_jeans(), slug: 'jeans' },
				{ name: m.subcategory_jackets(), slug: 'jackets' },
				{ name: m.subcategory_shoes(), slug: 'shoes' },
				{ name: m.subcategory_bags(), slug: 'bags' }
			]
		},
		{
			name: m.category_men(),
			slug: 'men',
			subcategories: [
				{ name: m.subcategory_tshirts(), slug: 't-shirts' },
				{ name: m.men_shirts(), slug: 'shirts' },
				{ name: m.subcategory_jeans(), slug: 'jeans' },
				{ name: m.subcategory_jackets(), slug: 'jackets' },
				{ name: m.subcategory_sneakers(), slug: 'sneakers' },
				{ name: m.subcategory_accessories(), slug: 'accessories' }
			]
		},
		{
			name: m.category_kids(),
			slug: 'kids',
			subcategories: [
				{ name: m.subcategory_boys(), slug: 'boys' },
				{ name: m.subcategory_girls(), slug: 'girls' },
				{ name: m.subcategory_baby(), slug: 'baby' },
				{ name: m.subcategory_toys(), slug: 'toys' },
				{ name: m.subcategory_school(), slug: 'school' }
			]
		},
		{
			name: m.category_pets(),
			slug: 'pets',
			subcategories: [
				{ name: m.subcategory_dogs(), slug: 'dogs' },
				{ name: m.subcategory_cats(), slug: 'cats' },
				{ name: m.subcategory_pet_accessories(), slug: 'accessories' },
				{ name: m.subcategory_pet_food(), slug: 'food' },
				{ name: m.subcategory_pet_toys(), slug: 'toys' }
			]
		}
	];
	
	const trendingSearches = [
		m.search_vintage_levis(),
		m.search_designer_bags(),
		m.search_nike_trainers(),
		m.search_zara_dress()
	];
</script>

{#if isOpen}
	<div 
		bind:this={dropdownRef}
		data-search-dropdown
		class="absolute top-full -mt-px left-0 right-0 bg-white rounded-b-xl shadow-md border border-gray-200 border-t-0 max-h-[360px] overflow-y-auto"
		style="z-index: 20;"
		transition:fly={{ y: -8, duration: 150 }}
		onclick={(e) => e.stopPropagation()}
	>
		<div class="p-3">
			<!-- Compact Category List -->
			<div class="space-y-1">
				{#each categoryTree as category}
					<CategoryAccordion
						name={category.name}
						slug={category.slug}
						subcategories={category.subcategories}
						isExpanded={expandedCategories.has(category.slug)}
						onToggle={() => onCategoryToggle(category.slug)}
						onCategorySelect={onCategorySelect}
					/>
				{/each}
			</div>
			
			<!-- Trending Searches -->
			<TrendingSearches 
				searches={trendingSearches}
				onSearchClick={onTrendingClick}
				compact={true}
			/>
		</div>
	</div>
{/if}