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
	
	// Use real sellers or show fallback sellers if empty
	const displaySellers = sellers.length > 0 ? sellers : [
		{
			id: 'fallback-1',
			username: 'w3bsuki',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=w3bsuki',
			seller_rating: 5.0,
			total_sales: 999
		},
		{
			id: 'fallback-2', 
			username: 'topSeller',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=topSeller',
			seller_rating: 4.9,
			total_sales: 850
		},
		{
			id: 'fallback-3',
			username: 'fashionista',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fashionista', 
			seller_rating: 4.8,
			total_sales: 720
		}
	];
</script>

<!-- Simple horizontal scroll of seller avatars -->
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