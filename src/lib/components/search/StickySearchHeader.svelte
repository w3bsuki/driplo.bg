<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	
	let searchQuery = $state('');
	let isVisible = $state(false);
	let isSearching = $state(false);
	
	function handleSearch() {
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		
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
		}
	}
	
	onMount(() => {
		const handleScroll = () => {
			// Show sticky search when user scrolls past the hero section
			isVisible = window.scrollY > 400;
		};
		
		window.addEventListener('scroll', handleScroll, { passive: true });
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if isVisible}
	<div class={cn(
		"fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-gray-200",
		"transition-all duration-300 transform",
		isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
	)}>
		<div class="container mx-auto px-4 py-3">
			<div class="max-w-2xl mx-auto">
				<div class="relative bg-white rounded-2xl shadow-sm border border-gray-200">
					<div class="flex items-center px-4 h-12">
						<Search class="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
						
						<input
							type="search"
							placeholder={m.header_search_placeholder()}
							bind:value={searchQuery}
							onkeydown={handleKeydown}
							class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-gray-400 bg-transparent"
							autocomplete="off"
							aria-label="Sticky search"
						/>
						
						{#if searchQuery}
							<button
								onclick={() => searchQuery = ''}
								class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mr-2"
								aria-label="Clear search"
							>
								<X class="h-3.5 w-3.5 text-gray-400" />
							</button>
						{/if}
						
						<button
							onclick={handleSearch}
							disabled={isSearching || (!searchQuery.trim())}
							class={cn(
								"px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200",
								"text-white",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								"focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
							)}
							style="background-color: oklch(27% 0.12 256); --hover-bg: oklch(23% 0.12 256);"
							onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
							onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'oklch(27% 0.12 256)'}
							aria-label="Search"
						>
							{isSearching ? 'Searching...' : 'Search'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}