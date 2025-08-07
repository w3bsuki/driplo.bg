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
		class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
		transition:slide={{ duration: 200, axis: 'y' }}
	>
		<div class="px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
			<div class="flex items-center gap-2">
				<!-- Title and Price Info - Compact -->
				<div class="flex-1 min-w-0">
					<div class="text-xs text-muted-foreground truncate">
						{listing.title || ''}
					</div>
					<div class="text-base font-semibold text-foreground">
						{formatCurrency(listing.price || 0)}
						{#if listing.shipping_price > 0}
							<span class="text-xs font-normal text-muted-foreground ml-1">
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
						variant="ghost"
						size="icon"
						class={cn(
							"h-9 w-9 shrink-0",
							isLiked() && "text-red-500"
						)}
					>
						<Heart class={cn("h-5 w-5", isLiked() && "fill-current")} />
					</Button>
					<Button
						onclick={onBuyNow}
						size="sm"
						class="gap-1.5 h-9 px-4"
					>
						<ShoppingBag class="h-4 w-4" />
						{m.buy_now()}
					</Button>
				{:else if isOwner()}
					<Button
						onclick={() => goto(`/listings/${listing.id}/edit`)}
						size="sm"
						class="gap-1.5 h-9"
					>
						{m.edit_listing()}
					</Button>
				{:else if isSold}
					<Button
						disabled
						variant="secondary"
						size="sm"
						class="h-9"
					>
						{m.item_sold()}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}