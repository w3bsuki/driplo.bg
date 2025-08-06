<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import LazyCheckoutFlow from '$lib/components/checkout/LazyCheckoutFlow.svelte';
	import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui/breadcrumb';
	import ProductGallery from '$lib/components/listings/detail/ProductGallery.svelte';
	import ProductInfo from '$lib/components/listings/detail/ProductInfo.svelte';
	import SellerInfo from '$lib/components/listings/detail/SellerInfo.svelte';
	import ProductActions from '$lib/components/listings/detail/ProductActions.svelte';
	import RelatedProducts from '$lib/components/listings/detail/RelatedProducts.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	let listing = $derived(data.listing);
	let currentUser = $derived(data.user);
	let relatedListings = $derived(data.relatedListings);
	let isFollowing = $state(data.isFollowing || false);

	let isLiked = $state(data.isLiked || false);
	let showCheckout = $state(false);
	let isFollowLoading = $state(false);
	let isLikeLoading = $state(false);
	let showFullscreenGallery = $state(false);
	let checkoutFlowRef: any;

	let isOwner = $derived(currentUser?.id === listing?.user_id);
	let images = $derived(() => {
		if (!listing) return [];
		
		// Try images field first (this is what the database actually uses)
		if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
			return listing.images.filter(img => img && typeof img === 'string');
		}
		
		// Then try image_urls
		if (listing.image_urls && Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
			return listing.image_urls.filter(url => url && typeof url === 'string');
		}
		
		// Handle other formats just in case
		if (listing.image_urls) {
			if (typeof listing.image_urls === 'object' && !Array.isArray(listing.image_urls)) {
				return Object.values(listing.image_urls).filter(url => url && typeof url === 'string');
			}
			if (typeof listing.image_urls === 'string') {
				return [listing.image_urls];
			}
		}
		
		if (listing.images) {
			if (typeof listing.images === 'object' && !Array.isArray(listing.images)) {
				return Object.values(listing.images).filter(url => url && typeof url === 'string');
			}
			if (typeof listing.images === 'string') {
				return [listing.images];
			}
		}
		
		// Fallback to single image field if it exists
		if (listing.image && typeof listing.image === 'string') {
			return [listing.image];
		}
		
		
		return [];
	});

	async function handleLike() {
		if (!currentUser) {
			goto('/login');
			return;
		}
		
		if (isLikeLoading || !listing) return;
		
		// Optimistic update
		const previousLiked = isLiked;
		isLiked = !isLiked;
		isLikeLoading = true;
		
		try {
			const response = await fetch('/api/wishlist', {
				method: isLiked ? 'POST' : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ listing_id: listing.id })
			});
			
			if (!response.ok) {
				// Revert on error
				isLiked = previousLiked;
				const error = await response.json();
				toast.error(error.message || 'Failed to update favorites');
			} else {
				// Update like count
				if (listing) {
					listing.like_count = (listing.like_count || 0) + (isLiked ? 1 : -1);
				}
			}
		} catch (error) {
			// Revert on error
			isLiked = previousLiked;
			toast.error('Failed to update favorites');
		} finally {
			isLikeLoading = false;
		}
	}

	function handleBuyNow() {
		if (!currentUser) {
			goto('/login');
			return;
		}
		showCheckout = true;
	}

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: listing?.title,
					text: listing?.description,
					url: window.location.href
				});
			} catch (err) {
				}
		}
	}

	async function handleFollow() {
		if (!currentUser || !listing) {
			goto('/login');
			return;
		}
		
		isFollowLoading = true;
		try {
			if (isFollowing) {
				await supabase
					.from('user_follows')
					.delete()
					.eq('follower_id', currentUser.id)
					.eq('following_id', listing.user_id);
				isFollowing = false;
				toast.success(m.profile_unfollow_success());
			} else {
				await supabase
					.from('user_follows')
					.insert({
						follower_id: currentUser.id,
						following_id: listing.user_id
					});
				isFollowing = true;
				toast.success(m.profile_follow_success());
			}
		} catch (error) {
			console.error('Follow error:', error);
			toast.error(m.profile_follow_update_error());
		} finally {
			isFollowLoading = false;
		}
	}

	// Track view for anonymous users on mount
	onMount(() => {
		if (!currentUser && listing) {
			// Generate or get session ID for anonymous users
			let sessionId = sessionStorage.getItem('session_id');
			if (!sessionId) {
				sessionId = crypto.randomUUID();
				sessionStorage.setItem('session_id', sessionId);
			}
			
			// Track the view
			fetch('/api/views', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					listing_id: listing.id,
					session_id: sessionId
				})
			}).catch(() => {
				// Silent failure - view tracking is not critical
			});
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{listing?.title || 'Product'} - Driplo</title>
	<meta name="description" content={listing?.description || 'Check out this item on Driplo'} />
</svelte:head>

{#if listing}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-2 pb-20 max-w-7xl">
			<!-- Breadcrumb Navigation -->
			<Breadcrumb class="mb-4">
				<BreadcrumbItem>
					<BreadcrumbLink href="/">{m.header_home()}</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="/browse">{m.header_browse()}</BreadcrumbLink>
				</BreadcrumbItem>
				{#if listing.category}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/browse?category={listing.category}">{listing.category}</BreadcrumbLink>
					</BreadcrumbItem>
				{/if}
				{#if listing.subcategory}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/browse?category={listing.category}&subcategory={listing.subcategory}">{listing.subcategory}</BreadcrumbLink>
					</BreadcrumbItem>
				{/if}
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink>{listing.title}</BreadcrumbLink>
				</BreadcrumbItem>
			</Breadcrumb>
			
			<div class="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-3">
				<!-- Image Gallery Section -->
				<ProductGallery 
					{images}
					title={listing.title}
					status={listing.status}
					bind:showFullscreenGallery
				/>

				<!-- Product Details Section -->
				<div class="space-y-3">
					<ProductInfo 
						{listing}
						{isLiked}
						{isOwner}
						onLike={handleLike}
						onShare={handleShare}
					/>

					<SellerInfo 
						seller={listing.seller}
						{isOwner}
						{isFollowing}
						{isFollowLoading}
						onFollow={handleFollow}
					/>

					<ProductActions 
						{listing}
						{isOwner}
						{isLiked}
						onLike={handleLike}
						onBuyNow={handleBuyNow}
						{checkoutFlowRef}
					/>
				</div>
			</div>

			<RelatedProducts {relatedListings} />
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-2 pb-20 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-3">
				<!-- Image skeleton -->
				<div class="space-y-2">
					<div class="relative bg-white rounded-sm  border border-gray-200/60 p-2">
						<div class="aspect-square bg-gray-100 rounded-sm animate-pulse"></div>
					</div>
					<div class="flex gap-1.5">
						{#each Array(4) as _, index (index)}
							<div class="w-12 h-12 bg-gray-100 rounded-sm animate-pulse"></div>
						{/each}
					</div>
				</div>
				
				<!-- Details skeleton -->
				<div class="space-y-3">
					<div class="space-y-2">
						<div class="h-6 w-3/4 bg-gray-100 rounded-sm animate-pulse"></div>
						<div class="h-8 w-24 bg-gray-100 rounded-sm animate-pulse"></div>
						<div class="flex gap-2">
							<div class="h-6 w-16 bg-gray-100 rounded-sm animate-pulse"></div>
							<div class="h-6 w-20 bg-gray-100 rounded-sm animate-pulse"></div>
							<div class="h-6 w-16 bg-gray-100 rounded-sm animate-pulse"></div>
						</div>
						<div class="h-12 w-full bg-gray-100 rounded-sm animate-pulse"></div>
					</div>
					
					<div class="border border-gray-200 rounded-sm p-3">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
							<div class="space-y-1 flex-1">
								<div class="h-3 w-20 bg-gray-100 rounded-sm animate-pulse"></div>
								<div class="h-2 w-16 bg-gray-100 rounded-sm animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}


<!-- Checkout Flow -->
{#if listing}
	<LazyCheckoutFlow 
		{listing}
		isOpen={showCheckout}
		onClose={() => showCheckout = false}
		bind:this={checkoutFlowRef}
	/>
{/if}

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	/* Compact modern styles */
	:global(.compact-shadow) {
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}
	
	/* Hover states */
	:global(.hover-lift) {
		transition: transform 0.2s ease-out;
	}
	:global(.hover-lift:hover) {
		transform: translateY(-1px);
	}
</style>