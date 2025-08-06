<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	// Process sellers data from server
	const sellers = $derived(data.sellers.map((seller, index) => ({
		id: seller.id,
		rank: index + 1,
		name: seller.full_name || seller.username || 'Anonymous Seller',
		sales: Number(seller.total_sales || 0),
		rating: Number(seller.seller_rating || 0),
		avatar: seller.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${seller.username}`,
		movement: 'same', // TODO: Calculate movement based on historical data
		username: seller.username,
		earnings: Number(seller.total_earnings || 0),
		listings_count: seller.listing_count || 0,
		level: seller.seller_level || 1
	})));
	
	function getRankBadgeClass(rank: number) {
		if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
		if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
		if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white';
		return 'bg-gray-100 text-gray-700';
	}
</script>

<div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
	<!-- Page Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">{m.nav_sellers()}</h1>
		<p class="text-gray-600 mt-1">Discover top-rated sellers on our platform</p>
	</div>
	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<p class="text-sm text-gray-500">Total Sellers</p>
			<p class="text-2xl font-bold text-gray-900">{data.stats.totalSellers.toLocaleString()}</p>
		</div>
		<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<p class="text-sm text-gray-500">Active Today</p>
			<p class="text-2xl font-bold text-brand-700">{data.stats.activeToday}</p>
		</div>
		<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<p class="text-sm text-gray-500">New This Month</p>
			<p class="text-2xl font-bold text-green-600">{data.stats.newThisMonth}</p>
		</div>
		<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<p class="text-sm text-gray-500">Avg Rating</p>
			<p class="text-2xl font-bold text-amber-500">{data.stats.avgRating.toFixed(1)}⭐</p>
		</div>
	</div>
	
	<!-- Top Sellers List -->
	<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="p-6 border-b border-gray-100">
			<h2 class="text-xl font-bold text-gray-900">🏆 Top 10 Sellers This Month</h2>
		</div>
		
		<div class="divide-y divide-gray-100">
			{#each sellers as seller (seller.id)}
				<a 
					href="/profile/{seller.username}"
					class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
				>
					<!-- Rank -->
					<div class="flex items-center gap-2">
						<div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeClass(seller.rank)}`}>
							{seller.rank}
						</div>
						{#if seller.movement === 'up'}
							<span class="text-green-500 text-sm">↑</span>
						{:else if seller.movement === 'down'}
							<span class="text-red-500 text-sm">↓</span>
						{:else}
							<span class="text-gray-400 text-sm">−</span>
						{/if}
					</div>
					
					<!-- Avatar -->
					<img 
						src={seller.avatar} 
						alt={seller.name}
						class="w-12 h-12 rounded-full object-cover"
					/>
					
					<!-- Info -->
					<div class="flex-1">
						<h3 class="font-semibold text-gray-900">{seller.name}</h3>
						<div class="flex items-center gap-4 text-sm text-gray-500">
							<span>{seller.sales} sales</span>
							<span>⭐ {seller.rating}</span>
						</div>
					</div>
					
					<!-- Action -->
					<button class="text-brand-700 hover:text-brand-800 transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</a>
			{/each}
		</div>
	</div>
	
	<!-- Categories -->
	<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
		<h2 class="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
			{#each data.categories as category (category.slug)}
				<a 
					href="/{category.slug}"
					class="px-4 py-3 rounded-xl bg-gray-50 hover:bg-brand-50 hover:border-brand-500 border border-transparent transition-all text-center text-sm font-medium text-gray-700 hover:text-brand-700"
				>
					{category.name}
				</a>
			{/each}
		</div>
	</div>
</div>