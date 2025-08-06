<script lang="ts">
	import { Search, TrendingUp, Shield, Package, Star } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import type { Category } from '$lib/types';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		categories?: Category[];
	}

	let { categories = [] }: Props = $props();

	// State management - clean and minimal
	let searchQuery = $state('');
	let isFocused = $state(false);
	let isSearching = $state(false);
	let searchInputRef: HTMLInputElement;

	// Auto-complete state
	let suggestions = $state<string[]>([]);
	let showSuggestions = $state(false);

	// Trust metrics (could be fetched from API)
	const trustMetrics = {
		totalUsers: '50,000+',
		avgRating: 4.8,
		verified: true,
		securePay: true
	};

	// Trending searches - simplified
	const trendingSearches = [
		'Designer bags',
		'Nike trainers',
		'Vintage denim',
		'Zara dresses'
	];

	// Professional category buttons (max 4)
	const mainCategories = [
		{ name: 'Women', slug: 'women' },
		{ name: 'Men', slug: 'men' },
		{ name: 'Shoes', slug: 'shoes' },
		{ name: 'Bags', slug: 'bags' }
	];

	// Auto-complete functionality
	const debouncedSuggestions = debounce((query: string) => {
		if (query.trim().length >= 2) {
			// In production, this would be an API call
			suggestions = trendingSearches
				.filter(term => term.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 5);
			showSuggestions = suggestions.length > 0;
		} else {
			suggestions = [];
			showSuggestions = false;
		}
	}, 150);

	function handleSearch() {
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		showSuggestions = false;
		
		const params = new URLSearchParams();
		params.set('q', searchQuery.trim());
		goto(`/browse?${params.toString()}`);
		
		setTimeout(() => {
			isSearching = false;
		}, 500);
	}

	function handleInput() {
		debouncedSuggestions(searchQuery);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSearch();
		} else if (event.key === 'Escape' && showSuggestions) {
			showSuggestions = false;
			searchInputRef?.blur();
		}
	}

	function selectSuggestion(suggestion: string) {
		searchQuery = suggestion;
		handleSearch();
	}

	function handleCategoryClick(slug: string) {
		goto(`/${slug}`);
	}

	function handleTrendingClick(term: string) {
		searchQuery = term;
		handleSearch();
	}

	onMount(() => {
		// Focus search on desktop
		if (window.innerWidth >= 768) {
			setTimeout(() => searchInputRef?.focus(), 100);
		}
	});
</script>

<section class="relative bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
	<div class="container px-4">
		<div class="max-w-4xl mx-auto">
			
			<!-- Main Headline - Value Proposition -->
			<div class="text-center mb-6">
				<h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
					Find Premium Fashion at Unbeatable Prices
				</h1>
				<p class="text-gray-600 text-sm md:text-base">
					Join {trustMetrics.totalUsers} fashion lovers buying and selling designer items
				</p>
			</div>

			<!-- Trust Signals Bar -->
			<div class="flex items-center justify-center gap-4 md:gap-6 mb-6 text-xs md:text-sm">
				<div class="flex items-center gap-1 text-gray-600">
					<Shield class="h-4 w-4 text-green-600" />
					<span>Buyer Protection</span>
				</div>
				<div class="flex items-center gap-1 text-gray-600">
					<Star class="h-4 w-4 text-yellow-500 fill-current" />
					<span>{trustMetrics.avgRating} Rating</span>
				</div>
				<div class="flex items-center gap-1 text-gray-600">
					<Package class="h-4 w-4 text-blue-600" />
					<span>Fast Shipping</span>
				</div>
			</div>

			<!-- Simplified Search Bar -->
			<div class="relative max-w-2xl mx-auto">
				<div class={cn(
					"relative bg-white rounded-full shadow-lg border-2 transition-all duration-200",
					isFocused ? "border-blue-500 shadow-xl" : "border-gray-200"
				)}>
					<div class="flex items-center px-4 md:px-6 h-14 md:h-16">
						<Search class="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
						
						<input
							bind:this={searchInputRef}
							type="search"
							placeholder="Search for designer bags, Nike shoes, vintage jeans..."
							bind:value={searchQuery}
							onfocus={() => isFocused = true}
							onblur={() => setTimeout(() => isFocused = false, 150)}
							onkeydown={handleKeydown}
							oninput={handleInput}
							class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-base md:text-lg placeholder:text-gray-400"
							autocomplete="off"
							aria-label="Search products"
						/>
						
						<button
							onclick={handleSearch}
							disabled={isSearching || !searchQuery.trim()}
							class={cn(
								"px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold transition-all duration-200",
								"bg-gradient-to-r from-blue-600 to-blue-500 text-white",
								"hover:from-blue-700 hover:to-blue-600",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							)}
							aria-label="Search"
						>
							{isSearching ? 'Searching...' : 'Search'}
						</button>
					</div>
				</div>

				<!-- Auto-complete Dropdown -->
				{#if showSuggestions && suggestions.length > 0}
					<div class="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-50">
						<ul role="listbox" class="py-2">
							{#each suggestions as suggestion}
								<li role="option">
									<button
										onclick={() => selectSuggestion(suggestion)}
										class="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
									>
										<Search class="h-4 w-4 text-gray-400" />
										<span class="text-gray-700">{suggestion}</span>
										<TrendingUp class="h-3 w-3 text-red-500 ml-auto" />
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<!-- Main Categories - Clean Grid -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 max-w-2xl mx-auto">
				{#each mainCategories as category}
					<button
						onclick={() => handleCategoryClick(category.slug)}
						class="py-3 px-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
					>
						<div class="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
							{category.name}
						</div>
					</button>
				{/each}
			</div>

			<!-- Trending Searches - Subtle -->
			<div class="mt-6 text-center">
				<div class="flex items-center justify-center gap-2 flex-wrap">
					<span class="text-xs text-gray-500">Trending:</span>
					{#each trendingSearches.slice(0, 3) as term}
						<button
							onclick={() => handleTrendingClick(term)}
							class="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
						>
							{term}
						</button>
					{/each}
				</div>
			</div>

		</div>
	</div>
</section>