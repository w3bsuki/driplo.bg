<script lang="ts">
	import { Search, ChevronLeft, ChevronRight, Star, ChevronDown, ChevronUp, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import type { Category } from '$lib/types';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		categories?: Category[];
	}

	let { categories = [] }: Props = $props();

	// State management
	let searchQuery = $state('');
	let isFocused = $state(false);
	let isSearching = $state(false);
	let showCategories = $state(false);
	let selectedCategory = $state<string | null>(null);
	let expandedCategories = $state<Set<string>>(new Set());
	let searchInputRef: HTMLInputElement;
	let dropdownRef: HTMLDivElement;
	let currentSellerIndex = $state(0);

	// Top sellers data (in production, fetch from API)
	const topSellers = [
		{ 
			id: '1',
			username: 'vintage_lover',
			avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
			sales: 342,
			rating: 4.9
		},
		{ 
			id: '2',
			username: 'streetwear_king',
			avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
			sales: 287,
			rating: 4.8
		},
		{ 
			id: '3',
			username: 'luxury_finds',
			avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
			sales: 523,
			rating: 5.0
		},
		{ 
			id: '4',
			username: 'eco_fashion',
			avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
			sales: 198,
			rating: 4.7
		},
		{ 
			id: '5',
			username: 'trendy_closet',
			avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
			sales: 412,
			rating: 4.9
		}
	];

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

	// Trending searches
	const trendingSearches = [
		'Vintage Levi\'s',
		'Designer bags',
		'Nike Air Max',
		'Zara dresses'
	];

	// Always show 3 sellers
	const visibleSellers = $derived(() => {
		const start = currentSellerIndex;
		const sellers = [];
		for (let i = 0; i < 3; i++) {
			sellers.push(topSellers[(start + i) % topSellers.length]);
		}
		return sellers;
	});

	function nextSellers() {
		currentSellerIndex = (currentSellerIndex + 3) % topSellers.length;
	}

	function prevSellers() {
		currentSellerIndex = (currentSellerIndex - 3 + topSellers.length) % topSellers.length;
	}

	function handleSearch() {
		if (!searchQuery.trim() && !selectedCategory) return;
		
		isSearching = true;
		showCategories = false;
		
		const params = new URLSearchParams();
		if (searchQuery.trim()) {
			params.set('q', searchQuery.trim());
		}
		if (selectedCategory) {
			params.set('category', selectedCategory);
		}
		
		goto(`/browse?${params.toString()}`);
		
		setTimeout(() => {
			isSearching = false;
		}, 500);
	}

	function handleCategorySelect(category: string, subcategory?: string) {
		showCategories = false;
		if (subcategory) {
			goto(`/${category}/${subcategory}`);
		} else {
			goto(`/${category}`);
		}
	}

	function handleSearchFocus() {
		isFocused = true;
		showCategories = true;
	}
	
	function handleSearchClick(e: MouseEvent) {
		e.stopPropagation();
		showCategories = true;
	}

	function handleSearchBlur(e: FocusEvent) {
		// Check if the blur is moving to the dropdown
		const relatedTarget = e.relatedTarget as HTMLElement;
		if (relatedTarget && dropdownRef?.contains(relatedTarget)) {
			return;
		}
		
		// Delay to allow category clicks
		setTimeout(() => {
			isFocused = false;
			if (!searchQuery) {
				showCategories = false;
			}
		}, 200);
	}
	
	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!searchInputRef?.contains(target) && !dropdownRef?.contains(target)) {
			showCategories = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSearch();
		} else if (event.key === 'Escape') {
			showCategories = false;
			searchInputRef?.blur();
		}
	}

	function goToSeller(username: string) {
		goto(`/profile/${username}`);
	}
	
	function toggleCategory(categorySlug: string) {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categorySlug)) {
			newExpanded.delete(categorySlug);
		} else {
			newExpanded.add(categorySlug);
		}
		expandedCategories = newExpanded;
	}

	onMount(() => {
		// Auto-rotate sellers every 5 seconds
		const interval = setInterval(nextSellers, 5000);
		
		// Add document click listener for closing dropdown
		document.addEventListener('click', handleDocumentClick);
		
		return () => {
			clearInterval(interval);
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<section class="relative bg-white py-8 md:py-12">
	<!-- Subtle gradient background -->
	<div class="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none"></div>
	
	<div class="container px-4 relative">
		<div class="max-w-5xl mx-auto">
			
			<!-- Single Row Headline with Beautiful Typography -->
			<div class="text-center mb-8">
				<!-- Mobile: Short and punchy -->
				<h1 class="text-2xl font-bold tracking-tight text-gray-900 md:hidden">
					Buy & sell fashion you'll love
				</h1>
				<!-- Desktop: Full headline -->
				<h1 class="hidden md:block text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
					Discover fashion from people you'll love
				</h1>
			</div>

			<!-- Top Sellers Carousel -->
			<div class="mb-8">
				<div class="flex items-center justify-center gap-2 mb-4">
					<Star class="h-4 w-4 text-yellow-500 fill-current" />
					<span class="text-sm font-medium text-gray-600">Top Sellers This Week</span>
				</div>
				
				<div class="flex items-center justify-center gap-4">
					<!-- Previous Button -->
					<button
						onclick={prevSellers}
						class="p-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
						aria-label="Previous sellers"
					>
						<ChevronLeft class="h-4 w-4 text-gray-600" />
					</button>
					
					<!-- Sellers Display - Fixed Width Containers -->
					<div class="flex items-center gap-3 sm:gap-4 md:gap-6">
						{#each visibleSellers() as seller}
							<button
								onclick={() => goToSeller(seller.username)}
								class="group cursor-pointer w-20 sm:w-24 md:w-28 flex-shrink-0"
								in:fade={{ duration: 300 }}
							>
								<div class="flex flex-col items-center">
									<div class="relative mb-2">
										<img
											src={seller.avatar}
											alt={seller.username}
											class="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-200"
										/>
										<div class="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
											★{seller.rating}
										</div>
									</div>
									<div class="text-center w-full">
										<p class="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate px-1">
											@{seller.username}
										</p>
										<p class="text-[11px] md:text-xs text-gray-500">
											{seller.sales} sales
										</p>
									</div>
								</div>
							</button>
						{/each}
					</div>
					
					<!-- Next Button -->
					<button
						onclick={nextSellers}
						class="p-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
						aria-label="Next sellers"
					>
						<ChevronRight class="h-4 w-4 text-gray-600" />
					</button>
				</div>
			</div>

			<!-- Elegant Search Bar -->
			<div class="relative max-w-2xl mx-auto" style="z-index: 9999; position: relative;">
				<div class={cn(
					"relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200",
					isFocused ? "border-blue-500 shadow-xl" : "border-gray-200",
					showCategories && "rounded-b-none"
				)}>
					<div class="flex items-center px-4 md:px-6 h-14 md:h-16">
						<Search class="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
						
						<input
							bind:this={searchInputRef}
							type="search"
							placeholder="Search for brands, items, or @sellers..."
							bind:value={searchQuery}
							onfocus={handleSearchFocus}
							onclick={handleSearchClick}
							onblur={handleSearchBlur}
							onkeydown={handleKeydown}
							class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-base md:text-lg placeholder:text-gray-400"
							autocomplete="off"
							aria-label="Search products"
							aria-expanded={showCategories}
							aria-haspopup="listbox"
						/>
						
						{#if searchQuery}
							<button
								onclick={() => { searchQuery = ''; searchInputRef?.focus(); }}
								class="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
								aria-label="Clear search"
							>
								<X class="h-4 w-4 text-gray-400" />
							</button>
						{/if}
						
						<button
							onclick={handleSearch}
							disabled={isSearching || (!searchQuery.trim() && !selectedCategory)}
							class={cn(
								"px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold transition-all duration-200",
								"bg-gradient-to-r from-blue-600 to-purple-600 text-white",
								"hover:from-blue-700 hover:to-purple-700",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							)}
							aria-label="Search"
						>
							{isSearching ? 'Searching...' : 'Search'}
						</button>
					</div>
				</div>

				<!-- Categories Dropdown - Compact Accordion Style -->
				{#if showCategories}
					<div 
						bind:this={dropdownRef}
						class="absolute top-full left-0 right-0 bg-white rounded-b-2xl shadow-xl border-2 border-t-0 border-gray-200 max-h-[400px] overflow-y-auto"
						style="z-index: 99999;"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<div class="p-3">
							<!-- Compact Category List -->
							<div class="space-y-1">
								{#each categoryTree as category}
									{@const isExpanded = expandedCategories.has(category.slug)}
									<div class="border-b border-gray-100 last:border-0">
										<!-- Category Header - Clickable -->
										<button
											onclick={() => toggleCategory(category.slug)}
											class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors rounded-lg"
										>
											<span class="font-medium text-gray-900">{category.name}</span>
											<div class="flex items-center gap-2">
												<button
													onclick={(e) => { e.stopPropagation(); handleCategorySelect(category.slug); }}
													class="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
												>
													View all
												</button>
												<ChevronDown class={cn(
													"h-4 w-4 text-gray-400 transition-transform duration-200",
													isExpanded && "rotate-180"
												)} />
											</div>
										</button>
										
										<!-- Subcategories - Collapsible -->
										{#if isExpanded}
											<div class="grid grid-cols-2 md:grid-cols-3 gap-1 px-3 pb-2" transition:fly={{ y: -5, duration: 150 }}>
												{#each category.subcategories as sub}
													<button
														onclick={() => handleCategorySelect(category.slug, sub.slug)}
														class="text-left px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
													>
														{sub.name}
													</button>
												{/each}
											</div>
										{/if}
									</div>
								{/each}
							</div>
							
							<!-- Trending Searches - Compact -->
							<div class="mt-3 pt-3 border-t border-gray-200">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="text-xs text-gray-500 font-medium">TRENDING:</span>
									{#each trendingSearches as term}
										<button
											onclick={() => { searchQuery = term; handleSearch(); }}
											class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-full transition-colors"
										>
											{term}
										</button>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>


		</div>
	</div>
</section>