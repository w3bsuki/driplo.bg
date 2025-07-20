<script lang="ts">
	import { Sparkles, TrendingUp, ChevronDown, Menu } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import CategoryDropdown from '$lib/components/shared/CategoryDropdown.svelte';
	import StickySearchBar from '$lib/components/search/StickySearchBar.svelte';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
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
	
	// Quick filters and trending categories
	const quickFilters = [
		{ icon: '✨', name: getLocale() === 'bg' ? 'Най-нови' : 'Newest', action: 'newest' },
		{ icon: '💸', name: getLocale() === 'bg' ? 'Намаления' : 'Sale', action: 'sale' },
		{ icon: '🔥', name: getLocale() === 'bg' ? 'Горещи' : 'Hot', action: 'hot' },
		{ icon: '⭐', name: getLocale() === 'bg' ? 'Топ продавачи' : 'Top sellers', action: 'top-sellers' }
	];
	
	// Category name translations
	function getCategoryName(category: Category): string {
		if (getLocale() === 'bg') {
			const translations: Record<string, string> = {
				'women': 'Жени',
				'men': 'Мъже',
				'kids': 'Деца',
				'shoes': 'Обувки',
				'bags': 'Чанти',
				'accessories': 'Аксесоари',
				'jewelry': 'Бижута',
				'beauty': 'Козметика',
				'home': 'Дом',
				'sports': 'Спорт',
				'electronics': 'Електроника',
				'books': 'Книги'
			};
			return translations[category.slug] || category.name;
		}
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
			{ threshold: 0, rootMargin: '-100px 0px 0px 0px' }
		);
		
		if (heroRef) observer.observe(heroRef);
		return () => {
			if (heroRef) observer.unobserve(heroRef);
			observer.disconnect();
		};
	});

	
	function handleSearch() {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
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
							<div class="relative flex-shrink-0 pl-4 pr-3">
								<button
									data-categories-button
									onclick={toggleCategoryDropdown}
									class={cn(
										"flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm focus:outline-none",
										isCategoryDropdownOpen 
											? "bg-gradient-to-r from-blue-300 to-blue-400 text-white shadow-sm" 
											: "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
									)}
								>
									<span class={cn(
										isCategoryDropdownOpen ? "text-white" : "text-gray-900"
									)}>{m.header_categories()}</span>
									<ChevronDown class={cn(
										"h-4 w-4 transition-transform duration-200",
										isCategoryDropdownOpen && "rotate-180",
										isCategoryDropdownOpen ? "text-white" : "text-gray-900"
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
							<div class="w-px h-6 bg-blue-100 flex-shrink-0"></div>
							
							<!-- Search Input with Icon -->
							<div class="flex-1 min-w-0 flex items-center">
								<input
									type="search"
									placeholder={m.browse_search_placeholder()}
									bind:value={searchQuery}
									onfocus={() => isFocused = true}
									onblur={() => isFocused = false}
									onkeydown={(e) => e.key === 'Enter' && handleSearch()}
									class="w-full py-4 md:py-4.5 pl-4 pr-3 text-sm md:text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
								/>
								<button
									onclick={handleSearch}
									class="p-2 mr-2 hover:scale-110 transition-transform focus:outline-none"
									aria-label="Search"
								>
									<span class="text-lg">🔍</span>
								</button>
							</div>
						</div>
						
						
						<!-- Trending Category Links -->
						<div class="border-t border-blue-50 py-3 md:py-3 relative overflow-hidden rounded-b-2xl">
							<div class="mx-4 flex items-center gap-2.5 md:gap-3 overflow-x-auto relative">
								<span class="text-xs text-gray-500 flex-shrink-0 hidden md:block font-medium">{m.search_trending()}:</span>
								
								{#each quickFilters as filter}
									<button
										onclick={() => handleQuickFilter(filter.action)}
										class="flex items-center gap-1.5 px-3 md:px-3 py-2 md:py-1.5 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white text-xs font-medium whitespace-nowrap active:from-blue-400 active:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
									>
										<span class="text-sm">{filter.icon}</span>
										<span>{filter.name}</span>
									</button>
								{/each}
								
								<!-- Divider -->
								<div class="w-px h-5 bg-blue-200 flex-shrink-0"></div>
								
								<!-- Category Quick Links -->
								{#each categories.slice(0, 6) as category}
									<button
										onclick={() => handleCategorySelect(category.slug)}
										class="flex items-center gap-1.5 px-3 md:px-3 py-2 md:py-1.5 rounded-full bg-white border border-blue-200 hover:bg-blue-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
									>
										<span class="text-sm">{category.icon_url || category.icon || '📦'}</span>
										<span>{getCategoryName(category)}</span>
									</button>
								{/each}
							</div>
							<!-- Gradient fade on right side for mobile -->
							<div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none md:hidden flex items-center justify-end pr-2">
								<span class="text-blue-300 text-xs">→</span>
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
									? "bg-blue-400 text-white" 
									: "bg-blue-50 text-blue-600"
							)}
							aria-label="Categories"
						>
							<Menu class="h-5 w-5" />
						</button>
						<!-- Divider -->
						<div class="w-px h-6 bg-blue-100 mx-2"></div>
						<!-- Search Input -->
						<input
							type="search"
							placeholder={m.browse_search_placeholder()}
							bind:value={searchQuery}
							onfocus={() => isFocused = true}
							onblur={() => isFocused = false}
							onkeydown={(e) => e.key === 'Enter' && handleSearch()}
							class="flex-1 py-4 pr-3 text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
						/>
						<button
							onclick={handleSearch}
							class="p-3 mr-2 hover:scale-110 transition-transform focus:outline-none"
							aria-label="Search"
						>
							<span class="text-xl">🔍</span>
						</button>
					</div>
					
					<!-- Pills Section OR Category Dropdown -->
					<div class="border-t border-blue-50">
						{#if !isCategoryDropdownOpen}
							<!-- Pills Section -->
							<div class="pt-2 pb-3 px-3">
								<!-- Pills Container aligned with search input area -->
								<div class="ml-1 mr-1">
									<!-- Quick Filters -->
									<div class="overflow-x-auto">
										<div class="flex items-center gap-1.5">
											{#each quickFilters as filter}
												<button
													onclick={() => handleQuickFilter(filter.action)}
													class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white text-xs font-medium whitespace-nowrap active:from-blue-400 active:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
												>
													<span class="text-sm">{filter.icon}</span>
													<span>{filter.name}</span>
												</button>
											{/each}
											
											<!-- Divider -->
											<div class="w-px h-4 bg-blue-200 flex-shrink-0"></div>
											
											<!-- Category Quick Links -->
											{#each categories.slice(0, 4) as category}
												<button
													onclick={() => handleCategorySelect(category.slug)}
													class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-blue-200 text-gray-700 text-xs font-medium whitespace-nowrap flex-shrink-0"
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
			<div class="mt-2 flex items-center justify-center gap-2 flex-wrap text-xs md:text-sm">
				<span class="text-gray-500">{m.search_trending()}:</span>
				{#each trendingSearches.slice(0, 3) as term}
					<button
						onclick={() => searchTrending(term)}
						class="text-gray-600 active:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
					>
						{term}
					</button>
				{/each}
			</div>
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
</style>