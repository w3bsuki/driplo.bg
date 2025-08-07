<script lang="ts">
	import SellerProfile from '$lib/components/seller/SellerProfile.svelte';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	// Get context instead of props (eliminates prop drilling)
	const { 
		listing,
		isOwner,
		isFollowing,
		isFollowLoading,
		toggleFollow
	} = getListingContext();
</script>

<SellerProfile 
	seller={listing.seller}
	isOwner={isOwner()}
	isFollowing={isFollowing()}
	isFollowLoading={isFollowLoading()}
	onFollow={toggleFollow}
	variant="compact"
	actions={['follow']}
	showStats={true}
/>

