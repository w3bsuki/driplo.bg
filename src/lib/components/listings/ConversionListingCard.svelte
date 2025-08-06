<script lang="ts">
	import { Heart, Eye, TrendingUp, Clock, Shield, Package } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { onMount } from 'svelte';
	
	// Constants
	const PRICE_CURRENCY = 'GBP';
	const PRICE_LOCALE = 'en-GB';
	
	interface Props {
		id: string;
		title: string;
		price: number;
		originalPrice?: number;
		size?: string;
		brand?: string;
		image: string | string[] | Record<string, string>;
		imageUrls?: string[] | Record<string, string>;
		seller: {
			username: string;
			avatar?: string;
			account_type?: string;
			is_verified?: boolean;
			rating?: number;
		};
		likes?: number;
		isLiked?: boolean;
		condition?: string | null;
		eagerLoading?: boolean;
		viewCount?: number;
		soldCount?: number;
		stockLevel?: number;
		lastViewed?: string;
		isHot?: boolean;
		isTrending?: boolean;
	}
	
	let { 
		id, 
		title, 
		price,
		originalPrice,
		size, 
		brand, 
		image, 
		imageUrls, 
		seller, 
		likes = 0, 
		isLiked = false, 
		condition, 
		eagerLoading = false,
		viewCount = 0,
		soldCount = 0,
		stockLevel,
		lastViewed,
		isHot = false,
		isTrending = false
	}: Props = $props();
	
	// State
	let liked = $state(isLiked);
	let likeCount = $state(likes);
	let likeLoading = $state(false);
	let imageError = $state(false);
	let showQuickView = $state(false);
	let currentViewers = $state(0);
	
	// Calculate discount percentage
	const discountPercentage = $derived(
		originalPrice && originalPrice > price 
			? Math.round(((originalPrice - price) / originalPrice) * 100)
			: 0
	);
	
	// Urgency indicators
	const urgencyLevel = $derived(() => {
		if (stockLevel && stockLevel <= 3) return 'high';
		if (viewCount > 50) return 'medium';
		if (isTrending) return 'low';
		return null;
	});
	
	// Simulate live viewers (in production, use WebSocket)
	onMount(() => {
		if (viewCount > 20) {
			currentViewers = Math.floor(Math.random() * 5) + 2;
			const interval = setInterval(() => {
				currentViewers = Math.floor(Math.random() * 5) + 2;
			}, 10000);
			return () => clearInterval(interval);
		}
	});
	
	// Helper functions
	const primaryImageUrl = $derived(() => {
		const img = imageUrls || image;
		if (!img) return null;
		if (Array.isArray(img)) return img[0];
		if (typeof img === 'object' && img !== null) return Object.values(img)[0];
		return img;
	});
	
	const formattedPrice = $derived(formatPrice(price));
	const formattedOriginalPrice = $derived(originalPrice ? formatPrice(originalPrice) : null);
	
	function formatPrice(price: number): string {
		return new Intl.NumberFormat(PRICE_LOCALE, {
			style: 'currency',
			currency: PRICE_CURRENCY,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	}

	async function handleToggleLike(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (likeLoading) return;
		
		likeLoading = true;
		
		// Optimistic update
		liked = !liked;
		likeCount = liked ? likeCount + 1 : likeCount - 1;
		
		try {
			const response = await fetch(`/api/listings/${id}/favorite`, {
				method: liked ? 'POST' : 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				// Revert on error
				liked = !liked;
				likeCount = liked ? likeCount + 1 : likeCount - 1;
			}
		} catch (error) {
			// Revert on error
			liked = !liked;
			likeCount = liked ? likeCount + 1 : likeCount - 1;
		} finally {
			likeLoading = false;
		}
	}

	function handleImageError() {
		imageError = true;
	}
</script>

<article class="relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group product-card shadow-sm hover:shadow-lg">
	<a 
		href={localizeHref(`/listings/${id}`)} 
		class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
		aria-label={m.listing_view_details({ title })}
	>
		<div class="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100">
			{#if !imageError && primaryImageUrl()}
				<img
					src={primaryImageUrl()}
					alt={title}
					class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading={eagerLoading ? 'eager' : 'lazy'}
					onerror={handleImageError}
				/>
			{:else}
				<div class="h-full w-full flex items-center justify-center bg-gray-100">
					<div class="text-center">
						<div class="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
							<Package class="h-6 w-6 text-gray-400" />
						</div>
						<p class="text-sm text-gray-500">{m.listing_no_image()}</p>
					</div>
				</div>
			{/if}
			
			<!-- Urgency Badges -->
			<div class="absolute top-2 left-2 flex flex-col gap-1">
				{#if isHot}
					<Badge class="bg-red-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
						HOT
					</Badge>
				{/if}
				{#if stockLevel && stockLevel <= 3}
					<Badge class="bg-orange-500 text-white border-0 px-2 py-0.5 text-xs font-semibold animate-pulse">
						Only {stockLevel} left!
					</Badge>
				{/if}
				{#if currentViewers > 0}
					<Badge class="bg-blue-600 text-white border-0 px-2 py-0.5 text-xs font-semibold">
						<Eye class="h-3 w-3 inline mr-1" />
						{currentViewers} viewing
					</Badge>
				{/if}
				{#if discountPercentage > 0}
					<Badge class="bg-green-600 text-white border-0 px-2 py-0.5 text-xs font-bold">
						-{discountPercentage}%
					</Badge>
				{/if}
			</div>
			
			<!-- Like Button -->
			<button
				onclick={handleToggleLike}
				class={cn(
					"absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center active:scale-95 shadow-sm",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
					likeLoading && "opacity-50 cursor-not-allowed"
				)}
				aria-label={liked ? m.listing_unlike() : m.listing_like()}
				aria-pressed={liked}
				disabled={likeLoading}
				type="button"
			>
				<Heart 
					class={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "text-gray-600")} 
				/>
			</button>
			
			<!-- Quick Action on Hover (Desktop) -->
			<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 hidden md:block">
				<button class="w-full bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
					Quick View
				</button>
			</div>
		</div>
		
		<div class="p-3 space-y-2">
			<!-- Price Section with Discount -->
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1 min-w-0">
					<h3 class="text-sm font-semibold text-gray-900 truncate leading-tight">{title}</h3>
					{#if brand}
						<p class="text-xs text-gray-600 mt-0.5">{brand} {size ? `• Size ${size}` : ''}</p>
					{/if}
				</div>
				<div class="text-right">
					<p class="text-lg font-bold text-gray-900">
						{formattedPrice}
					</p>
					{#if formattedOriginalPrice}
						<p class="text-xs text-gray-500 line-through">
							{formattedOriginalPrice}
						</p>
					{/if}
				</div>
			</div>
			
			<!-- Seller & Trust Section -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					{#if seller?.avatar}
						<img
							src={seller.avatar}
							alt=""
							class="h-4 w-4 rounded-full object-cover"
						/>
					{:else}
						<div class="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<span class="text-[10px] font-bold text-white">
								{seller?.username?.charAt(0).toUpperCase() || 'A'}
							</span>
						</div>
					{/if}
					<span class="text-xs text-gray-600 truncate max-w-[100px]">{seller?.username}</span>
					{#if seller?.is_verified}
						<Shield class="h-3 w-3 text-blue-600" />
					{/if}
					{#if seller?.rating}
						<span class="text-xs text-gray-500">
							★{seller.rating}
						</span>
					{/if}
				</div>
				
				<!-- Activity Indicators -->
				<div class="flex items-center gap-2 text-xs text-gray-500">
					{#if likeCount > 0}
						<span class="flex items-center gap-0.5">
							{likeCount}
							<Heart class="h-3 w-3 fill-current" />
						</span>
					{/if}
					{#if viewCount > 10}
						<span class="flex items-center gap-0.5">
							{viewCount}
							<Eye class="h-3 w-3" />
						</span>
					{/if}
				</div>
			</div>
			
			<!-- Urgency Text -->
			{#if urgencyLevel === 'high'}
				<p class="text-xs text-red-600 font-medium animate-pulse">
					Selling fast - {soldCount} sold recently
				</p>
			{:else if isTrending}
				<p class="text-xs text-orange-600 font-medium flex items-center gap-1">
					<TrendingUp class="h-3 w-3" />
					Trending item
				</p>
			{:else if lastViewed}
				<p class="text-xs text-gray-500">
					Last viewed {lastViewed}
				</p>
			{/if}
		</div>
	</a>
</article>