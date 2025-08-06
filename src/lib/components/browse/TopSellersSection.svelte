<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';

	let { isNavigating = false }: { isNavigating?: boolean } = $props();

	// Top sellers query - optimized to prevent hydration issues
	const topSellersQuery = createQuery({
		queryKey: ['topSellers', 'month'],
		queryFn: async () => {
			const response = await fetch('/api/sellers/top?period=month&limit=12');
			if (!response.ok) throw new Error('Failed to fetch top sellers');
			return response.json();
		},
		enabled: browser && !isNavigating, // Don't run during navigation
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false, // Prevent refetch on focus
		refetchOnMount: false, // Don't refetch on remount during navigation
	});
</script>

<!-- Drippers Ranklist Section -->
<div class="mb-3">
	{#if $topSellersQuery.isLoading}
		<!-- Loading skeleton -->
		<div class="text-center">
			<div class="h-7 w-48 bg-gray-200 rounded-sm mx-auto mb-3 animate-pulse"></div>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
				{#each Array(6) as _, index (index)}
					<div class="text-center">
						<div class="relative">
							<div class="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full animate-pulse"></div>
						</div>
						<div class="mt-2 space-y-2">
							<div class="h-4 bg-gray-200 rounded mx-auto w-20 animate-pulse"></div>
							<div class="h-3 bg-gray-200 rounded mx-auto w-16 animate-pulse"></div>
							<div class="h-3 bg-gray-200 rounded mx-auto w-14 animate-pulse"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if $topSellersQuery.error}
		<!-- Error state - silently fail, don't show section -->
	{:else if $topSellersQuery.data?.sellers && $topSellersQuery.data.sellers.length > 0}
		<div class="text-center mb-4">
			<h2 class="text-sm md:text-base font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
				<span>🔥</span>
				<span>Top Drippers</span>
				<span>🔥</span>
			</h2>
			<p class="text-xs text-gray-600">This month's hottest sellers, brands & buyers</p>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
			{#each $topSellersQuery.data.sellers.slice(0, 6) as seller, index (seller.id)}
				<a href="/profile/{seller.username}" class="text-center group relative">
					<!-- Rank Badge -->
					<div class="absolute -top-1 -left-1 z-20">
						{#if index === 0}
							<div class="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white text-xs font-bold">1</span>
							</div>
						{:else if index === 1}
							<div class="w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white text-xs font-bold">2</span>
							</div>
						{:else if index === 2}
							<div class="w-6 h-6 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white text-xs font-bold">3</span>
							</div>
						{:else}
							<div class="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white text-xs font-bold">{index + 1}</span>
							</div>
						{/if}
					</div>
					
					<!-- Crown for #1 -->
					{#if index === 0}
						<div class="absolute -top-3 -right-1 text-xl z-10 animate-pulse">👑</div>
					{/if}
					
					<div class="relative">
						<div class="relative">
							<!-- Enhanced glow effect -->
							<div class="absolute inset-0 bg-gradient-to-r {index === 0 ? 'from-yellow-400 to-yellow-600' : index === 1 ? 'from-gray-300 to-gray-500' : index === 2 ? 'from-amber-600 to-amber-700' : 'from-blue-400 to-blue-600'} rounded-full blur opacity-20 group-hover:opacity-40 transition-all duration-200"></div>
							<div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 {index === 0 ? 'ring-yellow-300' : index === 1 ? 'ring-gray-300' : index === 2 ? 'ring-amber-300' : 'ring-blue-300'} border-2 border-white group-hover:scale-105 transition-all duration-200 shadow-lg">
								{#if seller.avatar_url}
									<img src={seller.avatar_url} alt={seller.username} class="w-full h-full object-cover" />
								{:else}
									<div class="w-full h-full bg-gradient-to-br {index === 0 ? 'from-yellow-400 to-yellow-600' : index === 1 ? 'from-gray-300 to-gray-500' : index === 2 ? 'from-amber-600 to-amber-700' : 'from-blue-400 to-blue-600'} flex items-center justify-center">
										<span class="text-white font-bold text-sm md:text-base">{seller.username[0].toUpperCase()}</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
					<div class="mt-2">
						<p class="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">{seller.username}</p>
						<div class="flex items-center justify-center gap-1 text-xs text-gray-600">
							<div class="flex items-center gap-0.5">
								{#each Array(5) as _, i}
									<span class="text-xs {(seller.average_rating || 4.8) > i ? 'text-yellow-400' : 'text-gray-300'}">★</span>
								{/each}
							</div>
							<span class="font-medium">{seller.average_rating || '4.8'}</span>
						</div>
						<p class="text-xs text-gray-500 mt-0.5 font-medium">
							🔥 {seller.total_sales || 0} sales
						</p>
						{#if index < 3}
							<div class="mt-1 text-xs font-bold {index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : 'text-amber-600'}">
								{index === 0 ? '🥇 LEGEND' : index === 1 ? '🥈 ELITE' : '🥉 PRO'}
							</div>
						{:else}
							<div class="mt-1 text-xs font-medium text-blue-600">
								🔥 DRIPPER
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>