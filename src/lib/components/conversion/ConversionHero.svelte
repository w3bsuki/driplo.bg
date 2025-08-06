<script lang="ts">
	import { Search, TrendingUp, Star, Users } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import TrustSignals from './TrustSignals.svelte';
	
	interface Props {
		className?: string;
	}
	
	let { className }: Props = $props();
	
	// ✅ CORRECT: Use $state() for reactive state
	let searchQuery = $state('');
	let isSearchFocused = $state(false);
	let isLoading = $state(false);
	
	// Conversion-focused trending searches
	const trendingSearches = [
		{ text: "Designer bags", popular: true },
		{ text: "Nike trainers", popular: false },
		{ text: "Vintage denim", popular: true },
		{ text: "Zara dresses", popular: false }
	];
	
	// ✅ CORRECT: Modern event handlers
	const debouncedSearch = debounce(() => {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
		isLoading = false;
	}, 300);
	
	function handleSearch() {
		isLoading = true;
		debouncedSearch();
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSearch();
		}
	}
	
	function handleTrendingClick(searchTerm: string) {
		searchQuery = searchTerm;
		handleSearch();
	}
	
	function handleFocus() {
		isSearchFocused = true;
	}
	
	function handleBlur() {
		setTimeout(() => {
			isSearchFocused = false;
		}, 150);
	}
</script>

<section class={cn("relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 md:py-12", className)}>
	<div class="container mx-auto px-4 max-w-4xl">
		<!-- Main Hero Content -->
		<div class="text-center space-y-6">
			<!-- Headline with Social Proof -->
			<div class="space-y-3">
				<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
					Find Designer Fashion 
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
						Up to 70% Off
					</span>
				</h1>
				<p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
					Join <span class="font-semibold text-blue-600">50,000+ fashion lovers</span> buying and selling pre-loved designer items
				</p>
			</div>
			
			<!-- Search Bar - Conversion Optimized -->
			<div class="relative max-w-2xl mx-auto">
				<div class={cn(
					"relative bg-white rounded-2xl border-2 shadow-lg transition-all duration-300",
					isSearchFocused ? "border-blue-500 shadow-2xl scale-105" : "border-gray-200 hover:border-gray-300"
				)}>
					<div class="flex items-center h-14 md:h-16">
						<div class="pl-4 md:pl-6">
							<Search class="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
						</div>
						<input
							type="search"
							placeholder="Search for brands, items, or styles..."
							bind:value={searchQuery}
							onfocus={handleFocus}
							onblur={handleBlur}
							onkeydown={handleKeydown}
							class="flex-1 px-4 py-4 md:py-5 text-base md:text-lg border-0 focus:ring-0 focus:outline-none bg-transparent placeholder:text-gray-400"
							autocomplete="off"
						/>
						<button
							onclick={handleSearch}
							disabled={isLoading}
							class="mr-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 hover:shadow-lg transform hover:scale-105"
						>
							{#if isLoading}
								<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							{:else}
								Search
							{/if}
						</button>
					</div>
				</div>
				
				<!-- Trending Searches - Conversion Focused -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-3">
					<span class="text-sm text-gray-500 font-medium">Trending:</span>
					{#each trendingSearches as trend}
						<button
							onclick={() => handleTrendingClick(trend.text)}
							class={cn(
								"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105",
								trend.popular 
									? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200 hover:from-amber-200 hover:to-yellow-200" 
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							)}
						>
							{#if trend.popular}
								<TrendingUp class="h-3 w-3" />
							{/if}
							{trend.text}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Trust Signals -->
			<div class="mt-8">
				<TrustSignals variant="compact" className="justify-center" />
			</div>
		</div>
		
		<!-- Stats Row for Social Proof -->
		<div class="mt-12 grid grid-cols-3 gap-6 text-center">
			<div class="space-y-1">
				<div class="flex items-center justify-center gap-1">
					<Star class="h-5 w-5 text-yellow-500 fill-current" />
					<span class="text-2xl md:text-3xl font-bold text-gray-900">4.8</span>
				</div>
				<p class="text-sm text-gray-600">Buyer Rating</p>
			</div>
			<div class="space-y-1">
				<div class="flex items-center justify-center gap-1">
					<Users class="h-5 w-5 text-blue-500" />
					<span class="text-2xl md:text-3xl font-bold text-gray-900">50K+</span>
				</div>
				<p class="text-sm text-gray-600">Happy Customers</p>
			</div>
			<div class="space-y-1">
				<div class="flex items-center justify-center gap-1">
					<TrendingUp class="h-5 w-5 text-green-500" />
					<span class="text-2xl md:text-3xl font-bold text-gray-900">2M+</span>
				</div>
				<p class="text-sm text-gray-600">Items Sold</p>
			</div>
		</div>
	</div>
</section>