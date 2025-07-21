<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { 
		Heart, Share2, MapPin, Shield, Eye, Star,
		ShoppingBag, ChevronLeft, ChevronRight, MessageCircle, 
		UserPlus, UserMinus, Truck, RotateCcw, Info, FileText,
		Ruler, Palette, Tag, Package, X, ZoomIn, Maximize2
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import LazyCheckoutFlow from '$lib/components/checkout/LazyCheckoutFlow.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import ResponsiveImage from '$lib/components/ui/ResponsiveImage.svelte';
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	let listing = $derived(data.listing);
	let currentUser = $derived(data.user);
	let relatedListings = $derived(data.relatedListings);
	let isFollowing = $state(data.isFollowing || false);

	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let showCheckout = $state(false);
	let activeTab = $state('description');
	let isFollowLoading = $state(false);
	let showFullscreenGallery = $state(false);
	let isDescriptionExpanded = $state(false);
	let checkoutFlowRef: any;

	let isOwner = $derived(currentUser?.id === listing?.seller_id);
	let images = $derived(() => {
		if (!listing) return [];
		if (listing.image_urls && Array.isArray(listing.image_urls)) {
			return listing.image_urls;
		}
		if (listing.images && Array.isArray(listing.images)) {
			return listing.images.map(img => {
				if (typeof img === 'string') return img;
				if (img && typeof img === 'object' && img.url) return img.url;
				return null;
			}).filter(Boolean);
		}
		return [];
	});
	let hasMultipleImages = $derived(images && images.length > 1);
	let hasImages = $derived(images && images.length > 0);

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}

	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	}

	async function handleLike() {
		if (!currentUser) {
			goto('/login');
			return;
		}
		isLiked = !isLiked;
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
				console.log('Error sharing:', err);
			}
		}
	}

	function getAvatarColor(username: string): string {
		const colors = [
			'bg-blue-400', 'bg-blue-300', 'bg-blue-500', 
			'bg-cyan-400', 'bg-sky-400', 'bg-indigo-400'
		];
		return colors[username.charCodeAt(0) % colors.length];
	}

	function getConditionBadge(condition: string) {
		switch(condition) {
			case 'new_with_tags': return { label: 'New with tags', variant: 'default' };
			case 'like_new': return { label: 'Like New', variant: 'default' };
			case 'good': return { label: 'Good', variant: 'secondary' };
			case 'worn': return { label: 'Worn', variant: 'outline' };
			default: return { label: condition, variant: 'secondary' };
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
					.eq('following_id', listing.seller_id);
				isFollowing = false;
				toast.success(m.profile_unfollow_success());
			} else {
				await supabase
					.from('user_follows')
					.insert({
						follower_id: currentUser.id,
						following_id: listing.seller_id
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

	function openFullscreenGallery(index: number = currentImageIndex) {
		currentImageIndex = index;
		showFullscreenGallery = true;
		document.body.style.overflow = 'hidden';
	}

	function closeFullscreenGallery() {
		showFullscreenGallery = false;
		document.body.style.overflow = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showFullscreenGallery) return;
		
		switch(e.key) {
			case 'ArrowLeft':
				prevImage();
				break;
			case 'ArrowRight':
				nextImage();
				break;
			case 'Escape':
				closeFullscreenGallery();
				break;
		}
	}

	onMount(() => {
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>{listing?.title || 'Product'} - Driplo</title>
	<meta name="description" content={listing?.description || 'Check out this item on Driplo'} />
</svelte:head>

{#if listing}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-4 pb-20 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6">
				<!-- Image Gallery Section -->
				<div class="space-y-3">
					<div class="relative bg-white rounded-lg shadow-sm border border-gray-200/60 p-2">
						<button 
							onclick={() => hasImages && openFullscreenGallery()}
							class="relative aspect-square overflow-hidden rounded-md bg-gray-50 w-full group cursor-zoom-in"
							disabled={!hasImages}
						>
							{#if images[currentImageIndex]}
								<ResponsiveImage
									src={images[currentImageIndex]}
									alt={listing.title}
									class="w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
									preferredSize="large"
									loading="eager"
								/>
							{:else}
								<div class="w-full h-full bg-gray-100 flex items-center justify-center">
									<span class="text-gray-400">No image</span>
								</div>
							{/if}
							
							<!-- Zoom indicator -->
							<div class="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<Maximize2 class="w-4 h-4" />
							</div>
							
							<!-- Sold Badge Overlay -->
							{#if listing.status === 'sold'}
								<div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
									Sold
								</div>
							{/if}
						
						{#if hasMultipleImages}
							<!-- Navigation buttons -->
							<button
								onclick={(e) => { e.stopPropagation(); prevImage(); }}
								class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
							>
								<ChevronLeft class="w-4 h-4" />
							</button>
							<button
								onclick={(e) => { e.stopPropagation(); nextImage(); }}
								class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
							>
								<ChevronRight class="w-4 h-4" />
							</button>

							<!-- Image indicators -->
							<div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
								{#each images as _, index}
									<button
										onclick={(e) => { e.stopPropagation(); currentImageIndex = index; }}
										class={cn("w-1 h-1 rounded-full transition-all", 
											index === currentImageIndex ? "bg-white w-4" : "bg-white/60"
										)}
									/>
								{/each}
							</div>
						{/if}
					</button>
					</div>

					<!-- Thumbnail strip -->
					{#if hasMultipleImages}
						<div class="flex gap-1.5 overflow-x-auto scrollbar-hide">
							{#each images as image, index}
								<button
									onclick={() => currentImageIndex = index}
									class={cn("flex-shrink-0 w-12 h-12 rounded overflow-hidden border transition-all",
										index === currentImageIndex ? "border-[#87CEEB] shadow-sm" : "border-gray-200 opacity-80 hover:opacity-100"
									)}
								>
									{#if image}
										<ResponsiveImage 
											src={image} 
											alt="Product {index + 1}" 
											class="w-full h-full" 
											objectFit="cover"
											preferredSize="thumb"
											loading="eager"
										/>
									{:else}
										<div class="w-full h-full bg-gray-100"></div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Product Details Section -->
				<div class="space-y-4">
					<!-- Header -->
					<div class="space-y-3">
						<div class="flex items-center justify-between gap-2">
							<h1 class="text-xl font-semibold text-foreground flex-1">
								{listing.title}
							</h1>
							<div class="flex items-center gap-1">
								<button
									onclick={handleLike}
									class={cn("p-1.5 rounded-md hover:bg-gray-100 transition-colors",
										isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
									)}
								>
									<Heart class={cn("w-4 h-4", isLiked && "fill-current")} />
								</button>
								<button 
									onclick={handleShare}
									class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
								>
									<Share2 class="w-4 h-4" />
								</button>
							</div>
						</div>
						
						<div class="flex items-center gap-3">
							<span class="text-2xl font-bold text-[#87CEEB]">{formatCurrency(listing.price)}</span>
							{#if listing.original_price && listing.original_price > listing.price}
								<span class="text-sm text-gray-500 line-through">{formatCurrency(listing.original_price)}</span>
								<Badge variant="destructive" class="text-xs px-1.5 py-0.5">
									{Math.round((1 - listing.price / listing.original_price) * 100)}% off
								</Badge>
							{/if}
						</div>

						<!-- Quick info chips -->
						<div class="flex items-center gap-2 flex-wrap text-sm">
							{#if listing.size}
								<span class="px-2 py-0.5 bg-gray-100 rounded text-gray-700">Size {listing.size}</span>
							{/if}
							{#if listing.condition}
								<span class="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{getConditionBadge(listing.condition).label}</span>
							{/if}
							{#if listing.brand}
								<span class="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{listing.brand}</span>
							{/if}
						</div>

						<!-- Compact description -->
						<div class="text-sm text-gray-600">
							{#if isDescriptionExpanded || listing.description.length <= 100}
								<p>{listing.description}</p>
							{:else}
								<p>
									{listing.description.slice(0, 100)}...
									<button 
										onclick={() => isDescriptionExpanded = true}
										class="text-[#87CEEB] hover:underline ml-1"
									>
										See more
									</button>
								</p>
							{/if}
						</div>
					</div>

					<!-- Compact Seller Card -->
					<div class="border border-gray-200 rounded-lg p-3">
						<div class="flex items-center justify-between">
							<a href="/profile/{listing.seller.username}" class="flex items-center gap-2 group flex-1">
								{#if listing.seller.avatar_url}
									<ResponsiveImage
										src={listing.seller.avatar_url}
										alt={listing.seller.username}
										class="w-8 h-8 rounded-full"
										objectFit="cover"
										preferredSize="thumb"
									/>
								{:else}
									<div class={cn("w-8 h-8 rounded-full flex items-center justify-center", getAvatarColor(listing.seller.username))}>
										<span class="text-white text-xs font-medium">{listing.seller.username.charAt(0).toUpperCase()}</span>
									</div>
								{/if}
								<div>
									<div class="flex items-center gap-1">
										<span class="text-sm font-medium group-hover:text-[#87CEEB] transition-colors">
											{listing.seller.username}
										</span>
										{#if listing.seller.account_type === 'brand'}
											<BrandBadge size="xs" isVerified={listing.seller.is_verified} showText={false} />
										{/if}
									</div>
									<div class="flex items-center gap-1 text-xs text-gray-500">
										<Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
										<span>{listing.seller.rating || 4.8}</span>
										<span>•</span>
										<span>{listing.seller.sales_count || 0} sales</span>
									</div>
								</div>
							</a>
							{#if !isOwner}
								<button
									onclick={handleFollow}
									disabled={isFollowLoading}
									class={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all",
										isFollowing 
											? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
											: "bg-[#87CEEB] text-white hover:bg-[#87CEEB]/90",
										isFollowLoading && "opacity-50 cursor-not-allowed"
									)}
								>
									{#if isFollowLoading}
										<Spinner size="sm" color={isFollowing ? "current" : "white"} />
									{:else}
										{isFollowing ? "Following" : "Follow"}
									{/if}
								</button>
							{/if}
						</div>
					</div>


					<!-- Compact Details Section -->
					<div class="space-y-3">
						<!-- Product details -->
						<div class="space-y-2">
							<h3 class="text-sm font-medium text-gray-900">Details</h3>
							<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
								{#if listing.material}
									<div class="text-gray-500">Material</div>
									<div class="text-gray-700">{listing.material}</div>
								{/if}
								{#if listing.category}
									<div class="text-gray-500">Category</div>
									<div class="text-gray-700">{listing.category.name}</div>
								{/if}
								<div class="text-gray-500">Listed</div>
								<div class="text-gray-700">{new Date(listing.created_at).toLocaleDateString()}</div>
							</div>
						</div>

						<!-- Shipping info -->
						<div class="space-y-2">
							<h3 class="text-sm font-medium text-gray-900">Shipping</h3>
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Truck class="w-3.5 h-3.5" />
								<span>Standard: 3-5 days • {listing.shipping_cost > 0 ? formatCurrency(listing.shipping_cost) : '$5.99'}</span>
							</div>
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<RotateCcw class="w-3.5 h-3.5" />
								<span>30-day returns</span>
							</div>
						</div>

						<!-- Tags -->
						{#if listing.tags && listing.tags.length > 0}
							<div class="flex flex-wrap gap-1.5">
								{#each listing.tags as tag}
									<span class="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
										#{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Compact Bottom Bar -->
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
		<div class="max-w-7xl mx-auto flex items-center gap-2">
			<div class="flex-1">
				<div class="text-xl font-bold text-[#87CEEB]">{formatCurrency(listing.price)}</div>
				<div class="text-xs text-gray-500">{listing.shipping_cost > 0 ? `+ ${formatCurrency(listing.shipping_cost)} shipping` : 'Free shipping'}</div>
			</div>
			{#if !isOwner}
				<button
					onclick={handleLike}
					class={cn(
						"p-2.5 rounded-lg transition-all duration-200 transform active:scale-[0.98]",
						isLiked 
							? "bg-red-50 text-red-600 border border-red-200" 
							: "bg-gray-100 text-gray-600 hover:bg-gray-200"
					)}
				>
					<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
				</button>
				<button
					onclick={handleBuyNow}
					onmouseenter={() => checkoutFlowRef?.preload()}
					onfocus={() => checkoutFlowRef?.preload()}
					class="bg-[#87CEEB] text-white rounded-lg px-6 py-2.5 font-medium hover:bg-[#87CEEB]/90 transition-all duration-200 transform active:scale-[0.98]"
				>
					Buy Now
				</button>
			{:else}
				<button
					onclick={() => goto(`/listings/${listing.id}/edit`)}
					class="bg-[#87CEEB] text-white rounded-lg px-6 py-2.5 font-medium hover:bg-[#87CEEB]/90 transition-all duration-200 transform active:scale-[0.98]"
				>
					Edit Listing
				</button>
			{/if}
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-4 pb-20 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6">
				<!-- Image skeleton -->
				<div class="space-y-3">
					<div class="relative bg-white rounded-lg shadow-sm border border-gray-200/60 p-2">
						<div class="aspect-square bg-gray-100 rounded-md animate-pulse"></div>
					</div>
					<div class="flex gap-1.5">
						{#each Array(4) as _}
							<div class="w-12 h-12 bg-gray-100 rounded animate-pulse"></div>
						{/each}
					</div>
				</div>
				
				<!-- Details skeleton -->
				<div class="space-y-4">
					<div class="space-y-3">
						<div class="h-6 w-3/4 bg-gray-100 rounded animate-pulse"></div>
						<div class="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
						<div class="flex gap-2">
							<div class="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
							<div class="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
							<div class="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
						</div>
						<div class="h-12 w-full bg-gray-100 rounded animate-pulse"></div>
					</div>
					
					<div class="border border-gray-200 rounded-lg p-3">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
							<div class="space-y-1 flex-1">
								<div class="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
								<div class="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Full-screen Gallery -->
{#if showFullscreenGallery}
	<div 
		class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
		transition:fade={{ duration: 200 }}
		onclick={closeFullscreenGallery}
	>
		<div class="relative w-full h-full flex items-center justify-center p-4">
			<!-- Close button -->
			<button
				onclick={closeFullscreenGallery}
				class="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
			>
				<X class="w-6 h-6" />
			</button>

			<!-- Image container -->
			<div class="relative max-w-full max-h-full" onclick={(e) => e.stopPropagation()}>
				{#if images[currentImageIndex]}
					<img
						src={images[currentImageIndex]}
						alt={listing.title}
						class="max-w-full max-h-[90vh] object-contain"
					/>
				{/if}

				{#if hasMultipleImages}
					<!-- Navigation buttons -->
					<button
						onclick={(e) => { e.stopPropagation(); prevImage(); }}
						class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
					>
						<ChevronLeft class="w-6 h-6" />
					</button>
					<button
						onclick={(e) => { e.stopPropagation(); nextImage(); }}
						class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
					>
						<ChevronRight class="w-6 h-6" />
					</button>
				{/if}
			</div>

			<!-- Thumbnail strip -->
			{#if hasMultipleImages}
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
					{#each images as _, index}
						<button
							onclick={(e) => { e.stopPropagation(); currentImageIndex = index; }}
							class={cn("w-12 h-12 rounded overflow-hidden border-2 transition-all",
								index === currentImageIndex ? "border-white" : "border-white/30 opacity-60 hover:opacity-100"
							)}
						>
							<img 
								src={images[index]} 
								alt="Thumbnail {index + 1}" 
								class="w-full h-full object-cover"
							/>
						</button>
					{/each}
				</div>
			{/if}
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