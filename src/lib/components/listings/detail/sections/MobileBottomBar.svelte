<script lang="ts">
	import { Heart, ShoppingBag } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/currency';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	let { 
		onBuyNow = () => {},
		show = true
	} = $props();

	const context = getListingContext();
	const { listing, isOwner, isLiked, isLikeLoading, toggleLike } = context;

	const canPurchase = $derived(!isOwner() && listing?.status !== 'sold');
	const isSold = $derived(listing?.status === 'sold');
</script>

{#if show && listing}
	<div class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
		<div class="container mx-auto max-w-7xl px-4 py-3">
			<div class="flex items-center gap-3">
				<!-- Price Info -->
				<div class="flex-1">
					<div class="text-lg font-bold">
						{formatCurrency(listing.price || 0)}
					</div>
					<div class="text-xs text-muted-foreground">
						{listing.shipping_price > 0 
							? `+ ${formatCurrency(listing.shipping_price)} ${m.shipping_info()}`
							: m.free_shipping()}
					</div>
				</div>
				
				<!-- Action Buttons -->
				{#if canPurchase}
					<Button
						onclick={toggleLike}
						disabled={isLikeLoading()}
						variant="outline"
						size="icon"
						class={cn(
							"h-10 w-10",
							isLiked() && "border-red-500 text-red-500 hover:bg-red-50"
						)}
					>
						<Heart class={cn("h-5 w-5", isLiked() && "fill-current")} />
					</Button>
					<Button
						onclick={onBuyNow}
						size="default"
						class="gap-2"
					>
						<ShoppingBag class="h-4 w-4" />
						{m.buy_now()}
					</Button>
				{:else if isOwner()}
					<Button
						onclick={() => goto(`/listings/${listing.id}/edit`)}
						size="default"
						class="gap-2"
					>
						{m.edit_listing()}
					</Button>
				{:else if isSold}
					<Button
						disabled
						variant="secondary"
						size="default"
					>
						{m.item_sold()}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}