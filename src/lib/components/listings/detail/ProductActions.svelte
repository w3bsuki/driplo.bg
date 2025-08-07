<script lang="ts">
	import { Heart, ShoppingBag } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';
	import MobileBottomBar from './sections/MobileBottomBar.svelte';

	// Props for specific UI behavior
	let { 
		onBuyNow = () => {},
		checkoutFlowRef,
		showMobileBar = true
	} = $props();

	// Get context data
	const context = getListingContext();
	const { listing, isOwner, isLiked, isLikeLoading, toggleLike } = context;

	// Computed states
	const canPurchase = $derived(!isOwner() && listing?.status !== 'sold');
	const isSold = $derived(listing?.status === 'sold');

	// Event handlers
	const handleBuy = () => onBuyNow();
	const handleEdit = () => goto(`/listings/${listing?.id}/edit`);
	const preloadCheckout = () => checkoutFlowRef?.preload();
</script>

<!-- Desktop Action Buttons -->
<Card class="hidden md:block">
	<CardContent class="p-4">
		{#if canPurchase}
			<div class="flex gap-2">
				<Button
					onclick={toggleLike}
					disabled={isLikeLoading()}
					variant="outline"
					class="flex-1 gap-2"
				>
					<Heart class={isLiked() ? "h-4 w-4 fill-current" : "h-4 w-4"} />
					{isLiked() ? m.liked() : m.like()}
				</Button>
				<Button
					onclick={handleBuy}
					onmouseenter={preloadCheckout}
					onfocus={preloadCheckout}
					class="flex-1 gap-2"
				>
					<ShoppingBag class="h-4 w-4" />
					{m.buy_now()}
				</Button>
			</div>
		{:else if isOwner()}
			<Button
				onclick={handleEdit}
				class="w-full"
			>
				{m.edit_listing()}
			</Button>
		{:else if isSold}
			<div class="rounded-md bg-muted px-4 py-3 text-center">
				<p class="text-sm font-medium text-muted-foreground">
					{m.item_sold()}
				</p>
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Mobile Bottom Bar -->
<MobileBottomBar 
	{onBuyNow}
	show={showMobileBar}
/>