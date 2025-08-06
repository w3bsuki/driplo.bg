<script lang="ts">
	import { Heart, ShoppingBag } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/currency';
	import { goto } from '$app/navigation';

	let { 
		listing,
		isOwner = false,
		isLiked = false,
		onLike = () => {},
		onBuyNow = () => {},
		checkoutFlowRef
	} = $props();
</script>

<!-- Action Buttons -->
{#if !isOwner && listing.status !== 'sold'}
	<div class="flex gap-2 mt-3">
		<button
			onclick={onLike}
			class={cn(
				"flex-1 py-2.5 px-4 rounded-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
				isLiked 
					? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
					: "bg-gray-100 text-gray-600 hover:bg-gray-200"
			)}
		>
			<Heart class={cn("w-4 h-4", isLiked && "fill-current")} />
			<span class="text-sm">{isLiked ? "Liked" : "Like"}</span>
		</button>
		<button
			onclick={onBuyNow}
			onmouseenter={() => checkoutFlowRef?.preload()}
			onfocus={() => checkoutFlowRef?.preload()}
			class="flex-1 bg-primary text-white rounded-sm py-2.5 px-4 font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2"
		>
			<ShoppingBag class="w-4 h-4" />
			<span class="text-sm">Buy Now</span>
		</button>
	</div>
{:else if isOwner}
	<div class="flex gap-2 mt-3">
		<button
			onclick={() => goto(`/listings/${listing.id}/edit`)}
			class="flex-1 bg-primary text-white rounded-sm py-2.5 px-4 font-medium hover:bg-primary/90 transition-all duration-200 text-sm"
		>
			Edit Listing
		</button>
	</div>
{:else if listing.status === 'sold'}
	<div class="mt-3">
		<div class="bg-red-50 border border-red-200 rounded-sm py-2.5 px-4 text-center">
			<span class="text-red-600 font-medium text-sm">This item has been sold</span>
		</div>
	</div>
{/if}

<!-- Compact Bottom Bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
	<div class="max-w-7xl mx-auto flex items-center gap-2">
		<div class="flex-1">
			<div class="text-base font-bold text-gray-900">{formatCurrency(listing.price)}</div>
			<div class="text-xs text-gray-500">{listing.shipping_price > 0 ? `+ ${formatCurrency(listing.shipping_price)} shipping` : 'Free shipping'}</div>
		</div>
		{#if !isOwner}
			<button
				onclick={onLike}
				class={cn(
					"p-2.5 rounded-sm transition-all duration-200 transform active:scale-[0.98]",
					isLiked 
						? "bg-red-50 text-red-600 border border-red-200" 
						: "bg-gray-100 text-gray-600 hover:bg-gray-200"
				)}
			>
				<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
			</button>
			<button
				onclick={onBuyNow}
				onmouseenter={() => checkoutFlowRef?.preload()}
				onfocus={() => checkoutFlowRef?.preload()}
				class="bg-primary text-white rounded-sm px-4 py-2 font-medium hover:bg-primary/90 transition-all duration-100 transform active:scale-[0.98]"
			>
				Buy Now
			</button>
		{:else}
			<button
				onclick={() => goto(`/listings/${listing.id}/edit`)}
				class="bg-primary text-white rounded-sm px-4 py-2 font-medium hover:bg-primary/90 transition-all duration-100 transform active:scale-[0.98]"
			>
				Edit Listing
			</button>
		{/if}
	</div>
</div>