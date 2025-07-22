<script lang="ts">
	import { ChevronDown, Menu } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import CategoryDropdown from '$lib/components/shared/CategoryDropdown.svelte';
	import StickySearchBar from '$lib/components/search/StickySearchBar.svelte';
	import QuickFilterPills from '$lib/components/search/QuickFilterPills.svelte';
	import TrendingSearches from '$lib/components/search/TrendingSearches.svelte';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	// Constants
	const SEARCH_DEBOUNCE_DELAY = 300;
	const INTERSECTION_ROOT_MARGIN = '-100px 0px 0px 0px';
	const DESKTOP_QUICK_FILTERS_LIMIT = 4;
	const MOBILE_CATEGORIES_LIMIT = 2;

	let searchQuery = $state('');
	let isFocused = $state(false);
	let isCategoryDropdownOpen = $state(false);
	let activeCategory = $state('');
	
	const trendingSearches = [
		m.search_vintage_levis(),
		m.search_designer_bags(),
		m.search_nike_trainers(),
		m.search_zara_dress(),
		m.search_north_face_jacket()
	];
	
	// Quick filters with i18n support
	const quickFilters = $derived([
		{ icon: '⭐', name: m.quick_filter_top_sellers(), action: 'top-sellers', ariaLabel: m.quick_filter_top_sellers() },
		{ icon: '✨', name: m.quick_filter_newest(), action: 'newest', ariaLabel: m.quick_filter_newest() },
		{ icon: '🔥', name: m.quick_filter_hot(), action: 'hot', ariaLabel: m.quick_filter_hot() },
		{ icon: '👨', name: m.quick_filter_men(), action: 'men', ariaLabel: m.category_men() },
		{ icon: '👩', name: m.quick_filter_women(), action: 'women', ariaLabel: m.category_women() },
		{ icon: '🏷️', name: m.quick_filter_with_tags(), action: 'with-tags', ariaLabel: m.condition_new_with_tags() },
		{ icon: '👟', name: m.quick_filter_shoes(), action: 'shoes', ariaLabel: m.subcategory_shoes() },
		{ icon: '👕', name: m.quick_filter_tshirts(), action: 't-shirts', ariaLabel: m.subcategory_tshirts() },
		{ icon: '💍', name: m.quick_filter_accessories(), action: 'accessories', ariaLabel: m.subcategory_accessories() },
		{ icon: '👖', name: m.quick_filter_jeans(), action: 'jeans', ariaLabel: m.subcategory_jeans() },
		{ icon: '👗', name: m.quick_filter_dresses(), action: 'dresses', ariaLabel: m.subcategory_dresses() },
		{ icon: '🧥', name: m.quick_filter_jackets(), action: 'jackets', ariaLabel: m.subcategory_jackets() },
		{ icon: '👜', name: m.quick_filter_bags(), action: 'bags', ariaLabel: m.subcategory_bags() },
		{ icon: '💸', name: m.quick_filter_sale(), action: 'sale', ariaLabel: m.filter_browse_all() }
	]);
	
	// Get localized category name
	function getCategoryName(category: Category): string {
		// Use the category's localized name if available
		return category.name;
	}
	
	// Sticky search state for mobile
	let isSticky = $state(false);
	let heroRef: HTMLElement;
	
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		const observer = new IntersectionObserver(
			([entry]) => {
				isSticky = !entry.isIntersecting;
			},
			{ threshold: 0, rootMargin: INTERSECTION_ROOT_MARGIN }
		);
		
		if (heroRef) observer.observe(heroRef);
		return () => {
			if (heroRef) observer.unobserve(heroRef);
			observer.disconnect();
		};
	});

	
	// Debounced search handler for performance
	const debouncedHandleSearch = debounce(() => {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
	}, SEARCH_DEBOUNCE_DELAY);

	function handleSearch() {
		debouncedHandleSearch();
	}
	
	function searchTrending(term: string) {
		searchQuery = term;
		handleSearch();
	}
	

	function handleQuickFilter(action: string) {
		switch(action) {
			case 'newest':
				goto('/browse?sort=created_at&order=desc');
				break;
			case 'sale':
				goto('/browse?filter=sale');
				break;
			case 'hot':
				goto('/browse?filter=hot');
				break;
			case 'top-sellers':
				goto('/browse?sort=favorites_count&order=desc');
				break;
			case 'with-tags':
				goto('/browse?filter=with-tags');
				break;
			case 'men':
				goto('/men');
				break;
			case 'women':
				goto('/women');
				break;
			case 'shoes':
				goto('/shoes');
				break;
			case 't-shirts':
				goto('/browse?category=t-shirts');
				break;
			case 'accessories':
				goto('/accessories');
				break;
			case 'jeans':
				goto('/browse?category=jeans');
				break;
			case 'dresses':
				goto('/browse?category=dresses');
				break;
			case 'jackets':
				goto('/browse?category=jackets');
				break;
			case 'bags':
				goto('/bags');
				break;
			default:
				goto('/browse');
		}
	}
	
	function toggleCategoryDropdown() {
		isCategoryDropdownOpen = !isCategoryDropdownOpen;
	}
	
	function closeCategoryDropdown() {
		isCategoryDropdownOpen = false;
	}
	
	function handleCategorySelect(categorySlug: string) {
		activeCategory = categorySlug;
		if (categorySlug) {
			goto(`/${categorySlug}`);
		} else {
			goto('/browse');
		}
	}
</script>

<section bind:this={heroRef} class="relative bg-gradient-to-b from-blue-50 to-white py-3 md:py-4 pb-0">
	<div class="container px-4">
		<div class="max-w-3xl mx-auto">
			
			<!-- Desktop Layout - Keep existing integrated design -->
			<div class="hidden md:block">
				<div class="relative overflow-visible">
					<div class={cn(
						"relative bg-white rounded-2xl shadow-lg border transition-all duration-200",
						isFocused ? "border-blue-400 ring-1 ring-blue-400" : "border-blue-100"
					)}>
						<div class="flex items-center min-w-0">
							<!-- Category Dropdown Button -->
							<div class="relative flex-shrink-0 pl-4 pr-3 py-3">
								<button
									data-categories-button
									onclick={toggleCategoryDropdown}
									class={cn(
										"flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm focus:outline-none transition-all",
										isCategoryDropdownOpen 
											? "bg-blue-500 text-white shadow-sm hover:bg-blue-600" 
											: "bg-gray-900 text-white hover:bg-gray-800"
									)}
								>
									<span>{m.header_categories()}</span>
									<ChevronDown class={cn(
										"h-4 w-4 transition-transform duration-200",
										isCategoryDropdownOpen && "rotate-180"
									)} />
								</button>
								
								<!-- Category Dropdown -->
								<CategoryDropdown
									{categories}
									isOpen={isCategoryDropdownOpen}
									onToggle={toggleCategoryDropdown}
									onClose={closeCategoryDropdown}
								/>
							</div>
							
							<!-- Divider -->
							<div class="w-px h-6 bg-gray-200 flex-shrink-0"></div>
							
							<!-- Search Input with Icon -->
							<div class="flex-1 min-w-0 flex items-center px-3">
								<input
									type="search"
									placeholder={m.browse_search_placeholder()}
									bind:value={searchQuery}
									onfocus={() => isFocused = true}
									onblur={() => isFocused = false}
									onkeydown={(e) => e.key === 'Enter' && handleSearch()}
									oninput={handleSearch}
									aria-label={m.browse_search_placeholder()}
									class="w-full py-3 pr-3 text-sm md:text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
								/>
								<button
									onclick={handleSearch}
									class="p-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
									aria-label={m.quick_filter_search_button()}
								>
									<span class="text-lg" aria-hidden="true">🔍</span>
								</button>
							</div>
						</div>
						
						
						<!-- Trending Category Links -->
						<div class="border-t border-blue-50 py-2 relative overflow-hidden rounded-b-2xl">
							<div class="px-3 flex items-center gap-2">
								<span class="text-xs text-gray-500 flex-shrink-0 hidden md:block font-medium">{m.search_trending()}:</span>
								
								<!-- Quick Filters Component -->
								<QuickFilterPills
									filters={quickFilters.slice(0, DESKTOP_QUICK_FILTERS_LIMIT)}
									onFilterClick={handleQuickFilter}
									class="flex-1"
								/>
								
								<!-- Divider -->
								<div class="w-px h-5 bg-gray-300 flex-shrink-0" aria-hidden="true"></div>
								
								<!-- More Filters -->
								<QuickFilterPills
									filters={quickFilters.slice(DESKTOP_QUICK_FILTERS_LIMIT)}
									onFilterClick={handleQuickFilter}
									class="flex-1"
								/>
								
								<!-- Divider -->
								<div class="w-px h-5 bg-gray-300 flex-shrink-0" aria-hidden="true"></div>
								
								<!-- Category Quick Links -->
								<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
									{#each categories.slice(0, 3) as category}
										<button
											onclick={() => handleCategorySelect(category.slug)}
											aria-label="{m.filter_categories()}: {getCategoryName(category)}"
											class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
										>
											<span class="text-sm" aria-hidden="true">{category.icon_url || category.icon || '📦'}</span>
											<span>{getCategoryName(category)}</span>
										</button>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Mobile Layout - Optimized for better UX -->
			<div class="block md:hidden">
				<!-- Search Bar Container -->
				<div class={cn(
					"relative bg-white rounded-2xl shadow-lg border transition-all duration-200",
					isFocused ? "border-blue-400 ring-1 ring-blue-400" : "border-blue-100"
				)}>
					<!-- Main Search Row -->
					<div class="flex items-center">
						<!-- Categories Icon Button -->
						<button
							data-categories-button
							onclick={toggleCategoryDropdown}
							class={cn(
								"ml-3 p-2 rounded-lg transition-colors",
								isCategoryDropdownOpen 
									? "bg-blue-500 text-white hover:bg-blue-600" 
									: "bg-gray-900 text-white hover:bg-gray-800"
							)}
							aria-label={m.quick_filter_categories_menu()}
							aria-expanded={isCategoryDropdownOpen}
						>
							<Menu class="h-5 w-5" />
						</button>
						<!-- Divider -->
						<div class="w-px h-6 bg-gray-200 mx-2"></div>
						<!-- Search Input -->
						<input
							type="search"
							placeholder={m.browse_search_placeholder()}
							bind:value={searchQuery}
							onfocus={() => isFocused = true}
							onblur={() => isFocused = false}
							onkeydown={(e) => e.key === 'Enter' && handleSearch()}
							oninput={handleSearch}
							aria-label={m.browse_search_placeholder()}
							class="flex-1 py-4 pr-3 text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
						/>
						<button
							onclick={handleSearch}
							class="p-3 mr-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
							aria-label={m.quick_filter_search_button()}
						>
							<span class="text-xl" aria-hidden="true">🔍</span>
						</button>
					</div>
					
					<!-- Pills Section OR Category Dropdown -->
					<div class="border-t border-gray-100">
						{#if !isCategoryDropdownOpen}
							<!-- Pills Section -->
							<div class="pt-2 pb-3 px-3 relative">
								<!-- Pills Container aligned with search input area -->
								<div class="ml-1 mr-1">
									<!-- Quick Filters -->
									<div class="overflow-x-auto relative">
										<div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
											{#each quickFilters.slice(0, 4) as filter}
												<button
													onclick={() => handleQuickFilter(filter.action)}
													class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
												>
													<span class="text-sm">{filter.icon}</span>
													<span>{filter.name}</span>
												</button>
											{/each}
											
											<!-- Divider -->
											<div class="w-px h-4 bg-gray-300 flex-shrink-0"></div>
											
											<!-- More quick filters -->
											{#each quickFilters.slice(4) as filter}
												<button
													onclick={() => handleQuickFilter(filter.action)}
													class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
												>
													<span class="text-sm">{filter.icon}</span>
													<span>{filter.name}</span>
												</button>
											{/each}
											
											<!-- Divider -->
											<div class="w-px h-4 bg-gray-300 flex-shrink-0"></div>
											
											<!-- Category Quick Links -->
											{#each categories.slice(0, 2) as category}
												<button
													onclick={() => handleCategorySelect(category.slug)}
													class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-medium whitespace-nowrap flex-shrink-0"
												>
													<span class="text-sm">{category.icon_url || category.icon || '📦'}</span>
													<span>{getCategoryName(category)}</span>
												</button>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{:else}
							<!-- Category Dropdown replaces pills -->
							<CategoryDropdown
								{categories}
								isOpen={isCategoryDropdownOpen}
								onToggle={toggleCategoryDropdown}
								onClose={closeCategoryDropdown}
								class="!static !mt-0 !w-full !rounded-none !rounded-b-2xl !shadow-none !border-0"
							/>
						{/if}
					</div>
				</div>
			</div>
			
			<!-- Trending Searches - Compact -->
			<TrendingSearches
				searches={trendingSearches}
				onSearchClick={searchTrending}
				maxVisible={3}
				class="mt-2"
			/>
		</div>
	</div>
</section>

<!-- Sticky Search Bar (Reusable Component) -->
<StickySearchBar
	bind:value={searchQuery}
	placeholder={m.browse_search_placeholder()}
	onSearch={handleSearch}
	onCategorySelect={handleCategorySelect}
	{categories}
	{activeCategory}
	visible={isSticky}
/>

<style>
	/* Hide scrollbar for quick categories */
	.overflow-x-auto {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.overflow-x-auto::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>