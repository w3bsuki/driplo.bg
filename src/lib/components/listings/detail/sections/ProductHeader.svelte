<script lang="ts">
	import { Heart, Share2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte';
	import CategoryBadge from '$lib/components/badges/CategoryBadge.svelte';
	import SizeBadge from '$lib/components/badges/SizeBadge.svelte';

	const context = getListingContext();
	const { listing, isLiked, toggleLike, share } = context;
</script>

<div class="space-y-2">
	<!-- Title and Actions -->
	<div class="flex items-start justify-between gap-2">
		<h1 class="text-base font-medium text-foreground flex-1 leading-tight">
			{listing?.title || ''}
		</h1>
		<div class="flex items-center gap-0.5">
			<Button
				onclick={toggleLike}
				variant="ghost"
				size="icon"
				class={cn(
					"h-8 w-8",
					isLiked() && "text-red-500 hover:text-red-600"
				)}
			>
				<Heart class={cn("h-4 w-4", isLiked() && "fill-current")} />
			</Button>
			<Button
				onclick={share}
				variant="ghost"
				size="icon"
				class="h-8 w-8"
			>
				<Share2 class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<!-- Price and Shipping -->
	<div class="flex items-baseline gap-2">
		<span class="text-xl font-bold text-foreground">
			{formatCurrency(listing?.price || 0)}
		</span>
		{#if listing?.shipping_price > 0}
			<span class="text-xs text-muted-foreground">
				+ {formatCurrency(listing.shipping_price)} {m.shipping_info()}
			</span>
		{:else}
			<span class="text-xs text-green-600 font-medium">
				{m.free_shipping()}
			</span>
		{/if}
	</div>

	<!-- Badges -->
	<div class="flex flex-wrap gap-1.5">
		{#if listing?.category}
			<CategoryBadge category={listing.category} variant="default" />
		{/if}
		{#if listing?.brand}
			<BrandBadge brand={listing.brand} variant="default" />
		{/if}
		{#if listing?.condition}
			<ConditionBadge condition={listing.condition} variant="default" />
		{/if}
		{#if listing?.size}
			<SizeBadge size={listing.size} />
		{/if}
	</div>
</div>