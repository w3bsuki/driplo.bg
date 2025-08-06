<script lang="ts">
	import { Search, X, TrendingUp } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { fade, fly } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}
	
	let { isOpen = false, onClose }: Props = $props();
	
	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchInputRef: HTMLInputElement;
	
	// Focus input when overlay opens
	$effect(() => {
		if (isOpen && searchInputRef) {
			setTimeout(() => searchInputRef?.focus(), 100);
		}
	});
	
	function handleSearch() {
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		onClose?.();
		
		const params = new URLSearchParams();
		params.set('q', searchQuery.trim());
		goto(`/browse?${params.toString()}`);
		
		setTimeout(() => {
			isSearching = false;
		}, 500);
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		} else if (e.key === 'Escape') {
			onClose?.();
		}
	}
	
	function handleTrendingClick(term: string) {
		searchQuery = term;
		handleSearch();
	}
	
	const trendingSearches = [
		'Vintage Levi\'s',
		'Designer bags', 
		'Nike Air Max',
		'Zara dresses'
	];
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" 
		onclick={onClose}
		transition:fade={{ duration: 200 }}
	></div>

	<!-- Search Modal -->
	<div 
		class="fixed inset-x-4 top-20 z-50 mx-auto max-w-2xl"
		transition:fly={{ y: -20, duration: 300 }}
	>
		<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
			<!-- Search Input -->
			<div class="flex items-center px-6 py-5 border-b border-gray-100">
				<Search class="h-5 w-5 text-gray-400 mr-4 flex-shrink-0" />
				
				<input
					bind:this={searchInputRef}
					type="search"
					placeholder={m.header_search_placeholder() || "Search for brands, items, or @sellers..."}
					bind:value={searchQuery}
					onkeydown={handleKeydown}
					class="flex-1 text-lg placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none bg-transparent"
					autocomplete="off"
				/>
				
				{#if searchQuery}
					<button
						onclick={() => searchQuery = ''}
						class="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
						aria-label="Clear search"
					>
						<X class="h-4 w-4 text-gray-400" />
					</button>
				{/if}
				
				<button
					onclick={onClose}
					class="p-2 hover:bg-gray-100 rounded-full transition-colors"
					aria-label="Close search"
				>
					<X class="h-5 w-5 text-gray-500" />
				</button>
			</div>
			
			<!-- Trending Searches -->
			<div class="px-6 py-4">
				<div class="flex items-center gap-2 mb-4">
					<TrendingUp class="h-4 w-4 text-gray-500" />
					<span class="text-sm font-medium text-gray-700">Trending searches</span>
				</div>
				
				<div class="flex flex-wrap gap-2">
					{#each trendingSearches as term}
						<button
							onclick={() => handleTrendingClick(term)}
							class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
						>
							{term}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Search Button -->
			{#if searchQuery.trim()}
				<div class="px-6 pb-5">
					<button
						onclick={handleSearch}
						disabled={isSearching}
						class={cn(
							"w-full py-3 rounded-2xl text-white font-semibold transition-all duration-200",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
						)}
						style="background-color: oklch(27% 0.12 256); --hover-bg: oklch(23% 0.12 256);"
						onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
						onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'oklch(27% 0.12 256)'}
					>
						{isSearching ? 'Searching...' : `Search for "${searchQuery}"`}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}