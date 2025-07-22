<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import Image from '$lib/components/ui/Image.svelte';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	
	interface Props {
		id: string;
		title: string;
		price: number;
		size?: string;
		brand?: string;
		image: string | Record<string, string>;
		imageUrls?: Record<string, string>;
		seller: {
			username: string;
			avatar?: string;
			account_type?: string;
			is_verified?: boolean;
		};
		likes?: number;
		isLiked?: boolean;
		condition?: 'new' | 'good' | 'worn';
		eagerLoading?: boolean; // For first 8 cards in viewport
	}
	
	let { id, title, price, size, brand, image, imageUrls, seller, likes = 0, isLiked = false, condition, eagerLoading = false }: Props = $props();
	
	let liked = $state(isLiked);
	let likeCount = $state(likes);
	let likeLoading = $state(false);
	let imageError = $state(false);
	
	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(price);
	}

	function getAvatarGradient(username: string): string {
		const colors = [
			'from-blue-500 to-purple-500',
			'from-green-500 to-blue-500',
			'from-blue-300 to-red-500',
			'from-purple-500 to-pink-500',
			'from-yellow-500 to-blue-300',
			'from-pink-500 to-red-500'
		];
		const index = username.charCodeAt(0) % colors.length;
		return colors[index];
	}

	async function toggleLike(e: MouseEvent) {
		e.preventDefault();
		if (likeLoading) return;
		
		likeLoading = true;
		
		try {
			// Optimistic update
			const wasLiked = liked;
			liked = !liked;
			likeCount = liked ? likeCount + 1 : likeCount - 1;
			
			// Make API call
			const response = await fetch('/api/wishlist', {
				method: liked ? 'POST' : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					listing_id: id
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to toggle favorite');
			}
		} catch (error) {
			// Revert on error
			liked = wasLiked;
			likeCount = liked ? likeCount + 1 : likeCount - 1;
			console.error('Error toggling like:', error);
		} finally {
			likeLoading = false;
		}
	}

	function handleImageError() {
		imageError = true;
	}
</script>

<div class="relative bg-white rounded-lg shadow-product focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2">
	<a href="/listings/{id}" class="block focus:outline-none rounded-lg">
		<div class="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-neutral-100">
			{#if !imageError}
				<Image
					src={imageUrls || image}
					alt={title}
					class="h-full w-full"
					objectFit="cover"
					preferredSize="small"
					loading={eagerLoading ? 'eager' : 'lazy'}
					priority={eagerLoading}
					onerror={handleImageError}
					sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
				/>
			{:else}
				<div class="h-full w-full flex items-center justify-center bg-gray-100">
					<div class="text-center">
						<div class="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
							<span class="text-2xl">📷</span>
						</div>
						<p class="text-sm text-gray-500">Image not available</p>
					</div>
				</div>
			{/if}
			
			<button
				onclick={toggleLike}
				class={cn(
					"absolute top-2 right-2 p-2 rounded-full bg-white/95 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:bg-gray-100 touch-safe",
					likeLoading && "opacity-50 cursor-not-allowed"
				)}
				aria-label={liked ? 'Unlike' : 'Like'}
				disabled={likeLoading}
			>
				<Heart class={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "text-neutral-600")} />
			</button>
			
			{#if condition}
				<div class="absolute top-2 left-2">
					<Badge 
						variant="outline"
						class={cn(
							"font-medium shadow-sm border",
							condition === 'new' && "!bg-blue-500 !text-white !border-blue-500",
							condition === 'good' && "!bg-amber-500 !text-white !border-amber-500",
							condition === 'worn' && "!bg-red-500 !text-white !border-red-500"
						)}
					>
						{condition === 'new' ? 'New' : condition === 'good' ? 'Good' : 'Worn'}
					</Badge>
				</div>
			{/if}
		</div>
		
		<div class="p-3 space-y-1">
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-neutral-900 truncate">{title}</p>
					{#if brand}
						<p class="text-xs text-neutral-500">{brand}</p>
					{/if}
				</div>
				<p class="text-sm font-semibold text-primary">{formatPrice(price)}</p>
			</div>
			
			{#if size}
				<p class="text-xs text-neutral-500">Size {size}</p>
			{/if}
			
			<div class="flex items-center gap-2 pt-1">
				{#if seller.avatar}
					<img
						src={seller.avatar}
						alt={seller.username}
						class="h-5 w-5 rounded-full object-cover"
					/>
				{:else}
					<div class="h-5 w-5 rounded-full bg-gradient-to-br {getAvatarGradient(seller.username)} flex items-center justify-center">
						<span class="text-[10px] font-medium text-white">{seller.username.charAt(0).toUpperCase()}</span>
					</div>
				{/if}
				<span class="text-xs text-neutral-600">{seller.username}</span>
				{#if seller.account_type === 'brand'}
					<BrandBadge size="xs" isVerified={seller.is_verified} showText={false} />
				{/if}
				{#if likeCount > 0}
					<span class="text-xs text-neutral-400 ml-auto" aria-live="polite">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
				{/if}
			</div>
		</div>
	</a>
</div>