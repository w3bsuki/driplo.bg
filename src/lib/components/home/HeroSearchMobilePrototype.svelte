<!-- Mobile Hero Search Prototype - For Discussion Only -->
<script lang="ts">
	import { Search, ChevronDown, Menu } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	// Prototype states
	let isSticky = $state(false);
	let showMobileCategories = $state(false);
	let scrollY = $state(0);
	
	// Simulate scroll behavior
	$effect(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
			isSticky = scrollY > 100;
		};
		
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<!-- Mobile Prototype Container -->
<div class="mobile-prototype-wrapper">
	<!-- Initial Hero State -->
	<section class={cn(
		"hero-search-mobile bg-gradient-to-b from-blue-50 to-white py-4 transition-all duration-300",
		isSticky && "opacity-0 pointer-events-none"
	)}>
		<div class="container px-4">
			<div class="max-w-3xl mx-auto">
				<!-- Mobile Layout: Search First -->
				<div class="mobile-search-container">
					<!-- Full Width Search Bar -->
					<div class="relative bg-white rounded-2xl shadow-lg border border-blue-100 mb-3">
						<div class="flex items-center">
							<input
								type="search"
								placeholder="Search for Nike, Zara, vintage..."
								class="flex-1 py-4 px-4 text-base placeholder:text-gray-400 focus:outline-none"
							/>
							<button class="p-3 mr-1 text-gray-400 hover:text-blue-400">
								<Search class="h-5 w-5" />
							</button>
						</div>
					</div>
					
					<!-- Categories & Quick Filters Row -->
					<div class="flex items-center gap-2 overflow-x-auto pb-2">
						<!-- Categories Button - Same beloved design -->
						<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 whitespace-nowrap">
							<span>Categories</span>
							<ChevronDown class="h-4 w-4" />
						</button>
						
						<!-- Quick Filters -->
						<button class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white text-sm whitespace-nowrap">
							<span>✨</span> New
						</button>
						<button class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white text-sm whitespace-nowrap">
							<span>💸</span> Sale
						</button>
						<button class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white text-sm whitespace-nowrap">
							<span>🔥</span> Hot
						</button>
					</div>
					
					<!-- Trending Categories -->
					<div class="flex gap-2 overflow-x-auto mt-2">
						{#each ['👟 Shoes', '👕 T-shirts', '👗 Dresses', '👜 Bags', '🧥 Jackets'] as category}
							<button class="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm whitespace-nowrap">
								{category}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>
	
	<!-- Sticky Header State -->
	{#if isSticky}
		<div class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md animate-slide-down">
			<div class="container px-4 py-2">
				<div class="flex items-center gap-2">
					<!-- Mini Categories Icon -->
					<button 
						onclick={() => showMobileCategories = !showMobileCategories}
						class="p-2 rounded-lg bg-blue-50 text-blue-600"
					>
						<Menu class="h-5 w-5" />
					</button>
					
					<!-- Expanded Search -->
					<div class="flex-1 bg-gray-50 rounded-xl border border-gray-200">
						<div class="flex items-center">
							<input
								type="search"
								placeholder="Search anything..."
								class="flex-1 py-3 px-4 text-base bg-transparent placeholder:text-gray-400 focus:outline-none"
							/>
							<button class="p-2 mr-1 text-gray-400 hover:text-blue-400">
								<Search class="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
				
				<!-- Quick Access Pills -->
				<div class="flex gap-2 mt-2 overflow-x-auto">
					<button class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
						✨ New
					</button>
					<button class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
						💸 Sale
					</button>
					<button class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
						🔥 Hot
					</button>
				</div>
			</div>
			
			<!-- Mobile Categories Dropdown -->
			{#if showMobileCategories}
				<div class="absolute top-full left-0 right-0 bg-white shadow-lg border-t">
					<div class="p-4">
						<h3 class="font-semibold mb-3">All Categories</h3>
						<div class="grid grid-cols-2 gap-2">
							{#each ['Men', 'Women', 'Kids', 'Home', 'Sports', 'Beauty'] as cat}
								<button class="p-3 text-left rounded-lg hover:bg-gray-50">
									{cat}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Demo Content for Scrolling -->
<div class="h-screen bg-gray-50 p-4">
	<p class="text-center text-gray-500 mt-20">Scroll down to see sticky header behavior ↓</p>
</div>

<style>
	@keyframes slide-down {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.animate-slide-down {
		animation: slide-down 0.3s ease-out;
	}
	
	/* Hide scrollbars */
	.overflow-x-auto {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.overflow-x-auto::-webkit-scrollbar {
		display: none;
	}
	
	/* Mobile-first approach */
	@media (min-width: 768px) {
		.mobile-prototype-wrapper {
			display: none; /* This is mobile-only prototype */
		}
	}
</style>