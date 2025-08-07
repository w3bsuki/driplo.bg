<script lang="ts">
	import { fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';
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
				{ name: 'Sneakers', slug: 'sneakers' },
				{ name: m.subcategory_accessories(), slug: 'accessories' }
			]
		},
		{
			name: m.category_designer(),
			slug: 'designer',
			subcategories: [
				{ name: 'Gucci', slug: 'gucci' },
				{ name: 'Louis Vuitton', slug: 'louis-vuitton' },
				{ name: 'Prada', slug: 'prada' },
				{ name: 'Balenciaga', slug: 'balenciaga' },
				{ name: 'Burberry', slug: 'burberry' },
				{ name: 'Versace', slug: 'versace' }
			]
		},
		{
			name: m.subcategory_shoes(),
			slug: 'shoes',
			subcategories: [
				{ name: 'Sneakers', slug: 'sneakers' },
				{ name: 'Boots', slug: 'boots' },
				{ name: 'Heels', slug: 'heels' },
				{ name: 'Flats', slug: 'flats' },
				{ name: 'Sandals', slug: 'sandals' },
				{ name: 'Sport Shoes', slug: 'sport-shoes' }
			]
		},
		{
			name: m.subcategory_bags(),
			slug: 'bags',
			subcategories: [
				{ name: 'Handbags', slug: 'handbags' },
				{ name: 'Backpacks', slug: 'backpacks' },
				{ name: 'Clutches', slug: 'clutches' },
				{ name: 'Totes', slug: 'totes' },
				{ name: 'Crossbody', slug: 'crossbody' },
				{ name: 'Wallets', slug: 'wallets' }
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
		class="absolute top-full -mt-px left-0 right-0 bg-white rounded-b-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto"
		style="z-index: 20;"
		transition:fly={{ y: -10, duration: 200 }}
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Close Button -->
		{#if onClose}
			<div class="flex justify-end p-2 pb-0">
				<button
					onclick={onClose}
					class="p-1 hover:bg-gray-100 rounded-full transition-colors"
					aria-label="Close dropdown"
				>
					<X class="h-4 w-4 text-gray-400" />
				</button>
			</div>
		{/if}
		
		<div class="p-3 {onClose ? 'pt-0' : ''}">
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