<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte';
	import EnhancedImage from '$lib/components/common/EnhancedImage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { logger } from '$lib/utils/logger';
	
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
			avatar_url?: string;
			account_type?: string;
			is_verified?: boolean;
			rating?: number;
			seller_rating?: number;
		};
		likes?: number;
		isLiked?: boolean;
		condition?: string | null;
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
		imageUrls, 
		seller, 
		likes = 0, 
		isLiked = false, 
		condition, 
		eagerLoading = false,
		className
	}: Props = $props();
	
	// State
	let liked = $state(isLiked);
	let likeCount = $state(likes);
	let likeLoading = $state(false);
	let imageError = $state(false);
	
	// Derived values
	const primaryImageUrl = $derived(() => {
		const img = imageUrls || image;
		if (!img) return null;
		if (Array.isArray(img)) return img[0];
		if (typeof img === 'object' && img !== null) return Object.values(img)[0];
		return img;
	});
	
	const formattedPrice = $derived(formatCurrency(price));
	
	const discountPercentage = $derived(
		originalPrice && originalPrice > price 
			? Math.round(((originalPrice - price) / originalPrice) * 100)
			: 0
	);
	
	const handleToggleLike = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (likeLoading) return;
		
		likeLoading = true;
		const originalLiked = liked;
		const originalCount = likeCount;
		
		// Optimistic update
		liked = !liked;
		likeCount = liked ? likeCount + 1 : likeCount - 1;
		
		try {
			const response = await fetch(`/api/listings/${id}/favorite`, {
				method: liked ? 'POST' : 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.likeCount !== undefined) {
					likeCount = data.likeCount;
				}
			} else {
				liked = originalLiked;
				likeCount = originalCount;
			}
		} catch (error) {
			liked = originalLiked;
			likeCount = originalCount;
			logger.error('Error toggling like:', error);
		} finally {
			likeLoading = false;
		}
	}
	
	// Get seller avatar
	const sellerAvatar = $derived(seller?.avatar || seller?.avatar_url);
</script>

<article 
	class={cn(
		"group relative bg-white rounded-lg overflow-hidden",
		"border border-gray-200 hover:border-gray-300",
		"transition-all duration-200",
		className
	)}
>
	<a 
		href={localizeHref(`/listings/${id}`)} 
		class="block"
		aria-label={m.listing_view_details({ title })}
	>
		<!-- Image Container - Square aspect ratio -->
		<div class="relative aspect-square bg-gray-50 overflow-hidden">
			{#if !imageError && primaryImageUrl()}
				<EnhancedImage
					src={primaryImageUrl()}
					alt={title}
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading={eagerLoading ? 'eager' : 'lazy'}
					priority={eagerLoading}
					useProgressiveLoading={!eagerLoading}
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					srcsetSizes={[200, 400, 600, 800]}
					onError={() => imageError = true}
				/>
			{:else}
				<div class="h-full w-full flex items-center justify-center bg-gray-100">
					<span class="text-2xl text-gray-400">📷</span>
				</div>
			{/if}
			
			<!-- Condition Badge - Top Left -->
			{#if condition}
				<div class="absolute top-2 left-2">
					<ConditionBadge 
						condition={condition} 
						size="sm" 
						class="text-[10px] font-semibold px-1.5 py-0.5 shadow-sm" 
					/>
				</div>
			{/if}
			
			<!-- Like Button - Top Right -->
			<button
				onclick={handleToggleLike}
				class={cn(
					"absolute top-2 right-2",
					"w-8 h-8 rounded-full",
					"bg-white/90 backdrop-blur-sm shadow-sm",
					"flex items-center justify-center",
					"transition-all duration-200",
					"hover:bg-white hover:shadow-md",
					likeLoading && "opacity-50"
				)}
				aria-label={liked ? m.listing_unlike() : m.listing_like()}
				aria-pressed={liked}
				disabled={likeLoading}
				type="button"
			>
				<Heart 
					class={cn(
						"w-4 h-4",
						liked ? "fill-red-500 text-red-500" : "text-gray-600"
					)} 
				/>
			</button>
			
			<!-- Discount Badge - Bottom Left if significant -->
			{#if discountPercentage >= 15}
				<div class="absolute bottom-2 left-2">
					<div class="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
						-{discountPercentage}%
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Content - Super minimal -->
		<div class="p-2">
			<!-- Seller -->
			<div class="flex items-center gap-1 mb-1">
				{#if sellerAvatar}
					<img 
						src={sellerAvatar} 
						alt="" 
						class="w-4 h-4 rounded-full" 
					/>
				{:else}
					<div class="w-4 h-4 rounded-full bg-gray-300"></div>
				{/if}
				<span class="text-xs text-gray-600 truncate">
					{seller?.username || 'Anonymous'}
				</span>
			</div>
			
			<!-- Title -->
			<p class="text-xs text-gray-900 line-clamp-1 mb-1">
				{title}
			</p>
			
			<!-- Brand & Size in same row -->
			{#if brand || size}
				<div class="flex items-center gap-1.5 text-[10px] text-gray-600 mb-1">
					{#if brand}
						<span class="font-medium">{brand}</span>
					{/if}
					{#if brand && size}
						<span class="text-gray-400">•</span>
					{/if}
					{#if size}
						<span>Size {size}</span>
					{/if}
				</div>
			{/if}
			
			<!-- Price with like count -->
			<div class="flex items-center justify-between">
				<span class="text-sm font-bold text-gray-900">
					{formattedPrice}
				</span>
				{#if likeCount > 0}
					<span class="text-[10px] text-gray-500 flex items-center gap-0.5">
						<Heart class="w-2.5 h-2.5 fill-current" />
						{likeCount}
					</span>
				{/if}
			</div>
		</div>
	</a>
</article>