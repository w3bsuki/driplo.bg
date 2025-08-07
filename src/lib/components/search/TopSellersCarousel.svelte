<script lang="ts">
	import { ChevronLeft, ChevronRight, Star } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SellerQuickView from './SellerQuickView.svelte';
	
	interface Seller {
		id: string;
		username: string;
		avatar_url?: string;
		total_sales?: number;
		seller_rating?: number;
		buyer_rating_count?: number;
		bio?: string;
		location?: string;
		follower_count?: number;
	}
	
	interface Props {
		sellers?: Seller[];
		onSellerClick?: (username: string) => void;
	}
	
	// Default/fallback sellers for when we don't have enough real users
	const defaultSellers: Seller[] = [
		{ id: '1', username: 'w3bsuki', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=w3bsuki', total_sales: 150, seller_rating: 4.8, bio: 'Premium fashion curator', location: 'Sofia' },
		{ id: '2', username: 'w3bsuki', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=w3bsuki', total_sales: 150, seller_rating: 4.8, bio: 'Premium fashion curator', location: 'Sofia' },
		{ id: '3', username: 'w3bsuki', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=w3bsuki', total_sales: 150, seller_rating: 4.8, bio: 'Premium fashion curator', location: 'Sofia' }
	];

	let { 
		sellers = [],
		onSellerClick = (username: string) => {}
	}: Props = $props();
	
	// For now, always use the w3bsuki account 3 times to see the layout
	const displaySellers = $derived(defaultSellers);
	
	let currentIndex = $state(0);
	let selectedSeller = $state<Seller | null>(null);
	let showQuickView = $state(false);
	
	const visibleSellers = $derived(() => {
		if (!displaySellers || displaySellers.length === 0) return [];
		const result = [];
		const displayCount = Math.min(3, displaySellers.length);
		for (let i = 0; i < displayCount; i++) {
			result.push(displaySellers[(currentIndex + i) % displaySellers.length]);
		}
		return result;
	});
	
	function next() {
		currentIndex = (currentIndex + 3) % displaySellers.length;
	}
	
	function prev() {
		currentIndex = (currentIndex - 3 + displaySellers.length) % displaySellers.length;
	}
	
	onMount(() => {
		if (displaySellers && displaySellers.length > 3) {
			const interval = setInterval(next, 7000); // Slower timing
			return () => clearInterval(interval);
		}
	});
</script>

{#if displaySellers && displaySellers.length > 0}
<div class="mb-8">
	<div class="text-center mb-6">
		<div class="flex items-center justify-center gap-2 mb-1">
			<Star class="h-4 w-4 text-yellow-500 fill-current" />
			<h1 class="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">
				{m.home_top_sellers_title()}
			</h1>
			<Star class="h-4 w-4 text-yellow-500 fill-current" />
		</div>
		<p class="text-sm text-gray-600">{m.home_top_sellers_description()}</p>
	</div>
	
	<div class="flex items-center justify-center gap-4">
		<button
			onclick={prev}
			class="p-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
			aria-label="Previous sellers"
		>
			<ChevronLeft class="h-4 w-4 text-gray-600" />
		</button>
		
		<div class="flex items-center gap-3 sm:gap-4 md:gap-6">
			{#each visibleSellers() as seller (seller.id)}
				<button
					onclick={() => {
						selectedSeller = seller;
						showQuickView = true;
					}}
					class="group cursor-pointer w-20 sm:w-24 md:w-28 flex-shrink-0"
					in:fade={{ duration: 500 }}
				>
					<div class="flex flex-col items-center">
						<div class="relative mb-2">
							<img
								src={seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.username)}&background=random`}
								alt={seller.username}
								class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-200"
							/>
							{#if seller.seller_rating && seller.seller_rating > 0}
								<div class="absolute -bottom-1 -right-1 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm" style="background-color: oklch(27% 0.12 256);">
									★{seller.seller_rating.toFixed(1)}
								</div>
							{/if}
						</div>
						<div class="text-center w-full">
							<p class="text-xs md:text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors truncate px-1">
								@{seller.username}
							</p>
							<p class="text-[10px] md:text-xs text-gray-500 font-normal">
								{seller.total_sales || 0} sales
							</p>
						</div>
					</div>
				</button>
			{/each}
		</div>
		
		<button
			onclick={next}
			class="p-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
			aria-label="Next sellers"
		>
			<ChevronRight class="h-4 w-4 text-gray-600" />
		</button>
	</div>
</div>
{/if}

<SellerQuickView 
	seller={selectedSeller}
	isOpen={showQuickView}
	onClose={() => {
		showQuickView = false;
		selectedSeller = null;
	}}
/>