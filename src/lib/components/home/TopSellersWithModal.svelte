<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import TopSellers from './TopSellers.svelte';
	import SellerQuickView from './SellerQuickView.svelte';
	import type { Profile, Listing } from '$lib/types/unified';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database.types';
	import { logger } from '$lib/services/logger';

	interface Props {
		topSellers: Profile[];
		supabase: SupabaseClient<Database>;
	}

	let { topSellers, supabase }: Props = $props();

	let selectedSeller: Profile | null = $state(null);
	let isModalOpen = $state(false);
	let sellerTopListings: Listing[] = $state([]);
	let isLoadingListings = $state(false);
	let isFollowing = $state(false);
	let followerCount = $state(0);
	let isFollowLoading = $state(false);

	async function handleSellerClick(seller: Profile) {
		selectedSeller = seller;
		isModalOpen = true;
		isLoadingListings = true;
		
		try {
			// Fetch seller's top listings and follow status in parallel
			const [listingsResponse, followStatusResponse] = await Promise.all([
				supabase
					.from('listings')
					.select(`
						*,
						seller:profiles!seller_id(username, avatar_url)
					`)
					.eq('seller_id', seller.id)
					.eq('status', 'active')
					.order('view_count', { ascending: false })
					.limit(3),
				
				fetch(`/api/users/${seller.id}/follow-status`)
			]);

			sellerTopListings = listingsResponse.data || [];
			
			// Update follow status
			if (followStatusResponse.ok) {
				const followData = await followStatusResponse.json();
				isFollowing = followData.is_following;
				followerCount = followData.follower_count;
			}
		} catch (error) {
			logger.error('Error fetching seller data', { sellerId: seller.id, error });
			sellerTopListings = [];
			isFollowing = false;
			followerCount = 0;
		} finally {
			isLoadingListings = false;
		}
	}

	function handleCloseModal() {
		isModalOpen = false;
		selectedSeller = null;
		sellerTopListings = [];
		isFollowing = false;
		followerCount = 0;
	}

	function handleViewStore(seller: Profile) {
		goto(`/profile/${seller.username}`);
		handleCloseModal();
	}

	async function handleFollowSeller(seller: Profile) {
		if (!seller) return;

		isFollowLoading = true;
		
		try {
			const method = isFollowing ? 'DELETE' : 'POST';
			const response = await fetch(`/api/users/${seller.id}/follow`, {
				method,
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
			}

			// Update state optimistically
			isFollowing = !isFollowing;
			followerCount = data.follower_count;

			// Show success message
			const action = isFollowing ? 'following' : 'unfollowed';
			toast.success(`${data.message || `Successfully ${action} ${seller.username}`}`);

			logger.info('Follow action completed', { 
				sellerId: seller.id, 
				sellerUsername: seller.username,
				action: isFollowing ? 'follow' : 'unfollow'
			});

		} catch (error) {
			logger.error('Follow action failed', { 
				sellerId: seller.id, 
				sellerUsername: seller.username,
				isFollowing,
				error: error instanceof Error ? error.message : 'Unknown error' 
			});
			
			toast.error(error instanceof Error ? error.message : `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
		} finally {
			isFollowLoading = false;
		}
	}
</script>

<TopSellers {topSellers} onSellerClick={handleSellerClick} />

<SellerQuickView
	seller={selectedSeller}
	topListings={sellerTopListings}
	isOpen={isModalOpen}
	{isFollowing}
	{followerCount}
	isFollowLoading={isFollowLoading}
	onClose={handleCloseModal}
	onViewStore={handleViewStore}
	onFollowSeller={handleFollowSeller}
/>