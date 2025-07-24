<script lang="ts">
	import { ChevronDown, ChevronRight, ChevronLeft, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { clickOutside } from '$lib/actions';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	interface Props {
		categories?: Category[];
		isOpen?: boolean;
		onToggle?: () => void;
		onClose?: () => void;
		class?: string;
		initialCategory?: string | null;
	}

	let { 
		categories = [], 
		isOpen = false, 
		onToggle = () => {}, 
		onClose = () => {},
		class: className = '',
		initialCategory = null
	}: Props = $props();

	let activeMainCategory = $state(initialCategory || '');
	let hoveredCategory = $state('');
	let activeSection = $state<'categories' | 'brands' | 'filters'>('categories');
	
	// Update active category when initialCategory changes
	$effect(() => {
		if (initialCategory) {
			activeMainCategory = initialCategory;
		}
	});
	
	// Popular brands
	const popularBrands = [
		{ name: 'Nike', emoji: '👟' },
		{ name: 'Adidas', emoji: '⚡' },
		{ name: 'Zara', emoji: '👗' },
		{ name: 'H&M', emoji: '🛍️' },
		{ name: 'Gucci', emoji: '💎' },
		{ name: 'Prada', emoji: '👜' },
		{ name: 'Versace', emoji: '✨' },
		{ name: 'Balenciaga', emoji: '🔥' },
		{ name: 'Louis Vuitton', emoji: '💼' },
		{ name: 'Chanel', emoji: '🌹' },
		{ name: 'Dior', emoji: '💐' },
		{ name: 'Burberry', emoji: '🧥' }
	];
	
	// Condition options with translations
	const conditionOptions = [
		{ value: 'new_with_tags', label: getLocale() === 'bg' ? 'Нови с етикети' : 'New with tags', emoji: '🏷️' },
		{ value: 'like_new', label: getLocale() === 'bg' ? 'Като нови' : 'Like new', emoji: '✨' },
		{ value: 'good', label: getLocale() === 'bg' ? 'Добро' : 'Good', emoji: '👍' },
		{ value: 'fair', label: getLocale() === 'bg' ? 'Задоволително' : 'Fair', emoji: '👌' },
		{ value: 'poor', label: getLocale() === 'bg' ? 'Лошо' : 'Poor', emoji: '🔧' }
	];

	// Category hierarchy with subcategories
	const categoryHierarchy = $derived([
		{
			slug: '',
			name: m.category_all(),
			icon: '🔍',
			subcategories: []
		},
		{
			slug: 'women',
			name: m.category_women(),
			icon: '👩',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses', icon: '👗' },
				{ name: m.women_tops_blouses(), slug: 'tops', icon: '👚' },
				{ name: m.women_skirts(), slug: 'skirts', icon: '👗' },
				{ name: m.women_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.women_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.women_shoes(), slug: 'shoes', icon: '👠' },
				{ name: m.women_bags_accessories(), slug: 'bags', icon: '👜' },
				{ name: m.subcategory_jewelry(), slug: 'jewelry', icon: '💍' },
				{ name: m.women_lingerie(), slug: 'lingerie', icon: '👙' },
				{ name: m.women_activewear(), slug: 'activewear', icon: '🏃‍♀️' }
			]
		},
		{
			slug: 'men',
			name: m.category_men(),
			icon: '👨',
			subcategories: [
				{ name: m.men_tshirts(), slug: 'tshirts', icon: '👕' },
				{ name: m.men_shirts(), slug: 'shirts', icon: '👔' },
				{ name: m.men_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.men_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies', icon: '👕' },
				{ name: m.men_shoes(), slug: 'shoes', icon: '👞' },
				{ name: m.men_accessories(), slug: 'accessories', icon: '⌚' },
				{ name: m.men_suits_formal(), slug: 'suits', icon: '🤵' },
				{ name: m.men_activewear(), slug: 'activewear', icon: '🏃‍♂️' },
				{ name: m.men_underwear(), slug: 'underwear', icon: '🩲' }
			]
		},
		{
			slug: 'kids',
			name: m.category_kids(),
			icon: '👶',
			subcategories: [
				{ name: m.kids_baby(), slug: 'baby', icon: '👶' },
				{ name: m.kids_girls(), slug: 'girls', icon: '👧' },
				{ name: m.kids_boys(), slug: 'boys', icon: '👦' },
				{ name: m.kids_shoes(), slug: 'shoes', icon: '👟' },
				{ name: m.kids_school_uniforms(), slug: 'school', icon: '🎒' },
				{ name: m.kids_toys_games(), slug: 'toys', icon: '🧸' },
				{ name: m.kids_maternity(), slug: 'maternity', icon: '🤱' }
			]
		},
		{
			slug: 'designer',
			name: m.category_designer(),
			icon: '💎',
			subcategories: [
				{ name: m.designer_luxury_handbags(), slug: 'handbags', icon: '👜' },
				{ name: m.designer_shoes(), slug: 'shoes', icon: '👠' },
				{ name: m.designer_dresses(), slug: 'dresses', icon: '👗' },
				{ name: m.designer_luxury_watches(), slug: 'watches', icon: '⌚' },
				{ name: m.designer_fine_jewelry(), slug: 'jewelry', icon: '💍' },
				{ name: m.designer_sunglasses(), slug: 'sunglasses', icon: '🕶️' },
				{ name: m.designer_vintage_pieces(), slug: 'vintage', icon: '🕰️' }
			]
		},
		{
			slug: 'home',
			name: m.category_home(),
			icon: '🏠',
			subcategories: [
				{ name: m.home_furniture(), slug: 'furniture', icon: '🪑' },
				{ name: m.home_decor(), slug: 'decor', icon: '🖼️' },
				{ name: m.home_kitchen(), slug: 'kitchen', icon: '🍽️' },
				{ name: m.home_bedding(), slug: 'bedding', icon: '🛏️' },
				{ name: m.home_lighting(), slug: 'lighting', icon: '💡' }
			]
		}
	]);
	
	// Popular collections (cross-category)
	const popularCollections = [
		{ slug: 'shoes', name: 'All Shoes', icon: '👟' },
		{ slug: 'bags', name: 'All Bags', icon: '👜' },
		{ slug: 'jewelry', name: 'Jewelry', icon: '💍' },
		{ slug: 'vintage', name: 'Vintage', icon: '🕰️' },
		{ slug: 'sale', name: 'On Sale', icon: '🔥' },
		{ slug: 'new', name: 'New In', icon: '✨' }
	];

	function handleMainCategoryClick(categorySlug: string) {
		if (categorySlug === activeMainCategory) {
			// If clicking the same category, toggle it
			activeMainCategory = '';
		} else {
			// Set new active category
			activeMainCategory = categorySlug;
		}
	}

	function handleSubcategoryClick(mainCategory: string, subcategory: string) {
		onClose();
		
		if (mainCategory === '' && subcategory === 'all') {
			// Browse all categories
			goto('/browse');
		} else if (mainCategory === '') {
			// Special categories like new, sale
			goto(`/browse?filter=${subcategory}`);
		} else {
			// Navigate to specific category/subcategory
			goto(`/${mainCategory}?subcategory=${subcategory}`);
		}
	}

	function handleCategoryNavigation(categorySlug: string) {
		onClose();
		if (categorySlug) {
			goto(`/${categorySlug}`);
		} else {
			goto('/browse');
		}
	}
</script>

<!-- Category Dropdown -->
{#if isOpen}
	<div 
		class={cn(
			"absolute top-full left-0 mt-1 w-[calc(100vw-2rem)] md:w-[600px]",
			"bg-white rounded-md shadow-lg border border-gray-200 z-[100] overflow-hidden",
			"md:mt-2",
			className
		)}
	>
		<!-- Mobile Layout -->
		<div class="md:hidden flex flex-col">
			<!-- Header with Tabs -->
			<div class="border-b border-gray-200" onclick={(e) => e.stopPropagation()}>
				<div class="flex items-center justify-between px-3 py-2">
					<div class="flex gap-2 overflow-x-auto">
						<button
							type="button"
							onclick={(e) => { 
								e.preventDefault();
								e.stopPropagation();
								activeSection = 'categories';
							}}
							class={cn(
								"px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
								activeSection === 'categories' 
									? "bg-blue-500 text-white" 
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							📦 Categories
						</button>
						<button
							type="button"
							onclick={(e) => { 
								e.preventDefault();
								e.stopPropagation();
								activeSection = 'brands'; 
							}}
							class={cn(
								"px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
								activeSection === 'brands' 
									? "bg-blue-500 text-white" 
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							🏷️ Brands
						</button>
						<button
							type="button"
							onclick={(e) => { 
								e.preventDefault();
								e.stopPropagation();
								activeSection = 'filters';
							}}
							class={cn(
								"px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
								activeSection === 'filters' 
									? "bg-blue-500 text-white" 
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							🎯 Filters
						</button>
					</div>
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						class="p-1.5 hover:bg-gray-100 rounded-md transition-colors ml-2"
					>
						<X class="w-4 h-4 text-gray-500" />
					</button>
				</div>
			</div>
			
			
			<!-- Content based on active section -->
			<div class="overflow-y-auto max-h-[60vh]">
				{#if activeSection === 'categories'}
					<!-- Categories List -->
					<div class="px-3 py-2">
						{#if initialCategory && activeMainCategory}
							<!-- Show subcategories for selected gender -->
							{@const selectedCategory = categoryHierarchy.find(cat => cat.slug === activeMainCategory)}
							{#if selectedCategory}
								<div class="mb-3">
									<button
										onclick={() => {
											activeMainCategory = '';
											activeSection = 'categories';
										}}
										class="flex items-center gap-1 text-xs text-gray-500 mb-2"
									>
										<ChevronLeft class="h-3 w-3" />
										<span>{getLocale() === 'bg' ? 'Назад' : 'Back'}</span>
									</button>
									<h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
										<span>{selectedCategory.icon}</span>
										<span>{selectedCategory.name}</span>
									</h3>
								</div>
								<div class="grid grid-cols-2 gap-2">
									{#each selectedCategory.subcategories as subcat}
										<button
											onclick={() => handleSubcategoryClick(selectedCategory.slug, subcat.slug)}
											class="flex items-center gap-2 px-3 py-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
										>
											<span class="text-lg">{subcat.icon}</span>
											<span class="text-sm font-medium text-gray-700">{subcat.name}</span>
										</button>
									{/each}
								</div>
							{/if}
						{:else}
							<!-- Show main categories and popular collections -->
							<div class="grid grid-cols-3 gap-2">
								<!-- Main Categories (6) -->
								{#each categoryHierarchy as category}
									<button
										onclick={() => handleMainCategoryClick(category.slug)}
										class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
									>
										<span class="text-xl">{category.icon}</span>
										<span class="text-xs font-medium text-gray-700">{category.name}</span>
									</button>
								{/each}
								
								<!-- Popular Collections (6) -->
								{#each popularCollections as collection}
									<button
										onclick={() => {
											onClose();
											if (collection.slug === 'sale') {
												goto('/browse?filter=sale');
											} else if (collection.slug === 'new') {
												goto('/browse?sort=created_at&order=desc');
											} else {
												goto(`/browse?category=${collection.slug}`);
											}
										}}
										class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
									>
										<span class="text-xl">{collection.icon}</span>
										<span class="text-xs font-medium text-gray-700">{collection.name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{:else if activeSection === 'brands'}
					<!-- Brands List -->
					<div class="px-3 py-2">
						<div class="grid grid-cols-3 gap-2">
							{#each popularBrands as brand}
								<button
									onclick={() => {
										onClose();
										goto(`/browse?brand=${encodeURIComponent(brand.name)}`);
									}}
									class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
								>
									<span class="text-xl">{brand.emoji}</span>
									<span class="text-xs font-medium text-gray-700">{brand.name}</span>
								</button>
							{/each}
						</div>
					</div>
				{:else if activeSection === 'filters'}
					<!-- Filters Section -->
					<div class="px-3 py-2">
						<div class="grid grid-cols-3 gap-2">
							<!-- Conditions -->
							<button
								onclick={() => {
									onClose();
									goto('/browse?condition=new_with_tags');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">🏷️</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'С етикети' : 'With Tags'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?condition=like_new');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">✨</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Като нови' : 'Like New'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?condition=good');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">👍</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Добро' : 'Good'}</span>
							</button>
							
							<!-- Quick Filters -->
							<button
								onclick={() => {
									onClose();
									goto('/browse?filter=sale');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">🔥</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Намаление' : 'Sale'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?sort=created_at&order=desc');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">🆕</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Най-нови' : 'Newest'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?sort=favorites_count&order=desc');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">❤️</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Популярни' : 'Popular'}</span>
							</button>
							
							<!-- Price Filters -->
							<button
								onclick={() => {
									onClose();
									goto('/browse?price=0-20');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">💰</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? '<20лв' : 'Under $20'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?price=20-50');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">💵</span>
								<span class="text-xs font-medium text-gray-700">$20-50</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?price=50-100');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">💸</span>
								<span class="text-xs font-medium text-gray-700">$50-100</span>
							</button>
							
							<!-- Special Filters -->
							<button
								onclick={() => {
									onClose();
									goto('/browse?filter=free-shipping');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">🚚</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Безпл.' : 'Free Ship'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?near=me');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">📍</span>
								<span class="text-xs font-medium text-gray-700">{getLocale() === 'bg' ? 'Близо' : 'Near Me'}</span>
							</button>
							<button
								onclick={() => {
									onClose();
									goto('/browse?filter=hot');
								}}
								class="flex flex-col items-center gap-1 p-2 text-center transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md"
							>
								<span class="text-xl">🔥</span>
								<span class="text-xs font-medium text-gray-700">Hot Items</span>
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Desktop Layout -->
		<div class="hidden md:flex">
			<!-- Left Column - Categories -->
			<div class="flex-1 max-h-[70vh] overflow-y-auto border-r border-gray-100">
				{#each categoryHierarchy as category}
					<button
						onclick={() => handleCategoryNavigation(category.slug)}
						onmouseenter={() => hoveredCategory = category.slug}
						onmouseleave={() => hoveredCategory = ''}
						class={cn(
							"w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-blue-50",
							hoveredCategory === category.slug && "bg-blue-50"
						)}
					>
						<div class="flex items-center gap-3">
							<span class="text-lg">{category.icon}</span>
							<div>
								<div class={cn(
									"font-medium text-sm",
									hoveredCategory === category.slug ? "text-blue-400" : "text-gray-900"
								)}>
									{category.name}
								</div>
								<div class="text-xs text-gray-500">
									{m.category_subcategories_count({ count: category.subcategories.length })}
								</div>
							</div>
						</div>
						
						<ChevronRight class={cn(
							"h-4 w-4 transition-transform duration-200",
							hoveredCategory === category.slug ? "text-blue-400" : "text-gray-400"
						)} />
					</button>
				{/each}
			</div>
			
			<!-- Right Column - Trending/Filters -->
			<div class="w-72 bg-gradient-to-br from-blue-50 to-white p-4">
				<!-- Trending Section -->
				<div class="mb-6">
					<h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
						<span class="text-base">🔥</span> Trending Now
					</h3>
					<div class="space-y-2">
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=new-with-tags');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">🏷️</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Нови с етикети' : 'New with Tags'}</div>
								<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Чисто нови артикули' : 'Brand new items'}</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=sale');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">💸</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Намаление' : 'On Sale'}</div>
								<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Намалени артикули' : 'Discounted items'}</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?sort=created_at&order=desc');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">✨</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Най-нови' : 'Latest Arrivals'}</div>
								<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Току-що добавени' : 'Just added'}</div>
							</div>
						</button>
					</div>
				</div>
				
				<!-- Popular Filters -->
				<div>
					<h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
						<span class="text-base">⭐</span> {getLocale() === 'bg' ? 'Популярни' : 'Popular'}
					</h3>
					<div class="space-y-2">
						<button
							onclick={() => {
								onClose();
								goto('/browse?sort=favorites_count&order=desc');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">❤️</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Най-харесвани' : 'Most Liked'}</div>
								<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Популярни артикули' : 'Popular items'}</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=hot');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">🔥</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Hot Items</div>
								<div class="text-xs text-gray-500">Trending fast</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?price=0-20');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-md bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">💰</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Under $20</div>
								<div class="text-xs text-gray-500">Budget finds</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="border-t border-gray-200 p-4 bg-gray-50">
			<div class="flex items-center justify-between text-sm">
				<span class="text-gray-600">{m.category_need_help()}</span>
				<button
					onclick={() => {
						onClose();
						goto('/browse');
					}}
					class="text-blue-400 hover:text-blue-500 font-medium"
				>
					{m.category_browse_all_link()}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for the dropdown */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgb(var(--color-gray-300)) transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgb(var(--color-gray-300));
		border-radius: var(--radius-sm);
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgb(var(--color-gray-400));
	}
	
	/* Mobile slide up animation */
	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>