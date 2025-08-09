<script lang="ts">
	import type { Profile } from '$lib/types/unified';
	import SellerQuickView from './SellerQuickView.svelte';
	
	interface Props {
		sellers: Profile[];
	}
	
	let { sellers = [] }: Props = $props();
	let selectedSeller = $state<Profile | null>(null);
	let showQuickView = $state(false);
	
	function handleSellerClick(e: MouseEvent, seller: Profile) {
		e.preventDefault();
		selectedSeller = seller;
		showQuickView = true;
	}
	
	// Use the actual sellers data from Supabase
	const displaySellers = sellers;
</script>

<!-- Simple horizontal scroll of seller avatars -->
{#if displaySellers.length > 0}
<div class="container px-4">
	<div class="overflow-x-auto py-1.5 scrollbar-hide">
		<div class="flex gap-2.5 min-w-max justify-center">
		{#each displaySellers as seller}
			<button 
				onclick={(e) => handleSellerClick(e, seller)}
				class="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer">
				<!-- Compact avatar -->
				<div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white/50">
					{#if seller.avatar_url}
						<img 
							src={seller.avatar_url} 
							alt={seller.username}
							class="w-full h-full object-cover"
						/>
					{:else}
						<div class="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
							{seller.username?.slice(0, 2).toUpperCase() || '??'}
						</div>
					{/if}
				</div>
				
				<!-- Compact info -->
				<div class="text-center">
					<div class="font-medium text-[11px] truncate max-w-[48px]">{seller.username}</div>
					<div class="text-[9px] text-gray-500">
						{seller.seller_rating?.toFixed(1) || '5.0'}★
					</div>
				</div>
			</button>
		{/each}
		</div>
	</div>
</div>
{/if}

<style>
	/* Hide scrollbar but keep functionality */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>

<!-- Seller Quick View Modal -->
<SellerQuickView 
	seller={selectedSeller}
	open={showQuickView}
	onClose={() => {
		showQuickView = false;
		selectedSeller = null;
	}}
/>