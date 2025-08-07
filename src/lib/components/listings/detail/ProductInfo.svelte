<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';
	
	// Import modular components
	import ProductHeader from './sections/ProductHeader.svelte';
	import ProductDescription from './sections/ProductDescription.svelte';
	import ProductSpecs from './sections/ProductSpecs.svelte';
	import ShippingCard from './cards/ShippingCard.svelte';
	import SellerProfile from '$lib/components/seller/SellerProfile.svelte';

	// Get context
	const context = getListingContext();
	const { listing, isOwner, isFollowing, isFollowLoading, toggleFollow } = context;
</script>

<div class="space-y-4">
	<!-- Product Header with title, price, badges -->
	<ProductHeader />

	<!-- Product Description -->
	<ProductDescription />

	<!-- Product Information Tabs -->
	<Tabs defaultValue="details" class="w-full">
		<TabsList class="grid w-full grid-cols-3">
			<TabsTrigger value="details">{m.product_details()}</TabsTrigger>
			<TabsTrigger value="shipping">{m.shipping_info()}</TabsTrigger>
			<TabsTrigger value="seller">{m.seller_info()}</TabsTrigger>
		</TabsList>
		
		<!-- Details Tab -->
		<TabsContent value="details" class="mt-4">
			<ProductSpecs />
		</TabsContent>
		
		<!-- Shipping Tab -->
		<TabsContent value="shipping" class="mt-4">
			<ShippingCard />
		</TabsContent>
		
		<!-- Seller Tab -->
		<TabsContent value="seller" class="mt-4">
			<SellerProfile 
				seller={listing?.seller}
				isOwner={isOwner()}
				isFollowing={isFollowing()}
				isFollowLoading={isFollowLoading()}
				onFollow={toggleFollow}
				variant="detailed"
				actions={['follow', 'message']}
				showStats={true}
			/>
		</TabsContent>
	</Tabs>
</div>