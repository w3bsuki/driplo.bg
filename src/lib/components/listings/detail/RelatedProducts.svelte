<script lang="ts">
	import ProductCard from '$lib/components/listings/ProductCard.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	
	let { relatedListings = [] } = $props();
	let scrollContainer = $state<HTMLDivElement>();
	let showLeftButton = $state(false);
	let showRightButton = $state(true);
	
	function scrollLeft() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
		}
	}
	
	function scrollRight() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
		}
	}
	
	function checkScrollButtons() {
		if (scrollContainer) {
			showLeftButton = scrollContainer.scrollLeft > 0;
			showRightButton = scrollContainer.scrollLeft < 
				scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
		}
	}
</script>

{#if relatedListings && relatedListings.length > 0}
	<div class="mt-8 relative">
		<h3 class="text-base font-semibold mb-3">Similar Items</h3>
		
		<!-- Scroll Container -->
		<div class="relative">
			<!-- Left scroll button -->
			{#if showLeftButton}
				<Button
					onclick={scrollLeft}
					variant="outline"
					size="icon"
					class="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 shadow-md hidden md:flex"
				>
					<ChevronLeft class="h-4 w-4" />
				</Button>
			{/if}
			
			<!-- Horizontal scroll container -->
			<div 
				bind:this={scrollContainer}
				onscroll={checkScrollButtons}
				class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
				style="scrollbar-width: none; -ms-overflow-style: none;"
			>
				{#each relatedListings as relatedListing (relatedListing.id)}
					<div class="flex-none w-[45%] sm:w-[200px] md:w-[220px]">
						<ProductCard {...relatedListing} />
					</div>
				{/each}
			</div>
			
			<!-- Right scroll button -->
			{#if showRightButton}
				<Button
					onclick={scrollRight}
					variant="outline"
					size="icon"
					class="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 shadow-md hidden md:flex"
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</div>
{/if}

<style lang="postcss">
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
</style>