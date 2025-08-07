<script lang="ts">
	import { ChevronLeft, ChevronRight, Star } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Seller {
		id: string;
		username: string;
		avatar: string;
		sales: number;
		rating: number;
	}
	
	interface Props {
		sellers?: Seller[];
		onSellerClick?: (username: string) => void;
	}
	
	let { 
		sellers = [
			{ id: '1', username: 'vintage_lover', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', sales: 342, rating: 4.9 },
			{ id: '2', username: 'streetwear_king', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', sales: 287, rating: 4.8 },
			{ id: '3', username: 'luxury_finds', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', sales: 523, rating: 5.0 },
			{ id: '4', username: 'eco_fashion', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', sales: 198, rating: 4.7 },
			{ id: '5', username: 'trendy_closet', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', sales: 412, rating: 4.9 }
		],
		onSellerClick = (username: string) => {}
	}: Props = $props();
	
	let currentIndex = $state(0);
	
	const visibleSellers = $derived(() => {
		const result = [];
		for (let i = 0; i < 3; i++) {
			result.push(sellers[(currentIndex + i) % sellers.length]);
		}
		return result;
	});
	
	function next() {
		currentIndex = (currentIndex + 3) % sellers.length;
	}
	
	function prev() {
		currentIndex = (currentIndex - 3 + sellers.length) % sellers.length;
	}
	
	onMount(() => {
		const interval = setInterval(next, 7000); // Slower timing
		return () => clearInterval(interval);
	});
</script>

<div class="mb-8">
	<div class="text-center mb-6">
		<div class="flex items-center justify-center gap-2 mb-2">
			<Star class="h-5 w-5 text-yellow-500 fill-current" />
			<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
				{m.home_top_sellers_title()}
			</h1>
			<Star class="h-5 w-5 text-yellow-500 fill-current" />
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
					onclick={() => onSellerClick(seller.username)}
					class="group cursor-pointer w-20 sm:w-24 md:w-28 flex-shrink-0"
					in:fade={{ duration: 500 }}
				>
					<div class="flex flex-col items-center">
						<div class="relative mb-2">
							<img
								src={seller.avatar}
								alt={seller.username}
								class="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-200"
							/>
							<div class="absolute -bottom-1 -right-1 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm" style="background-color: oklch(27% 0.12 256);">
								★{seller.rating}
							</div>
						</div>
						<div class="text-center w-full">
							<p class="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate px-1">
								@{seller.username}
							</p>
							<p class="text-[11px] md:text-xs text-gray-500">
								{seller.sales} sales
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