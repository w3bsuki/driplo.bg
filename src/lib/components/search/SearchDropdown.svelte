<script lang="ts">
	import { fly } from 'svelte/transition';
	import CategoryAccordion from './CategoryAccordion.svelte';
	import TrendingSearches from './TrendingSearches.svelte';
	
	interface Props {
		isOpen: boolean;
		isFocused?: boolean;
		expandedCategories: Set<string>;
		onCategoryToggle: (slug: string) => void;
		onCategorySelect: (category: string, subcategory?: string) => void;
		onTrendingClick: (term: string) => void;
	}
	
	let { 
		isOpen, 
		isFocused = false,
		expandedCategories,
		onCategoryToggle,
		onCategorySelect,
		onTrendingClick
	}: Props = $props();
	
	let dropdownRef: HTMLDivElement;
	
	// Categories with subcategories
	const categoryTree = [
		{
			name: 'Women',
			slug: 'women',
			subcategories: [
				{ name: 'Dresses', slug: 'dresses' },
				{ name: 'Tops', slug: 'tops' },
				{ name: 'Jeans', slug: 'jeans' },
				{ name: 'Jackets', slug: 'jackets' },
				{ name: 'Shoes', slug: 'shoes' },
				{ name: 'Bags', slug: 'bags' }
			]
		},
		{
			name: 'Men',
			slug: 'men',
			subcategories: [
				{ name: 'T-Shirts', slug: 't-shirts' },
				{ name: 'Shirts', slug: 'shirts' },
				{ name: 'Jeans', slug: 'jeans' },
				{ name: 'Jackets', slug: 'jackets' },
				{ name: 'Sneakers', slug: 'sneakers' },
				{ name: 'Accessories', slug: 'accessories' }
			]
		},
		{
			name: 'Designer',
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
			name: 'Shoes',
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
			name: 'Bags',
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
		'Vintage Levi\'s',
		'Designer bags',
		'Nike Air Max',
		'Zara dresses'
	];
</script>

{#if isOpen}
	<div 
		bind:this={dropdownRef}
		class="absolute top-full -mt-px left-0 right-0 bg-white rounded-b-2xl shadow-xl border-b-2 border-x-2 max-h-[400px] overflow-y-auto {isFocused ? 'border-gray-900' : 'border-gray-200'}"
		style="z-index: 20;"
		transition:fly={{ y: -10, duration: 200 }}
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