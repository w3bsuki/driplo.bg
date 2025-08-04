<script lang="ts">
	import { ChevronDown, Menu, Search, Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import CategoryDropdown from '$lib/components/shared/CategoryDropdown.svelte';
	import TrendingSearches from '$lib/components/search/TrendingSearches.svelte';
	import type { Category } from '$lib/types';
	import { onMount } from 'svelte';
	import {
		header_categories,
		browse_search_placeholder,
		quick_filter_search_button,
		search_trending,
		search_vintage_levis,
		search_designer_bags,
		search_nike_trainers,
		search_zara_dress,
		search_north_face_jacket,
		quick_filter_top_sellers,
		quick_filter_men,
		quick_filter_women,
		quick_filter_newest,
		quick_filter_hot,
		quick_filter_with_tags,
		quick_filter_shoes,
		quick_filter_tshirts,
		quick_filter_accessories,
		quick_filter_jeans,
		quick_filter_dresses,
		quick_filter_jackets,
		quick_filter_bags,
		quick_filter_sale,
		category_men,
		category_women,
		condition_new_with_tags,
		subcategory_shoes,
		subcategory_tshirts,
		subcategory_accessories,
		subcategory_jeans,
		subcategory_dresses,
		subcategory_jackets,
		subcategory_bags,
		filter_browse_all,
		filter_categories,
		quick_filter_categories_menu
	} from '$lib/paraglide/messages.js';
	
	interface QuickFilter {
		icon: string;
		name: string;
		action: string;
		ariaLabel?: string;
		color?: 'golden' | 'blue' | 'pink';
	}
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	// State management - clean and minimal
	let searchQuery = $state('');
	let isFocused = $state(false);
	let isLoading = $state(false);
	let isCategoryDropdownOpen = $state(false);
	let activeCategory = $state('');
	let isSticky = $state(false);
	let searchInputRef: HTMLInputElement;
	let heroRef: HTMLElement;
	let StickySearchBar: any = null;
	
	// Auto-complete state
	let suggestions = $state<string[]>([]);
	let activeSuggestionIndex = $state(-1);
	let showSuggestions = $state(false);
	
	// Constants
	const SEARCH_DEBOUNCE_DELAY = 300;
	const INTERSECTION_ROOT_MARGIN = '-80px 0px 0px 0px';
	
	// Trending searches
	const trendingSearches = [
		search_vintage_levis(),
		search_designer_bags(),
		search_nike_trainers(),
		search_zara_dress(),
		search_north_face_jacket()
	];
	
	// Quick filters with proper accessibility
	const quickFilters: QuickFilter[] = [
		{ icon: '⭐', name: quick_filter_top_sellers(), action: 'top-sellers', ariaLabel: quick_filter_top_sellers(), color: 'golden' },
		{ icon: '👨', name: quick_filter_men(), action: 'men', ariaLabel: category_men(), color: 'blue' },
		{ icon: '👩', name: quick_filter_women(), action: 'women', ariaLabel: category_women(), color: 'pink' },
		{ icon: '✨', name: quick_filter_newest(), action: 'newest', ariaLabel: quick_filter_newest() },
		{ icon: '🔥', name: quick_filter_hot(), action: 'hot', ariaLabel: quick_filter_hot() },
		{ icon: '🏷️', name: quick_filter_with_tags(), action: 'with-tags', ariaLabel: condition_new_with_tags() },
		{ icon: '👟', name: quick_filter_shoes(), action: 'shoes', ariaLabel: subcategory_shoes() },
		{ icon: '👕', name: quick_filter_tshirts(), action: 't-shirts', ariaLabel: subcategory_tshirts() },
		{ icon: '💍', name: quick_filter_accessories(), action: 'accessories', ariaLabel: subcategory_accessories() },
		{ icon: '👖', name: quick_filter_jeans(), action: 'jeans', ariaLabel: subcategory_jeans() },
		{ icon: '👗', name: quick_filter_dresses(), action: 'dresses', ariaLabel: subcategory_dresses() },
		{ icon: '🧥', name: quick_filter_jackets(), action: 'jackets', ariaLabel: subcategory_jackets() },
		{ icon: '👜', name: quick_filter_bags(), action: 'bags', ariaLabel: subcategory_bags() },
		{ icon: '💸', name: quick_filter_sale(), action: 'sale', ariaLabel: filter_browse_all() }
	];
	
	// Initialize component
	onMount(async () => {
		// Lazy load sticky search bar
		const stickyModule = await import('$lib/components/search/StickySearchBar.svelte');
		StickySearchBar = stickyModule.default;
		
		// Setup intersection observer for sticky behavior - small delay to ensure DOM is ready
		setTimeout(() => {
			setupIntersectionObserver();
		}, 100);
	});
	
	function setupIntersectionObserver() {
		if (typeof window === 'undefined' || !heroRef) return;
		
		const observer = new IntersectionObserver(
			([entry]) => {
				isSticky = !entry.isIntersecting;
			},
			{ threshold: 0, rootMargin: INTERSECTION_ROOT_MARGIN }
		);
		
		observer.observe(heroRef);
		
		return () => {
			observer.disconnect();
		};
	}
	
	// Auto-complete functionality
	function generateSuggestions(query: string): string[] {
		if (!query.trim() || query.length < 2) return [];
		
		const searchTerms = [
			...trendingSearches,
			'vintage designer',
			'luxury bags',
			'sneakers collection',
			'summer dresses',
			'winter jackets',
			'casual wear',
			'formal attire',
			'accessories set'
		];
		
		return searchTerms
			.filter(term => term.toLowerCase().includes(query.toLowerCase()))
			.slice(0, 5);
	}
	
	// Debounced search with auto-complete
	const debouncedSearch = debounce((query: string) => {
		if (query.trim().length >= 2) {
			suggestions = generateSuggestions(query);
			showSuggestions = suggestions.length > 0;
		} else {
			suggestions = [];
			showSuggestions = false;
		}
		activeSuggestionIndex = -1;
	}, 150);
	
	// Navigation handlers
	const debouncedNavigate = debounce(() => {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
		isLoading = false;
	}, SEARCH_DEBOUNCE_DELAY);
	
	function handleSearch() {
		isLoading = true;
		showSuggestions = false;
		debouncedNavigate();
	}
	
	function handleInput() {
		debouncedSearch(searchQuery);
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions) {
			if (event.key === 'Enter') {
				event.preventDefault();
				handleSearch();
			}
			return;
		}
		
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (activeSuggestionIndex >= 0) {
					searchQuery = suggestions[activeSuggestionIndex];
				}
				handleSearch();
				break;
			case 'Escape':
				showSuggestions = false;
				activeSuggestionIndex = -1;
				searchInputRef?.blur();
				break;
		}
	}
	
	function selectSuggestion(suggestion: string) {
		searchQuery = suggestion;
		handleSearch();
	}
	
	function handleFocus() {
		isFocused = true;
		if (searchQuery.trim().length >= 2) {
			debouncedSearch(searchQuery);
		}
	}
	
	function handleBlur() {
		// Delay to allow suggestion clicks
		setTimeout(() => {
			isFocused = false;
			showSuggestions = false;
			activeSuggestionIndex = -1;
		}, 150);
	}
	
	function searchTrending(term: string) {
		searchQuery = term;
		handleSearch();
	}
	
	function handleQuickFilter(action: string) {
		const routes: Record<string, string> = {
			newest: '/browse?sort=newest',
			sale: '/browse?filter=sale',
			hot: '/browse?filter=trending',
			'top-sellers': '/leaderboard',
			'with-tags': '/browse?condition=new-with-tags',
			men: '/men',
			women: '/women',
			shoes: '/shoes',
			bags: '/bags',
			designer: '/designer',
			kids: '/kids',
			jeans: '/browse?category=jeans',
			dresses: '/browse?category=dresses',
			jackets: '/browse?category=jackets'
		};
		
		goto(routes[action] || '/browse');
	}
	
	function toggleCategoryDropdown() {
		isCategoryDropdownOpen = !isCategoryDropdownOpen;
	}
	
	function closeCategoryDropdown() {
		isCategoryDropdownOpen = false;
	}
	
	function handleCategorySelect(categorySlug: string) {
		activeCategory = categorySlug;
		closeCategoryDropdown();
		goto(categorySlug ? `/${categorySlug}` : '/browse');
	}
	
	function getCategoryName(category: Category): string {
		return category.name;
	}
</script>

<section bind:this={heroRef} class="relative bg-gradient-to-b from-blue-50 to-white py-4 md:py-6">
	<div class="container px-3 md:px-4">
		<div class="max-w-3xl mx-auto">
			<!-- Mobile-Optimized Search Container -->
			<div class="relative">
				<!-- Main Search Bar - Enhanced for Mobile -->
				<div class={cn(
					"relative bg-white rounded-2xl md:rounded-lg border-2 transition-all duration-200",
					isFocused ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-md"
				)}>
					<!-- Search Input Row - Bigger on Mobile -->
					<div class="flex items-center h-14 md:h-12">
						<!-- Category Button - More Touch-Friendly -->
						<div class="relative flex-shrink-0 pl-1 pr-1 md:pl-2.5 md:pr-2">
							<button
								onclick={toggleCategoryDropdown}
								class={cn(
									"flex items-center gap-1 px-3 md:px-2.5 h-11 md:h-9 rounded-xl md:rounded-sm text-sm font-medium transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
									isCategoryDropdownOpen 
										? "bg-blue-500 text-white hover:bg-blue-600" 
										: "bg-gray-900 text-white hover:bg-gray-800"
								)}
								aria-label={quick_filter_categories_menu()}
							>
								<Menu class="h-5 w-5 md:h-4 md:w-4" />
								<span class="hidden sm:inline">{header_categories()}</span>
								<ChevronDown class={cn(
									"h-3 w-3 transition-transform duration-100 hidden sm:block",
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
						
						<!-- Divider - Hidden on Mobile -->
						<div class="w-px h-8 md:h-7 bg-gray-200 flex-shrink-0 hidden md:block"></div>
						
						<!-- Search Input Container - Bigger Touch Target -->
						<div class="flex-1 min-w-0 flex items-center px-3 md:px-3 relative">
							<span class="text-gray-400 mr-2 text-lg md:hidden">🔍</span>
							<input
								bind:this={searchInputRef}
								type="search"
								placeholder="Search fashion..."
								bind:value={searchQuery}
								onfocus={handleFocus}
								onblur={handleBlur}
								onkeydown={handleKeydown}
								oninput={handleInput}
								aria-label={browse_search_placeholder()}
								aria-expanded={showSuggestions}
								aria-haspopup="listbox"
								aria-autocomplete="list"
								class="w-full h-11 md:h-9 border-0 focus:ring-0 focus:outline-none bg-transparent text-base md:text-sm placeholder:text-gray-400"
								autocomplete="off"
							/>
							
							<!-- Search Button - Bigger on Mobile -->
							<button
								onclick={handleSearch}
								disabled={isLoading}
								class="p-2.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-sm transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
								aria-label={quick_filter_search_button()}
							>
								{#if isLoading}
									<Loader2 class="h-5 w-5 md:h-4 md:w-4 animate-spin text-gray-600" />
								{:else}
									<Search class="h-5 w-5 md:h-4 md:w-4 text-gray-600 hidden md:block" />
									<span class="text-base md:hidden">→</span>
								{/if}
							</button>
						</div>
					</div>
					
					<!-- Auto-complete Suggestions -->
					{#if showSuggestions && suggestions.length > 0}
						<div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-sm shadow-lg z-50 mt-1">
							<ul role="listbox" class="py-1">
								{#each suggestions as suggestion, index}
									<li role="option" aria-selected={index === activeSuggestionIndex}>
										<button
											onclick={() => selectSuggestion(suggestion)}
											class={cn(
												"w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-100 focus:outline-none focus:bg-gray-100",
												index === activeSuggestionIndex && "bg-gray-100"
											)}
										>
											<Search class="h-3 w-3 inline mr-2 text-gray-400" />
											{suggestion}
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					
					<!-- Quick Filters Section - Mobile Optimized -->
					<div class="border-t border-gray-100">
						<div class="p-2.5 md:p-2">
							<!-- Mobile: Just Filters, Desktop: Label + Filters -->
							<div class="flex items-center gap-2">
								<span class="text-xs text-gray-500 flex-shrink-0 hidden md:block">{search_trending()}:</span>
								
								<!-- Scrollable Filters - Bigger on Mobile -->
								<div class="flex-1 overflow-x-auto scrollbar-hide">
									<div class="flex items-center gap-2 md:gap-1.5 pb-1">
										<!-- Quick Filter Pills - Larger Touch Targets -->
										{#each quickFilters.slice(0, 8) as filter}
											<button
												onclick={() => handleQuickFilter(filter.action)}
												class={cn(
													"flex items-center gap-1.5 md:gap-1 px-3.5 md:px-2.5 py-2.5 md:py-2 rounded-xl md:rounded-sm text-sm md:text-xs font-semibold whitespace-nowrap transition-all duration-100 focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 flex-shrink-0",
													filter.color === 'golden' && "bg-gradient-to-r from-amber-500 to-yellow-500 border-0 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md",
													filter.color === 'blue' && "bg-gradient-to-r from-blue-500 to-sky-500 border-0 hover:from-blue-600 hover:to-sky-600 text-white shadow-md",
													filter.color === 'pink' && "bg-gradient-to-r from-pink-500 to-rose-500 border-0 hover:from-pink-600 hover:to-rose-600 text-white shadow-md",
													!filter.color && "bg-gray-50 md:bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-100 md:hover:bg-gray-50 text-gray-700 font-medium"
												)}
												aria-label={filter.ariaLabel}
												>
												<span aria-hidden="true" class="text-base md:text-sm">{filter.icon}</span>
												<span>{filter.name}</span>
											</button>
										{/each}
										
										<!-- Category Quick Links - Hidden on Mobile to Reduce Clutter -->
										{#each categories.slice(0, 3) as category}
											<button
												onclick={() => handleCategorySelect(category.slug)}
												class="hidden md:flex items-center gap-1 px-2.5 py-2 rounded-sm bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
												aria-label="{filter_categories()}: {getCategoryName(category)}"
												>
												<span aria-hidden="true">{category.icon_url || category.icon || '📦'}</span>
												<span>{getCategoryName(category)}</span>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Trending Searches - Desktop Only to Keep Mobile Clean -->
			<div class="hidden md:block">
				<TrendingSearches
					searches={trendingSearches}
					onSearchClick={searchTrending}
					maxVisible={3}
					class="mt-3"
				/>
			</div>
		</div>
	</div>
</section>

<!-- Sticky Search Bar -->
{#if StickySearchBar}
	<StickySearchBar
		bind:value={searchQuery}
		placeholder={browse_search_placeholder()}
		onSearch={handleSearch}
		onCategorySelect={handleCategorySelect}
		{categories}
		{activeCategory}
		visible={isSticky}
	/>
{/if}

<style>
	/* Hide scrollbar for filters */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>