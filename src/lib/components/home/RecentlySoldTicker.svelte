<script lang="ts">
	import { TrendingUp, Package } from 'lucide-svelte';
	import { onMount } from 'svelte';

	// Mock data - in production, this would come from real-time API
	const recentSales = [
		{ item: 'Gucci Bag', location: 'London', time: '2 minutes ago', price: '£450' },
		{ item: 'Nike Air Max', location: 'Manchester', time: '5 minutes ago', price: '£85' },
		{ item: 'Zara Dress', location: 'Birmingham', time: '8 minutes ago', price: '£35' },
		{ item: 'Louis Vuitton Wallet', location: 'Leeds', time: '12 minutes ago', price: '£280' },
		{ item: 'Adidas Hoodie', location: 'Glasgow', time: '15 minutes ago', price: '£45' },
		{ item: 'Prada Sunglasses', location: 'Bristol', time: '18 minutes ago', price: '£195' },
		{ item: 'Vintage Levi\'s', location: 'Edinburgh', time: '22 minutes ago', price: '£65' },
		{ item: 'Balenciaga Sneakers', location: 'Cardiff', time: '25 minutes ago', price: '£520' }
	];

	let currentIndex = $state(0);
	let isVisible = $state(true);

	const currentSale = $derived(recentSales[currentIndex]);

	onMount(() => {
		// Rotate through sales every 4 seconds
		const interval = setInterval(() => {
			isVisible = false;
			setTimeout(() => {
				currentIndex = (currentIndex + 1) % recentSales.length;
				isVisible = true;
			}, 300);
		}, 4000);

		return () => clearInterval(interval);
	});
</script>

<div class="relative bg-gradient-to-r from-green-50 to-blue-50 border-y border-gray-200" style="z-index: 1;">
	<div class="container px-4 py-2">
		<div class="flex items-center justify-center gap-2 md:gap-3 text-sm whitespace-nowrap overflow-hidden">
			<div class="flex items-center gap-1 md:gap-1.5 text-green-600 flex-shrink-0">
				<Package class="h-4 w-4" />
				<span class="font-semibold text-xs md:text-sm">Just Sold!</span>
			</div>
			
			<div class="flex items-center gap-1 md:gap-2 transition-all duration-300 min-w-0 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}">
				<span class="font-medium text-gray-900 truncate text-xs md:text-sm">{currentSale.item}</span>
				<span class="text-gray-500 text-xs md:text-sm flex-shrink-0">in</span>
				<span class="text-gray-700 text-xs md:text-sm flex-shrink-0">{currentSale.location}</span>
				<span class="text-gray-500 text-xs md:text-sm flex-shrink-0">•</span>
				<span class="text-gray-600 text-xs md:text-sm flex-shrink-0">{currentSale.time}</span>
				<span class="font-semibold text-green-600 text-xs md:text-sm flex-shrink-0">{currentSale.price}</span>
			</div>
			
			<div class="hidden lg:flex items-center gap-1 text-orange-600 flex-shrink-0">
				<TrendingUp class="h-4 w-4" />
				<span class="text-xs">High demand</span>
			</div>
		</div>
	</div>
</div>