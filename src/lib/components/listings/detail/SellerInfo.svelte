<script lang="ts">
	import SellerProfile from '$lib/components/seller/SellerProfile.svelte';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	// Get context - this component requires context to be set
	const context = getListingContext();
	const { listing, isOwner, isFollowing, isFollowLoading, toggleFollow } = context;
</script>

<SellerProfile 
	seller={listing?.seller}
	isOwner={isOwner()}
	isFollowing={isFollowing()}
	isFollowLoading={isFollowLoading()}
	onFollow={toggleFollow}
	variant="compact"
	actions={['follow']}
	showStats={true}
/>