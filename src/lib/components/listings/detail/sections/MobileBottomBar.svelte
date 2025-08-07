<script lang="ts">
	import { Heart, ShoppingBag, MessageCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/currency';
	import { goto } from '$app/navigation';
	import { fade, slide } from 'svelte/transition';
	import Button from '$lib/components/ui/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte';

	let { 
		onBuyNow = () => {},
		onMessageSeller = () => {},
		show = true
	} = $props();

	const context = getListingContext();
	const { listing, isOwner, isLiked, isLikeLoading, toggleLike } = context;

	const canPurchase = $derived(!isOwner() && listing?.status !== 'sold');
	const isSold = $derived(listing?.status === 'sold');
</script>

{#if show && listing}
	<div 
		class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden"
		transition:slide={{ duration: 200, axis: 'y' }}
	>
		<div class="px-3 py-2 safe-area-pb">
			<div class="flex items-center gap-2">
				<!-- Title and Price Info - Compact -->
				<div class="flex-1 min-w-0">
					<div class="text-[11px] text-muted-foreground truncate leading-tight">
						{listing.title || ''}
					</div>
					<div class="text-sm font-bold text-foreground">
						{formatCurrency(listing.price || 0)}
						{#if listing.shipping_price > 0}
							<span class="text-[10px] font-normal text-muted-foreground ml-1">
								+{formatCurrency(listing.shipping_price)}
							</span>
						{/if}
					</div>
				</div>
				
				<!-- Action Buttons - Compact -->
				{#if canPurchase}
					<Button
						onclick={toggleLike}
						disabled={isLikeLoading()}
						variant="outline"
						size="icon"
						class={cn(
							"h-8 w-8 shrink-0 border",
							isLiked() && "text-red-500 border-red-200 bg-red-50"
						)}
					>
						<Heart class={cn("h-4 w-4", isLiked() && "fill-current")} />
					</Button>
					<Button
						onclick={onBuyNow}
						size="sm"
						class="gap-1 h-8 px-3 text-xs font-medium"
					>
						<ShoppingBag class="h-3.5 w-3.5" />
						{m.buy_now()}
					</Button>
				{:else if isOwner()}
					<Button
						onclick={() => goto(`/listings/${listing.id}/edit`)}
						size="sm"
						class="gap-1 h-8 text-xs"
					>
						{m.edit_listing()}
					</Button>
				{:else if isSold}
					<Button
						disabled
						variant="secondary"
						size="sm"
						class="h-8 text-xs"
					>
						{m.item_sold()}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.safe-area-pb {
		padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
	}
</style>