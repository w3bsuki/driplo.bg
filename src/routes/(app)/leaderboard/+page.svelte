<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let activeTab = $state<'personal' | 'brands' | 'reviews'>('personal');
	let timePeriod = $state<'week' | 'month' | 'year' | 'all'>(data.initialTimePeriod || 'month');
	
	// Query for top personal sellers
	const personalSellersQuery = createQuery({
		queryKey: ['top-sellers', timePeriod],
		queryFn: async () => {
			if (timePeriod === data.initialTimePeriod) {
				return data.topSellers;
			}
			// Fetch new data when time period changes
			const { data: sellers, error } = await data.supabase.rpc('get_top_sellers', {
				time_period: timePeriod,
				result_limit: 20
			});
			if (error) throw error;
			return sellers || [];
		},
		initialData: data.topSellers
	});
	
	// Query for top brands
	const brandsQuery = createQuery({
		queryKey: ['top-brands', timePeriod],
		queryFn: async () => {
			if (timePeriod === data.initialTimePeriod) {
				return data.topBrands;
			}
			// Fetch new data when time period changes
			const { data: brands, error } = await data.supabase.rpc('get_top_brands', {
				time_period: timePeriod,
				result_limit: 20
			});
			if (error) throw error;
			return brands || [];
		},
		initialData: data.topBrands
	});
	
	// Query for recent reviews
	const reviewsQuery = createQuery({
		queryKey: ['recent-reviews', timePeriod],
		queryFn: async () => {
			if (timePeriod === data.initialTimePeriod) {
				return data.recentReviews;
			}
			// Fetch new data when time period changes
			const { data: reviews, error } = await data.supabase.rpc('get_recent_reviews', {
				time_period: timePeriod,
				page: 1,
				page_size: 20
			});
			if (error) throw error;
			return reviews || [];
		},
		initialData: data.recentReviews
	});
	
	function getRankBadgeClass(rank: number) {
		if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/25';
		if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-lg shadow-gray-400/25';
		if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25';
		return 'bg-gray-100 text-gray-700';
	}
	
	function getRankEmoji(rank: number) {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return '';
	}
	
	function formatNumber(num: number) {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}
	
	function getMovementIndicator(index: number, previousIndex?: number) {
		if (!previousIndex) return { icon: '—', class: 'text-gray-400' };
		if (index < previousIndex) return { icon: '↑', class: 'text-green-500' };
		if (index > previousIndex) return { icon: '↓', class: 'text-red-500' };
		return { icon: '—', class: 'text-gray-400' };
	}
</script>

<div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
	<!-- Page Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">{m.nav_sellers()}</h1>
		<p class="text-gray-600 mt-1">Discover top-rated sellers and brands on our platform</p>
	</div>
	<!-- Tabs -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
		<div class="flex gap-1">
			<button
				onclick={() => activeTab = 'personal'}
				class="flex-1 px-4 py-3 rounded-lg font-medium transition-all {activeTab === 'personal' 
					? 'bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] text-white shadow-sm' 
					: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
			>
				👤 Personal Sellers
			</button>
			<button
				onclick={() => activeTab = 'brands'}
				class="flex-1 px-4 py-3 rounded-lg font-medium transition-all {activeTab === 'brands' 
					? 'bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] text-white shadow-sm' 
					: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
			>
				🏢 Brands
			</button>
			<button
				onclick={() => activeTab = 'reviews'}
				class="flex-1 px-4 py-3 rounded-lg font-medium transition-all {activeTab === 'reviews' 
					? 'bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] text-white shadow-sm' 
					: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
			>
				⭐ Top Reviews
			</button>
		</div>
	</div>
	
	<!-- Time Period Filter -->
	<div class="flex gap-2 justify-center">
		{#each [
			{ value: 'week', label: 'This Week' },
			{ value: 'month', label: 'This Month' },
			{ value: 'year', label: 'This Year' },
			{ value: 'all', label: 'All Time' }
		] as period (period.value)}
			<button
				onclick={() => timePeriod = period.value}
				class="px-4 py-2 rounded-lg text-sm font-medium transition-all {timePeriod === period.value
					? 'bg-[#87CEEB]/20 text-[#4F9FC5] border border-[#87CEEB]'
					: 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}"
			>
				{period.label}
			</button>
		{/each}
	</div>
	
	<!-- Personal Sellers Tab -->
	{#if activeTab === 'personal'}
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="p-6 border-b border-gray-100">
				<h2 class="text-xl font-bold text-gray-900">🏆 Top Personal Sellers</h2>
				<p class="text-sm text-gray-500 mt-1">Individual sellers ranked by performance</p>
			</div>
			
			{#if $personalSellersQuery.isLoading}
				<div class="p-8 text-center text-gray-500">Loading...</div>
			{:else if $personalSellersQuery.error}
				<div class="p-8 text-center text-red-500">Error loading sellers</div>
			{:else if $personalSellersQuery.data}
				<div class="divide-y divide-gray-100">
					{#each $personalSellersQuery.data as seller, index (seller.user_id || seller.username)}
						{@const movement = getMovementIndicator(index)}
						<a 
							href="/profile/{seller.username}"
							class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
						>
							<!-- Rank -->
							<div class="flex items-center gap-2 min-w-[80px]">
								<div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeClass(index + 1)}`}>
									{getRankEmoji(index + 1) || index + 1}
								</div>
								<span class={`text-sm font-medium ${movement.class}`}>{movement.icon}</span>
							</div>
							
							<!-- Avatar -->
							<img 
								src={seller.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${seller.username}`} 
								alt={seller.full_name || seller.username}
								class="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
							/>
							
							<!-- Info -->
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-gray-900">{seller.full_name || seller.username}</h3>
									<span class="text-sm text-gray-500">@{seller.username}</span>
								</div>
								<div class="flex items-center gap-4 text-sm text-gray-500 mt-1">
									<span>💰 {formatNumber(seller.total_sales)} sales</span>
									<span>⭐ {seller.average_rating.toFixed(1)} ({seller.rating_count})</span>
									<span class="text-green-600 font-medium">${formatNumber(seller.total_revenue)}</span>
								</div>
							</div>
							
							<!-- Action -->
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- Brands Tab -->
	{#if activeTab === 'brands'}
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="p-6 border-b border-gray-100">
				<h2 class="text-xl font-bold text-gray-900">🏢 Top Brand Accounts</h2>
				<p class="text-sm text-gray-500 mt-1">Verified brands and startups on the platform</p>
			</div>
			
			{#if $brandsQuery.isLoading}
				<div class="p-8 text-center text-gray-500">Loading...</div>
			{:else if $brandsQuery.error}
				<div class="p-8 text-center text-red-500">Error loading brands</div>
			{:else if $brandsQuery.data}
				<div class="divide-y divide-gray-100">
					{#each $brandsQuery.data as brand, index (brand.brand_id || brand.brand_slug)}
						{@const movement = getMovementIndicator(index)}
						<a 
							href="/brands/{brand.brand_slug}"
							class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
						>
							<!-- Rank -->
							<div class="flex items-center gap-2 min-w-[80px]">
								<div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeClass(index + 1)}`}>
									{getRankEmoji(index + 1) || index + 1}
								</div>
								<span class={`text-sm font-medium ${movement.class}`}>{movement.icon}</span>
							</div>
							
							<!-- Logo -->
							<div class="relative">
								<img 
									src={brand.brand_logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${brand.brand_name}`} 
									alt={brand.brand_name}
									class="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
								/>
								{#if brand.verification_status === 'verified'}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</div>
							
							<!-- Info -->
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-gray-900">{brand.brand_name}</h3>
									{#if brand.verification_status === 'verified'}
										<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Verified</span>
									{/if}
								</div>
								<div class="flex items-center gap-4 text-sm text-gray-500 mt-1">
									<span>💰 {formatNumber(brand.total_sales)} sales</span>
									<span>⭐ {brand.average_rating.toFixed(1)} ({brand.rating_count})</span>
									<span class="text-green-600 font-medium">${formatNumber(brand.total_revenue)}</span>
								</div>
							</div>
							
							<!-- Action -->
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- Reviews Tab -->
	{#if activeTab === 'reviews'}
		<div class="space-y-4">
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-1">⭐ Recent Top Reviews</h2>
				<p class="text-sm text-gray-500">High-rated reviews from verified purchases</p>
			</div>
			
			{#if $reviewsQuery.isLoading}
				<div class="bg-white rounded-xl p-8 text-center text-gray-500">Loading reviews...</div>
			{:else if $reviewsQuery.error}
				<div class="bg-white rounded-xl p-8 text-center text-red-500">Error loading reviews</div>
			{:else if $reviewsQuery.data}
				<div class="space-y-4">
					{#each $reviewsQuery.data as review (review.review_id || review.created_at)}
						<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
							<!-- Review Header -->
							<div class="flex items-start justify-between mb-4">
								<div class="flex items-center gap-3">
									<img 
										src={review.rater_avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${review.rater_username}`}
										alt={review.rater_full_name || review.rater_username}
										class="w-10 h-10 rounded-full"
									/>
									<div>
										<div class="font-medium text-gray-900">{review.rater_full_name || review.rater_username}</div>
										<div class="text-sm text-gray-500">
											Reviewed 
											<a href="/profile/{review.rated_username}" class="text-[#4F9FC5] hover:underline">
												{review.is_brand && review.brand_name ? review.brand_name : (review.rated_full_name || review.rated_username)}
											</a>
										</div>
									</div>
								</div>
								<div class="flex items-center gap-1">
									{#each Array(5) as _, i (i)}
										<svg class="w-5 h-5 {i < review.rating ? 'text-yellow-400' : 'text-gray-200'}" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									{/each}
								</div>
							</div>
							
							<!-- Review Content -->
							<p class="text-gray-700 mb-3">{review.comment}</p>
							
							<!-- Product Info -->
							{#if review.listing_title}
								<div class="flex items-center justify-between pt-3 border-t border-gray-100">
									<div class="text-sm text-gray-500">
										Product: <span class="font-medium text-gray-700">{review.listing_title}</span>
									</div>
									<div class="text-sm text-gray-500">
										${review.listing_price}
									</div>
								</div>
							{/if}
							
							<!-- Review Date -->
							<div class="text-xs text-gray-400 mt-3">
								{new Date(review.created_at).toLocaleDateString('en-US', { 
									month: 'short', 
									day: 'numeric', 
									year: 'numeric' 
								})}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>