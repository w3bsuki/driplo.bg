<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
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
	
	
	async function handleToggleLike(e: MouseEvent) {
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
				// Update like count with server response
				if (data.likeCount !== undefined) {
					likeCount = data.likeCount;
				}
			} else {
				// Revert on error
				liked = originalLiked;
				likeCount = originalCount;
			}
		} catch (error) {
			// Revert on error
			liked = originalLiked;
			likeCount = originalCount;
			logger.error('Error toggling like:', error);
		} finally {
			likeLoading = false;
		}
	}
	
	function handleImageError() {
		imageError = true;
	}
	
	// Get seller avatar (handle both avatar and avatar_url)
	const sellerAvatar = $derived(seller?.avatar || seller?.avatar_url);
	const sellerRating = $derived(seller?.rating || seller?.seller_rating);
</script>

<article 
	class={cn(
		"relative bg-white rounded-sm overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors duration-100 group",
		className
	)}
>
	<a 
		href={localizeHref(`/listings/${id}`)} 
		class="block focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
		aria-label={m.listing_view_details({ title })}
	>
		<!-- Image Container - 75% of card height -->
		<div class="relative aspect-[3/4] bg-gray-50 overflow-hidden">
			{#if !imageError && primaryImageUrl()}
				<EnhancedImage
					src={primaryImageUrl()}
					alt={title}
					className="absolute inset-0 h-full w-full object-cover"
					loading={eagerLoading ? 'eager' : 'lazy'}
					priority={eagerLoading}
					useProgressiveLoading={!eagerLoading}
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					srcsetSizes={[200, 400, 600, 800]}
					onError={() => imageError = true}
				/>
			{:else}
				<div class="h-full w-full flex items-center justify-center">
					<div class="text-center p-4">
						<div class="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-sm flex items-center justify-center">
							<span class="text-lg text-gray-400">📷</span>
						</div>
						<p class="text-xs text-gray-400">No image</p>
					</div>
				</div>
			{/if}
			
			<!-- Condition Badge - Top Left -->
			{#if condition}
				<div class="absolute top-2 left-2">
					<ConditionBadge condition={condition} size="sm" class="text-[10px] font-bold px-1.5 py-0.5 h-5" />
				</div>
			{/if}
			
			<!-- Discount Badge - Below Condition -->
			{#if discountPercentage > 0}
				<div class="absolute top-9 left-2">
					<div class="bg-red-500 text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold">
						-{discountPercentage}%
					</div>
				</div>
			{/if}
			
			<!-- Like Button - Top Right -->
			<button
				onclick={handleToggleLike}
				class={cn(
					"absolute top-2 right-2 w-7 h-7 rounded-sm bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors duration-100",
					"hover:bg-white",
					likeLoading && "opacity-50 cursor-not-allowed"
				)}
				aria-label={liked ? m.listing_unlike() : m.listing_like()}
				aria-pressed={liked}
				disabled={likeLoading}
				type="button"
			>
				<Heart 
					class={cn("h-3.5 w-3.5", liked ? "fill-red-500 text-red-500" : "text-gray-600")} 
					aria-hidden="true"
				/>
			</button>
		</div>
		
		<!-- Text Container - 25% of card height -->
		<div class="p-2 space-y-0.5">
			<!-- Price - Most prominent -->
			<p class="text-sm font-bold text-gray-900">{formattedPrice}</p>
			
			<!-- Brand and Size - Very small -->
			{#if brand || size}
				<p class="text-[11px] text-gray-500 truncate">
					{#if brand}
						<span>{brand}</span>
					{/if}
					{#if brand && size}
						<span class="mx-0.5">•</span>
					{/if}
					{#if size}
						<span>{size}</span>
					{/if}
				</p>
			{/if}
			
			<!-- Seller and Likes Row -->
			<div class="flex items-center justify-between pt-0.5">
				<div class="flex items-center gap-1 min-w-0 flex-1">
					{#if sellerAvatar}
						<img 
							src={sellerAvatar} 
							alt="" 
							class="h-3.5 w-3.5 rounded-full object-cover flex-shrink-0" 
						/>
					{:else}
						<div class="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
							<span class="text-[8px] text-white font-semibold">
								{seller?.username?.charAt(0).toUpperCase() || 'A'}
							</span>
						</div>
					{/if}
					<span class="text-[11px] text-gray-600 truncate">
						{seller?.username || 'Anonymous'}
					</span>
					{#if sellerRating}
						<span class="text-[10px] text-yellow-500">★{sellerRating.toFixed(1)}</span>
					{/if}
				</div>
				{#if likeCount > 0}
					<div class="flex items-center gap-0.5 text-gray-500 flex-shrink-0">
						<Heart class="h-3 w-3 fill-current" />
						<span class="text-[10px] font-medium">{likeCount}</span>
					</div>
				{/if}
			</div>
		</div>
	</a>
</article>