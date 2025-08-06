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
			// Show when scrolled past hero to products section (around 600px)
			isVisible = window.scrollY > 600;
		};
		
		window.addEventListener('scroll', handleScroll, { passive: true });
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if isVisible}
	<div class={cn(
		"fixed left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm",
		"transition-all duration-300 transform md:hidden",
		isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
	)} style="top: 56px;"> <!-- 56px = mobile navbar height -->
		<div class="px-4 py-2">
			<div class="relative bg-gray-50 rounded-2xl">
				<div class="flex items-center px-4 h-10">
					<Search class="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
					
					<input
						type="search"
						placeholder="Search products..."
						bind:value={searchQuery}
						onkeydown={handleKeydown}
						class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-gray-400 bg-transparent"
						autocomplete="off"
					/>
					
					{#if searchQuery}
						<button
							onclick={() => searchQuery = ''}
							class="p-1 hover:bg-gray-200 rounded-full transition-colors mr-2"
						>
							<X class="h-3 w-3 text-gray-400" />
						</button>
					{/if}
					
					<button
						onclick={handleSearch}
						disabled={isSearching || (!searchQuery.trim())}
						class={cn(
							"px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200",
							"text-white",
							"disabled:opacity-50 disabled:cursor-not-allowed"
						)}
						style="background-color: oklch(27% 0.12 256);"
					>
						{isSearching ? '...' : 'Search'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}