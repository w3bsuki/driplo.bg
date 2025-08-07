<script lang="ts">
	import { Heart, Package } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	
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
	}: Props = $props();
	
	// State
	let liked = $state(isLiked);
	let likeCount = $state(likes);
	let likeLoading = $state(false);
	let imageError = $state(false);
	let showQuickView = $state(false);
	
	// Calculate discount percentage
	const discountPercentage = $derived(
		originalPrice && originalPrice > price 
			? Math.round(((originalPrice - price) / originalPrice) * 100)
			: 0
	);
	
	
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

<article class="relative bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-all duration-200 group shadow-sm hover:shadow-md">
	<a 
		href={localizeHref(`/listings/${id}`)} 
		class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
		aria-label={m.listing_view_details({ title })}
	>
		<div class="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-50">
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
			
			<!-- Condition Badge -->
			{#if condition}
				<div class="absolute top-2 left-2">
					{#if condition === 'new_with_tags'}
						<Badge class="bg-green-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
							NEW
						</Badge>
					{:else if condition === 'like_new'}
						<Badge class="bg-blue-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
							LIKE NEW
						</Badge>
					{:else if condition === 'very_good'}
						<Badge class="bg-purple-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
							VERY GOOD
						</Badge>
					{:else if condition === 'good'}
						<Badge class="bg-yellow-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
							GOOD
						</Badge>
					{:else if condition === 'fair'}
						<Badge class="bg-orange-500 text-white border-0 px-2 py-0.5 text-xs font-semibold">
							FAIR
						</Badge>
					{/if}
				</div>
			{/if}
			
			<!-- Like Button -->
			<button
				onclick={handleToggleLike}
				class={cn(
					"absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center active:scale-95",
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
			
		</div>
		
		<div class="p-3 space-y-2">
			<!-- Title -->
			<h3 class="text-sm font-medium text-gray-900 line-clamp-1">{title}</h3>
			
			<!-- Brand and Size -->
			<div class="flex items-center gap-2 text-xs text-gray-600">
				{#if brand}
					<span class="truncate">{brand}</span>
				{/if}
				{#if size}
					{#if brand}•{/if}
					<span class="font-medium">Size {size}</span>
				{/if}
			</div>
			
			<!-- Price -->
			<p class="text-lg font-bold text-gray-900">{formattedPrice}</p>
			
			<!-- Seller - Bigger and Better -->
			<div class="flex items-center justify-between pt-1 border-t border-gray-100">
				<div class="flex items-center gap-1.5">
					{#if seller?.avatar}
						<img src={seller.avatar} alt="" class="h-5 w-5 rounded-full" />
					{:else}
						<div class="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<span class="text-[11px] text-white font-medium">
								{seller?.username?.charAt(0).toUpperCase() || 'A'}
							</span>
						</div>
					{/if}
					<span class="text-sm text-gray-700 font-medium">{seller?.username}</span>
					{#if seller?.rating}
						<span class="text-yellow-500 text-sm">★{seller.rating}</span>
					{/if}
				</div>
				{#if likeCount > 0}
					<span class="flex items-center gap-0.5 text-gray-500">
						<Heart class="h-3.5 w-3.5 fill-current" />
						<span class="text-xs">{likeCount}</span>
					</span>
				{/if}
			</div>
		</div>
	</a>
</article>