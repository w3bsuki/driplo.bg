<script lang="ts">
	import { X, ChevronRight, ChevronDown } from 'lucide-svelte';
	import { navigation } from '$lib/stores/navigation.svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/types';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	// State for expanded categories
	let expandedCategories = $state<Set<string>>(new Set());
	
	// Category data with translations
	const categoryData = [
		{
			slug: 'women',
			name: m.category_women(),
			emoji: '👩',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses', emoji: '👗' },
				{ name: m.women_tops_blouses(), slug: 'tops', emoji: '👚' },
				{ name: m.women_skirts(), slug: 'skirts', emoji: '👗' },
				{ name: m.women_pants_jeans(), slug: 'pants', emoji: '👖' },
				{ name: m.women_jackets_coats(), slug: 'jackets', emoji: '🧥' },
				{ name: m.women_shoes(), slug: 'shoes', emoji: '👠' },
				{ name: m.women_bags_accessories(), slug: 'bags', emoji: '👜' },
				{ name: m.subcategory_jewelry(), slug: 'jewelry', emoji: '💍' }
			]
		},
		{
			slug: 'men',
			name: m.category_men(),
			emoji: '👨',
			subcategories: [
				{ name: m.men_tshirts(), slug: 'tshirts', emoji: '👕' },
				{ name: m.men_shirts(), slug: 'shirts', emoji: '👔' },
				{ name: m.men_pants_jeans(), slug: 'pants', emoji: '👖' },
				{ name: m.men_jackets_coats(), slug: 'jackets', emoji: '🧥' },
				{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies', emoji: '👕' },
				{ name: m.men_shoes(), slug: 'shoes', emoji: '👞' },
				{ name: m.men_accessories(), slug: 'accessories', emoji: '⌚' }
			]
		},
		{
			slug: 'kids',
			name: m.category_kids(),
			emoji: '👶',
			subcategories: [
				{ name: m.kids_boys(), slug: 'boys', emoji: '👦' },
				{ name: m.kids_girls(), slug: 'girls', emoji: '👧' },
				{ name: m.kids_baby(), slug: 'baby', emoji: '👶' },
				{ name: m.kids_shoes(), slug: 'shoes', emoji: '👟' }
			]
		}
	];
	
	// Popular brands
	const popularBrands = [
		{ name: 'Nike', emoji: '👟' },
		{ name: 'Adidas', emoji: '⚡' },
		{ name: 'Zara', emoji: '👗' },
		{ name: 'H&M', emoji: '🛍️' },
		{ name: 'Gucci', emoji: '💎' },
		{ name: 'Prada', emoji: '👜' }
	];
	
	function toggleCategory(slug: string) {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(slug)) {
			newExpanded.delete(slug);
		} else {
			newExpanded.add(slug);
		}
		expandedCategories = newExpanded;
	}
	
	function handleNavigation(path: string) {
		navigation.closeMobileMenu();
		goto(path);
	}
	
	function handleBrandClick(brand: string) {
		navigation.closeMobileMenu();
		goto(`/browse?brand=${encodeURIComponent(brand)}`);
	}
</script>

{#if navigation.isMobileMenuOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 z-[60] md:hidden"
		onclick={() => navigation.closeMobileMenu()}
		transition:fade={{ duration: 200 }}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
	
	<!-- Sidebar Menu -->
	<nav 
		class="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[61] md:hidden overflow-y-auto"
		transition:fly={{ x: -320, duration: 200 }}
		aria-label="Category menu"
	>
		<!-- Header -->
		<div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-2xl">👕</span>
				<h2 class="text-lg font-semibold">{m.header_categories()}</h2>
			</div>
			<button
				onclick={() => navigation.closeMobileMenu()}
				class="p-2 -mr-2 rounded-md hover:bg-gray-50 transition-colors duration-fast"
				aria-label="Close menu"
			>
				<X class="h-5 w-5 text-gray-600" />
			</button>
		</div>
		
		<!-- Quick Links -->
		<div class="p-4 border-b border-gray-100">
			<button
				onclick={() => handleNavigation('/browse')}
				class="w-full flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-fast"
			>
				<div class="flex items-center gap-3">
					<span class="text-xl">🔍</span>
					<span class="font-medium">{m.category_all()}</span>
				</div>
				<ChevronRight class="h-4 w-4 text-gray-400" />
			</button>
		</div>
		
		<!-- Categories -->
		<div class="p-4 space-y-2">
			<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
				{m.filter_categories()}
			</h3>
			
			{#each categoryData as category}
				<div class="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
					<!-- Main Category -->
					<button
						onclick={() => toggleCategory(category.slug)}
						class="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors duration-fast"
					>
						<div class="flex items-center gap-3">
							<span class="text-xl">{category.emoji}</span>
							<span class="font-medium">{category.name}</span>
						</div>
						<ChevronDown class={cn(
							"h-4 w-4 text-gray-400 transition-transform duration-200",
							expandedCategories.has(category.slug) && "rotate-180"
						)} />
					</button>
					
					<!-- Subcategories -->
					{#if expandedCategories.has(category.slug)}
						<div class="ml-8 mt-1 space-y-1" transition:fade={{ duration: 150 }}>
							{#each category.subcategories as sub}
								<button
									onclick={() => handleNavigation(`/${category.slug}/${sub.slug}`)}
									class="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors duration-fast text-left"
								>
									<span class="text-sm">{sub.emoji}</span>
									<span class="text-sm text-gray-700">{sub.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		
		<!-- Popular Brands -->
		<div class="p-4 border-t border-gray-200">
			<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
				{m.filter_popular_brands()}
			</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each popularBrands as brand}
					<button
						onclick={() => handleBrandClick(brand.name)}
						class="flex items-center gap-2 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-fast"
					>
						<span class="text-sm">{brand.emoji}</span>
						<span class="text-sm font-medium">{brand.name}</span>
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Footer Links -->
		<div class="p-4 border-t border-gray-200 space-y-2">
			<button
				onclick={() => handleNavigation('/leaderboard')}
				class="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors duration-fast text-left"
			>
				<span class="text-xl">⭐</span>
				<span class="text-sm font-medium">{m.nav_sellers()}</span>
			</button>
			<button
				onclick={() => handleNavigation('/browse?filter=sale')}
				class="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors duration-fast text-left"
			>
				<span class="text-xl">🏷️</span>
				<span class="text-sm font-medium">{m.quick_filter_sale()}</span>
			</button>
		</div>
	</nav>
{/if}