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
	import { listingStore } from '$lib/stores/listing.svelte.ts';

	// Props fallback when context is not available
	let { listing = null, currentUser = null }: { listing?: any, currentUser?: any } = $props();

	// Try to get context, fallback to props
	let context = $state.raw(() => {
		try {
			return getListingContext();
		} catch {
			// Context not available, use props and store directly
			return null;
		}
	});

	// Use context if available, otherwise use props and store
	const listingData = $derived(context ? context.listing : listing);
	const isLiked = $derived(() => context ? context.isLiked() : listingStore.isLiked(listingData?.id || ''));
	const isOwner = $derived(context ? context.isOwner : (currentUser?.id === listingData?.user_id));
	
	const toggleLike = () => {
		if (context) {
			context.toggleLike();
		} else if (listingData) {
			listingStore.toggleLike(listingData.id);
		}
	};
	
	const share = () => {
		if (context) {
			context.share();
		} else if (typeof navigator !== 'undefined' && navigator.share && listingData) {
			navigator.share({
				title: listingData?.title,
				text: listingData?.description,
				url: window.location.href
			}).catch(() => {});
		}
	};

	let isDescriptionExpanded = $state(false);
</script>

<div class="space-y-3">
	<!-- Header -->
	<div class="space-y-2">
		<div class="flex items-center justify-between gap-2">
			<h1 class="text-base font-semibold text-foreground flex-1">
				{listingData?.title || ''}
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
		
		<div class="flex items-center gap-3">
			<span class="text-xl font-bold text-gray-900">{formatCurrency(listingData?.price, getLocale())}</span>
			{#if listingData?.original_price && listingData?.original_price > listingData?.price}
				<span class="text-sm text-gray-500 line-through">{formatCurrency(listingData?.original_price, getLocale())}</span>
				<Badge variant="destructive" class="text-xs px-1.5 py-0.5">
					{Math.round((1 - listingData?.price / listingData?.original_price) * 100)}% off
				</Badge>
			{/if}
		</div>

		<!-- Quick info badges -->
		<div class="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 pb-1">
			{#if listingData?.condition}
				<div class="flex-shrink-0">
					<ConditionBadge condition={listingData?.condition} size="md" />
				</div>
			{/if}
			{#if listingData?.size}
				<div class="flex-shrink-0">
					<SizeBadge size={listingData?.size} badgeSize="md" />
				</div>
			{/if}
			{#if listingData?.category}
				<div class="flex-shrink-0">
					<CategoryBadge category={listingData?.category.name} size="md" />
				</div>
			{/if}
			{#if listingData?.brand}
				<div class="flex-shrink-0">
					<BrandBadge brand={listingData?.brand} size="md" isVerified={false} />
				</div>
			{/if}
		</div>

		<!-- Compact description -->
		<div class="text-sm text-gray-600">
			{#if isDescriptionExpanded || listingData?.description.length <= 100}
				<p>{listingData?.description}</p>
			{:else}
				<p>
					{listingData?.description.slice(0, 100)}...
					<button 
						onclick={() => isDescriptionExpanded = true}
						class="text-primary hover:underline ml-1"
					>
						See more
					</button>
				</p>
			{/if}
		</div>
	</div>

	<!-- Details Section with Tabs -->
	<div class="overflow-hidden">
		<Tabs value="details" class="w-full">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="details" class="text-sm flex-1 min-w-0">
					<span class="mr-1">📋</span> 
					<span class="truncate">Details</span>
				</TabsTrigger>
				<TabsTrigger value="shipping" class="text-sm flex-1 min-w-0">
					<span class="mr-1">📦</span> 
					<span class="truncate">Shipping</span>
				</TabsTrigger>
				<TabsTrigger value="seller" class="text-sm flex-1 min-w-0">
					<span class="mr-1">👤</span> 
					<span class="truncate">Seller</span>
				</TabsTrigger>
			</TabsList>
		
		<TabsContent value="details" class="mt-4 space-y-4 overflow-hidden">
			<div class="grid grid-cols-1 gap-3">
				{#if listingData?.materials && listingData?.materials.length > 0}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Materials</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listingData?.materials.join(', ')}</span>
					</div>
				{/if}
				{#if listingData?.category}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Category</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listingData?.category.name}</span>
					</div>
				{/if}
				{#if listingData?.subcategory}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Subcategory</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listingData?.subcategory?.name}</span>
					</div>
				{/if}
				<div class="flex justify-between items-center py-2 border-b border-gray-100">
					<span class="text-sm text-gray-500">Listed</span>
					<span class="text-sm text-gray-900 font-medium">{new Date(listingData?.created_at).toLocaleDateString()}</span>
				</div>
			</div>
			
			{#if listingData?.tags && listingData?.tags.length > 0}
				<div class="flex flex-wrap gap-1.5 pt-2">
					{#each listingData?.tags as tag (tag)}
						<Badge variant="secondary" size="sm">
							#{tag}
						</Badge>
					{/each}
				</div>
			{/if}
		</TabsContent>
		
		<TabsContent value="shipping" class="mt-4 space-y-4 overflow-hidden">
			<div class="space-y-2">
				<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
					<Truck class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900">Standard Shipping</p>
						<p class="text-sm text-gray-600">3-5 business days</p>
						<p class="text-sm font-medium text-gray-900 mt-1">
							{listingData?.shipping_price > 0 ? formatCurrency(listingData?.shipping_price, getLocale()) : 'Free'}
						</p>
					</div>
				</div>
				
				<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
					<RotateCcw class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900">Returns</p>
						<p class="text-sm text-gray-600">30-day return policy</p>
						<p class="text-xs text-gray-500 mt-1">Item must be in original condition</p>
					</div>
				</div>
				
				{#if listingData?.location_city}
					<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
						<MapPin class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Ships from</p>
							<p class="text-sm text-gray-600 truncate">{listingData?.location_city}</p>
						</div>
					</div>
				{/if}
			</div>
		</TabsContent>
		
		<TabsContent value="seller" class="mt-4 space-y-4 overflow-hidden">
			<SellerProfile 
				seller={listingData?.seller}
				{isOwner}
				variant="tab"
				actions={['viewProfile', 'message']}
				showJoinDate={true}
				showStats={true}
			/>
		</TabsContent>
		</Tabs>
	</div>
</div>