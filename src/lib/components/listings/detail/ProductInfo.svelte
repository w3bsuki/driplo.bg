<script lang="ts">
	import AccordionSection from '$lib/components/ui/AccordionSection.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';
	
	// Import modular components
	import ProductHeader from './sections/ProductHeader.svelte';
	import ProductStats from './sections/ProductStats.svelte';
	import SellerBadge from './sections/SellerBadge.svelte';
	import ProductDetailsContent from './sections/ProductDetailsContent.svelte';
	import ShippingCard from './cards/ShippingCard.svelte';
	import SellerProfile from '$lib/components/seller/SellerProfile.svelte';

	// Get context
	const context = getListingContext();
	const { listing, isOwner, isFollowing, isFollowLoading, toggleFollow } = context;
	
	// Accordion state - first section open by default
	let productDetailsOpen = $state(true);
	let shippingOpen = $state(false);
	let sellerOpen = $state(false);
</script>

<div class="space-y-4">
	<!-- Product Header with title, price, badges -->
	<ProductHeader />
	
	<!-- Social Proof Stats -->
	<ProductStats />
	
	<!-- Seller Badge -->
	<SellerBadge />

	<!-- Vertical Accordion Sections -->
	<div class="bg-white rounded-sm border border-gray-200">
		<!-- Product Details Section -->
		<AccordionSection 
			title={m.product_details()}
			bind:isOpen={productDetailsOpen}
			class="px-4"
		>
			<ProductDetailsContent />
		</AccordionSection>
		
		<!-- Shipping & Returns Section -->
		<AccordionSection 
			title={m.shipping_and_returns()}
			bind:isOpen={shippingOpen}
			class="px-4"
		>
			<div class="-mx-4">
				<ShippingCard />
			</div>
		</AccordionSection>
		
		<!-- Seller Section -->
		<AccordionSection 
			title={m.seller_info()}
			bind:isOpen={sellerOpen}
			class="px-4"
		>
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
		</AccordionSection>
	</div>
</div>