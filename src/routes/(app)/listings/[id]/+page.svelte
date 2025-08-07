<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import LazyCheckoutFlow from '$lib/components/checkout/LazyCheckoutFlow.svelte';
	import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui/breadcrumb';
	import ProductGallery from '$lib/components/listings/detail/ProductGallery.svelte';
	import ProductInfo from '$lib/components/listings/detail/ProductInfo.svelte';
	import SellerInfo from '$lib/components/listings/detail/SellerInfo.svelte';
	import ProductActions from '$lib/components/listings/detail/ProductActions.svelte';
	import RelatedProducts from '$lib/components/listings/detail/RelatedProducts.svelte';
	import { onMount } from 'svelte';
	import { listingStore } from '$lib/stores/listing.svelte.ts';
	import { createListingContext } from '$lib/contexts/listing.svelte.ts';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	let listing = $derived(data.listing);
	let currentUser = $derived(data.user);
	let relatedListings = $derived(data.relatedListings);

	// Local UI state (non-shared state stays local)
	let showCheckout = $state(false);
	let showFullscreenGallery = $state(false);
	let checkoutFlowRef = $state<any>();

	// Initialize store with server data
	$effect(() => {
		if (listing && currentUser !== undefined) {
			listingStore.initialize({
				isLiked: data.isLiked,
				isFollowing: data.isFollowing,
				listingId: listing.id,
				sellerId: listing.seller?.id || listing.user_id
			});
		}
	});

	// Create context for child components (eliminates prop drilling)
	let listingContext: ReturnType<typeof createListingContext>;
	$effect(() => {
		if (listing && currentUser !== undefined) {
			listingContext = createListingContext(listing, currentUser, supabase);
		}
	});
	// Derived computed values
	let images = $derived(() => {
		if (!listing || !listing.images) return [];
		
		// images field should be a string array
		if (Array.isArray(listing.images)) {
			return listing.images.filter(img => img && typeof img === 'string');
		}
		
		return [];
	});

	// Simplified buy now handler (purchase tracking handled by store)
	function handleBuyNow() {
		if (!currentUser) {
			goto('/login');
			return;
		}
		
		// Track purchase intent
		listingStore.startPurchase(listing.id);
		showCheckout = true;
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
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink>{listing.title}</BreadcrumbLink>
				</BreadcrumbItem>
			</Breadcrumb>
			
			<div class="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-3">
				<!-- Image Gallery Section -->
				<ProductGallery 
					images={images()}
					title={listing.title}
					status={listing.status}
					bind:showFullscreenGallery
				/>

				<!-- Product Details Section -->
				<div class="space-y-3">
					<!-- Components now use context instead of props -->
					<ProductInfo />

					<SellerInfo />

					<ProductActions 
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
	
	/* Compact modern styles */
	:global(.compact-shadow) {
		box-shadow: var(--shadow-card);
	}
	
	/* Hover states */
	:global(.hover-lift) {
		transition: transform 0.2s ease-out;
	}
	:global(.hover-lift:hover) {
		transform: translateY(-1px);
	}
</style>