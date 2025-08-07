<script lang="ts">
	import { Heart, Share2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte';
	import CategoryBadge from '$lib/components/badges/CategoryBadge.svelte';
	import SizeBadge from '$lib/components/badges/SizeBadge.svelte';

	const context = getListingContext();
	const { listing, isLiked, toggleLike, share } = context;
</script>

<Card class="border-0 shadow-none">
	<CardContent class="p-0 space-y-3">
		<!-- Title and Actions -->
		<div class="flex items-start justify-between gap-3">
			<h1 class="text-lg font-semibold text-foreground flex-1">
				{listing?.title || ''}
			</h1>
			<div class="flex items-center gap-1">
				<Button
					onclick={toggleLike}
					variant="ghost"
					size="icon"
					class={cn(
						"h-9 w-9",
						isLiked() && "text-red-500 hover:text-red-600"
					)}
				>
					<Heart class={cn("h-5 w-5", isLiked() && "fill-current")} />
				</Button>
				<Button
					onclick={share}
					variant="ghost"
					size="icon"
					class="h-9 w-9"
				>
					<Share2 class="h-5 w-5" />
				</Button>
			</div>
		</div>

		<!-- Price and Shipping -->
		<div class="flex items-baseline gap-2">
			<span class="text-2xl font-bold text-foreground">
				{formatCurrency(listing?.price || 0)}
			</span>
			{#if listing?.shipping_price > 0}
				<span class="text-sm text-muted-foreground">
					+ {formatCurrency(listing.shipping_price)} {m.shipping_info()}
				</span>
			{:else}
				<span class="text-sm text-green-600 font-medium">
					{m.free_shipping()}
				</span>
			{/if}
		</div>

		<!-- Badges -->
		<div class="flex flex-wrap gap-2">
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
	</CardContent>
</Card>