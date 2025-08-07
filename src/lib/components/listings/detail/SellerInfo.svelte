<script lang="ts">
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
	const isOwner = $derived(() => context ? context.isOwner() : (currentUser?.id === listingData?.user_id));
	const isFollowing = $derived(() => context ? context.isFollowing() : listingStore.isFollowing(listingData?.seller?.id || ''));
	const isFollowLoading = $derived(() => context ? context.isFollowLoading() : false);
	
	const toggleFollow = () => {
		if (context) {
			context.toggleFollow();
		} else if (listingData?.seller?.id) {
			listingStore.toggleFollow(listingData.seller.id);
		}
	};
</script>

<SellerProfile 
	seller={listingData?.seller}
	isOwner={isOwner()}
	isFollowing={isFollowing()}
	isFollowLoading={isFollowLoading()}
	onFollow={toggleFollow}
	variant="compact"
	actions={['follow']}
	showStats={true}
/>

