<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Profile } from '$lib/types/unified';
	import SellerQuickView from './SellerQuickView.svelte';

	interface Props {
		sellers: Profile[];
	}

	let { sellers = [] }: Props = $props();

	let selectedSeller = $state<Profile | null>(null);
	let showQuickView = $state(false);
	let currentIndex = $state(0);
	
	const visibleCount = 5; // Show 5 avatars at once
	const canScrollLeft = $derived(currentIndex > 0);
	const canScrollRight = $derived(currentIndex < sellers.length - visibleCount);
	
	function scrollLeft() {
		if (canScrollLeft) {
			currentIndex = Math.max(0, currentIndex - 1);
		}
	}
	
	function scrollRight() {
		if (canScrollRight) {
			currentIndex = Math.min(sellers.length - visibleCount, currentIndex + 1);
		}
	}

	function handleSellerClick(seller: Profile) {
		selectedSeller = seller;
		showQuickView = true;
	}

	// Show exactly 5 avatars
	const visibleSellers = $derived(sellers.slice(currentIndex, currentIndex + visibleCount));
</script>

<!-- Top Sellers Static with Chevrons -->
{#if sellers.length > 0}
<div class="bg-gray-50/50 border-b border-gray-100 py-2.5">
	<div class="container px-4">
		<div class="flex items-center justify-center gap-3">
			<!-- Left Chevron -->
			<button
				onclick={scrollLeft}
				disabled={!canScrollLeft}
				class="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 {canScrollLeft ? 'hover:bg-gray-50 hover:shadow cursor-pointer' : 'opacity-40 cursor-not-allowed'}"
				aria-label="View previous sellers"
			>
				<ChevronLeft class="h-3 w-3 text-gray-600" />
			</button>

			<!-- Sellers Container -->
			<div class="flex items-center justify-center gap-3 transition-all duration-300">
				{#each visibleSellers as seller (seller.id)}
					<button
						onclick={() => handleSellerClick(seller)}
						class="group relative cursor-pointer flex-shrink-0"
						aria-label="View {seller.username}'s profile"
					>
						<!-- Avatar with enhanced hover effect -->
						<div class="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-gray-200 shadow-sm group-hover:ring-2 group-hover:ring-blue-400 group-hover:shadow group-active:scale-95 transition-all duration-200">
							{#if seller.avatar_url}
								<img
									src={seller.avatar_url}
									alt={seller.username}
									class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								/>
							{:else}
								<div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
									{seller.username?.slice(0, 2).toUpperCase() || '??'}
								</div>
							{/if}
							
							<!-- Click indicator overlay -->
							<div class="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
								<div class="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
									<span class="text-blue-600 font-bold text-xs">👁</span>
								</div>
							</div>
						</div>

						<!-- Enhanced tooltip with click hint -->
						<div class="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-lg">
							<div class="text-center">
								<div class="font-medium">{seller.username}</div>
								<div class="flex items-center justify-center gap-1 mt-0.5">
									{#if seller.seller_rating}
										<span class="text-yellow-400">★{seller.seller_rating}</span>
									{/if}
									<span class="text-gray-300">• Click to view</span>
								</div>
							</div>
							<!-- Tooltip arrow -->
							<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Right Chevron -->
			<button
				onclick={scrollRight}
				disabled={!canScrollRight}
				class="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 {canScrollRight ? 'hover:bg-gray-50 hover:shadow cursor-pointer' : 'opacity-40 cursor-not-allowed'}"
				aria-label="View more sellers"
			>
				<ChevronRight class="h-3 w-3 text-gray-600" />
			</button>
		</div>
	</div>
</div>

<!-- Seller Quick View Dialog -->
{#if selectedSeller && showQuickView}
	<SellerQuickView
		seller={selectedSeller}
		open={showQuickView}
		onClose={() => {
			showQuickView = false;
			selectedSeller = null;
		}}
	/>
{/if}
{/if}