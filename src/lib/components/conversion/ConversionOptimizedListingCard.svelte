<script lang="ts">
	import { Heart, Eye, Star, ShoppingBag, Clock } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import UrgencyIndicator from './UrgencyIndicator.svelte';
	import TrustSignals from './TrustSignals.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { logger } from '$lib/utils/logger';
	
	// Modern Svelte 5 patterns with conversion psychology
	interface Props {
		id: string;
		title: string;
		price: number;
		originalPrice?: number;
		size?: string;
		brand?: string;
		image: string | string[];
		seller: {
			username: string;
			avatar?: string;
			account_type?: string;
			is_verified?: boolean;
			rating?: number;
		};
		likes?: number;
		views?: number;
		isLiked?: boolean;
		condition?: string;
		isUrgent?: boolean;
		isTrending?: boolean;
		soldRecently?: boolean;
		eagerLoading?: boolean;
		className?: string;
	}
	
	let { 
		id, 
		title, 
		price, 
		originalPrice,
		size, 
		brand, 
		image, 
		seller, 
		likes = 0, 
		views,
		isLiked = false, 
		condition, 
		isUrgent = false,
		isTrending = false,
		soldRecently = false,
		eagerLoading = false,
		className
	}: Props = $props();
	
	// ✅ CORRECT: Use $state() for reactive UI state
	let liked = $state(isLiked);
	let likeCount = $state(likes);
	let likeLoading = $state(false);
	let imageError = $state(false);
	let isHovered = $state(false);
	
	// ✅ CORRECT: Use $derived() for computed values
	const primaryImageUrl = $derived(() => {
		if (Array.isArray(image)) return image[0];
		return image;
	});
	
	const formattedPrice = $derived(() => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	});
	
	const savings = $derived(() => {
		if (!originalPrice || originalPrice <= price) return null;
		const savingsAmount = originalPrice - price;
		const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);
		return { amount: savingsAmount, percent: savingsPercent };
	});
	
	const sellerRating = $derived(() => {
		return seller.rating || (4.2 + Math.random() * 0.8); // Simulated rating for demo
	});
	
	// ✅ CORRECT: Modern event handlers
	async function handleToggleLike(e: MouseEvent) {
		e.preventDefault();
		if (likeLoading) return;
		
		likeLoading = true;
		const originalLiked = liked;
		const originalCount = likeCount;
		
		// Optimistic update for better UX
		liked = !liked;
		likeCount = liked ? likeCount + 1 : likeCount - 1;
		
		try {
			const response = await fetch(`/api/listings/${id}/favorite`, {
				method: liked ? 'POST' : 'DELETE',
			});
			
			if (!response.ok) throw new Error('Failed to update favorite');
		} catch (error) {
			// Revert on error
			liked = originalLiked;
			likeCount = originalCount;
			logger.error('Error toggling like', error);
		} finally {
			likeLoading = false;
		}
	}
	
	function handleMouseEnter() {
		isHovered = true;
	}
	
	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<article 
	class={cn(
		"relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 group overflow-hidden",
		"hover:shadow-lg hover:-translate-y-1",
		className
	)}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<a 
		href={localizeHref(`/listings/${id}`)} 
		class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
		aria-label={m.listing_view_details({ title })}
	>
		<!-- Image Container with Conversion Overlays -->
		<div class="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100">
			{#if !imageError && primaryImageUrl}
				<img
					src={primaryImageUrl}
					alt={title}
					class={cn(
						"absolute inset-0 h-full w-full object-cover transition-all duration-500",
						isHovered ? "scale-110" : "scale-100"
					)}
					loading={eagerLoading ? 'eager' : 'lazy'}
					onerror={() => imageError = true}
					sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
				/>
				
				<!-- Gradient overlay for better text readability -->
				<div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			{:else}
				<div class="h-full w-full flex items-center justify-center bg-gray-100">
					<div class="text-center">
						<ShoppingBag class="w-12 h-12 mx-auto mb-2 text-gray-300" />
						<p class="text-sm text-gray-500">No image</p>
					</div>
				</div>
			{/if}
			
			<!-- Top Row: Urgency + Like Button -->
			<div class="absolute top-2 left-2 right-2 flex items-start justify-between">
				<div class="flex flex-col gap-2">
					<!-- Urgency Indicators -->
					{#if isUrgent}
						<UrgencyIndicator type="few_left" count={2} size="sm" />
					{:else if isTrending}
						<UrgencyIndicator type="high_demand" count={23} size="sm" />
					{:else if soldRecently}
						<UrgencyIndicator type="recent_activity" size="sm" />
					{:else if views && views > 10}
						<UrgencyIndicator type="viewers" count={views} size="sm" />
					{/if}
					
					<!-- Savings Badge -->
					{#if savings}
						<div class="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
							-{savings.percent}%
						</div>
					{/if}
				</div>
				
				<!-- Like Button -->
				<button
					onclick={handleToggleLike}
					class={cn(
						"w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
						"active:scale-95 hover:scale-110",
						likeLoading && "opacity-50 cursor-not-allowed"
					)}
					aria-label={liked ? m.listing_unlike() : m.listing_like()}
					disabled={likeLoading}
					type="button"
				>
					<Heart 
						class={cn(
							"h-4 w-4 transition-colors duration-200", 
							liked ? "fill-red-500 text-red-500" : "text-gray-600"
						)} 
					/>
				</button>
			</div>
			
			<!-- Bottom Row: Condition Badge -->
			{#if condition}
				<div class="absolute bottom-2 left-2">
					<div class={cn(
						"px-2 py-1 rounded-md text-xs font-medium",
						condition === 'new' && "bg-green-500 text-white",
						condition === 'like_new' && "bg-blue-500 text-white", 
						condition === 'good' && "bg-yellow-500 text-white",
						condition === 'fair' && "bg-orange-500 text-white",
						!['new', 'like_new', 'good', 'fair'].includes(condition) && "bg-gray-500 text-white"
					)}>
						{condition}
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Content Section -->
		<div class="p-3 space-y-3">
			<!-- Title and Price Row -->
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1 min-w-0">
					<h3 class="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{title}</h3>
					{#if brand}
						<p class="text-xs text-gray-600 mt-1 font-medium">{brand}</p>
					{/if}
				</div>
				<div class="text-right">
					<p class="font-bold text-gray-900 text-lg tabular-nums">{formattedPrice}</p>
					{#if originalPrice && savings}
						<p class="text-xs text-gray-500 line-through tabular-nums">
							{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(originalPrice)}
						</p>
					{/if}
				</div>
			</div>
			
			<!-- Size -->
			{#if size}
				<p class="text-sm text-gray-600 font-medium">Size: {size}</p>
			{/if}
			
			<!-- Seller Info Row -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					{#if seller.avatar}
						<img
							src={seller.avatar}
							alt=""
							class="h-5 w-5 rounded-full object-cover"
						/>
					{:else}
						<div class="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<span class="text-xs font-medium text-white">
								{seller.username.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
					<span class="text-sm text-gray-700 font-medium truncate">{seller.username}</span>
					{#if seller.is_verified}
						<div class="flex items-center gap-1">
							<Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
							<span class="text-xs text-gray-600">{sellerRating.toFixed(1)}</span>
						</div>
					{/if}
				</div>
				
				<!-- Social Proof -->
				{#if likeCount > 0}
					<div class="flex items-center gap-1 text-gray-500">
						<Heart class="h-3 w-3 fill-current" />
						<span class="text-xs font-medium tabular-nums">{likeCount}</span>
					</div>
				{/if}
			</div>
		</div>
	</a>
	
	<!-- Hover CTA Button -->
	{#if isHovered}
		<div class="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
			<button class="w-full bg-black text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-gray-800 transition-colors duration-200">
				Quick View
			</button>
		</div>
	{/if}
</article>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>