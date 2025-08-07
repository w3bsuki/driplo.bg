<script lang="ts">
	import { Heart, Share2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte';
	import CategoryBadge from '$lib/components/badges/CategoryBadge.svelte';
	import SizeBadge from '$lib/components/badges/SizeBadge.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Truck, RotateCcw, MapPin } from 'lucide-svelte';
	import SellerProfile from '$lib/components/seller/SellerProfile.svelte';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	// Get context - this component requires context to be set
	const context = getListingContext();
	const { listing, isLiked, isOwner, toggleLike, share } = context;

	let isDescriptionExpanded = $state(false);
</script>

<div class="space-y-3">
	<!-- Header -->
	<div class="space-y-2">
		<div class="flex items-center justify-between gap-2">
			<h1 class="text-base font-semibold text-foreground flex-1">
				{listing?.title || ''}
			</h1>
			<div class="flex items-center gap-1">
				<button
					onclick={toggleLike}
					class={cn("p-1.5 rounded-sm hover:bg-gray-100 transition-colors duration-100",
						isLiked() ? "text-red-500" : "text-gray-500 hover:text-red-500"
					)}
				>
					<Heart class={cn("w-4 h-4", isLiked() && "fill-current")} />
				</button>
				<button 
					onclick={share}
					class="p-1.5 rounded-sm text-gray-500 hover:bg-gray-100 transition-colors duration-100"
				>
					<Share2 class="w-4 h-4" />
				</button>
			</div>
		</div>

		<div class="flex items-baseline gap-2">
			<span class="text-xl font-bold text-foreground">{formatCurrency(listing?.price || 0)}</span>
			{#if listing?.shipping_price > 0}
				<span class="text-xs text-muted-foreground">+ {formatCurrency(listing.shipping_price)} shipping</span>
			{:else}
				<span class="text-xs text-green-600">Free shipping</span>
			{/if}
		</div>

		<!-- Badges Row -->
		<div class="flex flex-wrap gap-1">
			{#if listing?.category}
				<CategoryBadge category={listing.category} variant="compact" />
			{/if}
			{#if listing?.brand}
				<BrandBadge brand={listing.brand} variant="compact" />
			{/if}
			{#if listing?.condition}
				<ConditionBadge condition={listing.condition} variant="compact" />
			{/if}
			{#if listing?.size}
				<SizeBadge size={listing.size} variant="compact" />
			{/if}
		</div>
	</div>

	<!-- Description -->
	{#if listing?.description}
		<div class="space-y-2">
			<h3 class="text-sm font-medium text-foreground">Description</h3>
			<p class={cn(
				"text-sm text-muted-foreground leading-relaxed",
				!isDescriptionExpanded && "line-clamp-3"
			)}>
				{listing.description}
			</p>
			{#if listing.description.length > 150}
				<button
					onclick={() => isDescriptionExpanded = !isDescriptionExpanded}
					class="text-xs text-primary hover:underline"
				>
					{isDescriptionExpanded ? 'Show less' : 'Read more'}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Product Details Tabs -->
	<Tabs defaultValue="details" class="w-full">
		<TabsList class="grid w-full grid-cols-3 h-8">
			<TabsTrigger value="details" class="text-xs">Details</TabsTrigger>
			<TabsTrigger value="shipping" class="text-xs">Shipping</TabsTrigger>
			<TabsTrigger value="seller" class="text-xs">Seller</TabsTrigger>
		</TabsList>
		
		<TabsContent value="details" class="mt-2 space-y-2">
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#if listing?.color}
					<div>
						<span class="text-muted-foreground">Color:</span>
						<span class="ml-1 text-foreground">{listing.color}</span>
					</div>
				{/if}
				{#if listing?.material}
					<div>
						<span class="text-muted-foreground">Material:</span>
						<span class="ml-1 text-foreground">{listing.material}</span>
					</div>
				{/if}
				{#if listing?.pattern}
					<div>
						<span class="text-muted-foreground">Pattern:</span>
						<span class="ml-1 text-foreground">{listing.pattern}</span>
					</div>
				{/if}
				{#if listing?.style}
					<div>
						<span class="text-muted-foreground">Style:</span>
						<span class="ml-1 text-foreground">{listing.style}</span>
					</div>
				{/if}
			</div>
		</TabsContent>
		
		<TabsContent value="shipping" class="mt-2 space-y-2">
			<div class="space-y-2 text-xs">
				<div class="flex items-center gap-2">
					<Truck class="w-3.5 h-3.5 text-muted-foreground" />
					<span class="text-foreground">
						{listing?.shipping_price > 0 
							? `${formatCurrency(listing.shipping_price)} shipping` 
							: 'Free shipping'}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<MapPin class="w-3.5 h-3.5 text-muted-foreground" />
					<span class="text-foreground">Ships from {listing?.seller?.city || 'Bulgaria'}</span>
				</div>
				<div class="flex items-center gap-2">
					<RotateCcw class="w-3.5 h-3.5 text-muted-foreground" />
					<span class="text-foreground">Returns accepted within 14 days</span>
				</div>
			</div>
		</TabsContent>
		
		<TabsContent value="seller" class="mt-2">
			<SellerProfile 
				seller={listing?.seller}
				isOwner={isOwner()}
				variant="minimal"
				showStats={false}
			/>
		</TabsContent>
	</Tabs>
</div>