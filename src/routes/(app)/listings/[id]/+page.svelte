<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { 
		Heart, Share2, MapPin, Shield, Eye, Star,
		ShoppingBag, ChevronLeft, ChevronRight, MessageCircle, 
		UserPlus, UserMinus, Truck, RotateCcw
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import CheckoutFlow from '$lib/components/checkout/CheckoutFlow.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	let listing = $derived(data.listing);
	let currentUser = $derived(data.user);
	let relatedListings = $derived(data.relatedListings);
	let isFollowing = $state(data.isFollowing || false);

	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let showCheckout = $state(false);
	let activeTab = $state('details');

	let isOwner = $derived(currentUser?.id === listing?.seller_id);
	let images = $derived(listing?.images || []);
	let hasMultipleImages = $derived(images.length > 1);

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
		}
	}
</script>

<svelte:head>
	<title>{listing?.title || 'Product'} - Driplo</title>
	<meta name="description" content={listing?.description || 'Check out this item on Driplo'} />
</svelte:head>

{#if listing}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-6 pb-24 max-w-6xl">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Image Gallery Section -->
				<div class="space-y-4">
					<div class="relative bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
						<div class="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
							<img
								src={images[currentImageIndex]}
								alt="Product"
								class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
							/>
							
							<!-- Condition Badge Overlay -->
							{#if listing.condition}
								<div class="absolute top-3 left-3 bg-[#87CEEB] text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
									{getConditionBadge(listing.condition).label}
								</div>
							{/if}
						
						{#if hasMultipleImages}
							<!-- Navigation buttons -->
							<button
								onclick={prevImage}
								class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
							>
								<ChevronLeft class="w-5 h-5" />
							</button>
							<button
								onclick={nextImage}
								class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
							>
								<ChevronRight class="w-5 h-5" />
							</button>

							<!-- Image indicators -->
							<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
								{#each images as _, index}
									<button
										onclick={() => currentImageIndex = index}
										class={cn("w-2 h-2 rounded-full transition-all", 
											index === currentImageIndex ? "bg-white" : "bg-white/50"
										)}
									/>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Thumbnail strip -->
					{#if hasMultipleImages}
						<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
							{#each images as image, index}
								<button
									onclick={() => currentImageIndex = index}
									class={cn("flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
										index === currentImageIndex ? "border-[#87CEEB] shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
									)}
								>
									<img src={image} alt="Product {index + 1}" class="w-full h-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Product Details Section -->
				<div class="space-y-6">
					<!-- Header -->
					<div class="space-y-4">
						<div class="flex items-start justify-between">
							{#if listing.condition}
								<Badge variant="secondary" class="bg-[#87CEEB] text-white">
									{getConditionBadge(listing.condition).label}
								</Badge>
							{/if}
							<div class="flex items-center gap-2">
								<button
									onclick={handleLike}
									class={cn("p-2 rounded-full hover:bg-muted transition-colors",
										isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
									)}
								>
									<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
								</button>
								<button 
									onclick={handleShare}
									class="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
								>
									<Share2 class="w-5 h-5" />
								</button>
							</div>
						</div>
						
						<div>
							<h1 class="text-3xl font-bold text-foreground mb-2">
								{listing.title}
							</h1>
							<p class="text-muted-foreground">
								{listing.description}
							</p>
						</div>

						<div class="flex items-center gap-4">
							<span class="text-3xl font-bold text-[#87CEEB]">{formatCurrency(listing.price)}</span>
							{#if listing.original_price && listing.original_price > listing.price}
								<span class="text-lg text-muted-foreground line-through">{formatCurrency(listing.original_price)}</span>
								<Badge variant="destructive" class="bg-red-100 text-red-700">
									{Math.round((1 - listing.price / listing.original_price) * 100)}% off
								</Badge>
							{/if}
						</div>
					</div>

					<!-- Seller Card -->
					<div class="bg-card border-2 border-border/50 rounded-lg p-4">
						<div class="flex items-center justify-between mb-4">
							<a href="/profile/{listing.seller.username}" class="flex items-center gap-3 group">
								<div class="relative">
									{#if listing.seller.avatar_url}
										<img
											src={listing.seller.avatar_url}
											alt={listing.seller.username}
											class="w-12 h-12 rounded-full object-cover border-2 border-[#87CEEB]"
										/>
									{:else}
										<div class={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#87CEEB]", getAvatarColor(listing.seller.username))}>
											<span class="text-white font-bold">{listing.seller.username.charAt(0).toUpperCase()}</span>
										</div>
									{/if}
									<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
								</div>
								<div>
									<h3 class="font-semibold group-hover:text-[#87CEEB] transition-colors">
										{listing.seller.username}
										{#if listing.seller.verification_badges?.includes('verified')}
											<Shield class="w-4 h-4 text-[#87CEEB] inline ml-1" />
										{/if}
									</h3>
									<div class="flex items-center gap-1 text-sm text-muted-foreground">
										<Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
										<span>{listing.seller.rating || 4.8}</span>
										<span>•</span>
										<span>{listing.seller.sales_count || 0} sales</span>
									</div>
								</div>
							</a>
							{#if !isOwner}
								<button
									onclick={handleFollow}
									class={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
										isFollowing 
											? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
											: "bg-[#87CEEB] text-white hover:bg-[#87CEEB]/90"
									)}
								>
									{isFollowing ? "Following" : "Follow"}
								</button>
							{/if}
						</div>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin class="w-4 h-4" />
							<span>{listing.location || 'Location not specified'}</span>
							<span>•</span>
							<span>Usually ships in 1-2 days</span>
						</div>
					</div>


					<!-- Product Details Tabs -->
					<div class="w-full">
						<div class="grid w-full grid-cols-3 bg-muted rounded-lg p-1">
							<button 
								onclick={() => activeTab = 'details'}
								class={cn("py-2 px-4 rounded-md text-sm font-medium transition-colors",
									activeTab === 'details' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
								)}
							>
								Details
							</button>
							<button 
								onclick={() => activeTab = 'shipping'}
								class={cn("py-2 px-4 rounded-md text-sm font-medium transition-colors",
									activeTab === 'shipping' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
								)}
							>
								Shipping
							</button>
							<button 
								onclick={() => activeTab = 'returns'}
								class={cn("py-2 px-4 rounded-md text-sm font-medium transition-colors",
									activeTab === 'returns' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
								)}
							>
								Returns
							</button>
						</div>
						
						<div class="space-y-4 mt-6">
							{#if activeTab === 'details'}
								<div class="grid grid-cols-2 gap-4 text-sm">
									{#if listing.brand}
										<div><span class="font-medium">Brand:</span> <span class="ml-2 text-muted-foreground">{listing.brand}</span></div>
									{/if}
									{#if listing.size}
										<div><span class="font-medium">Size:</span> <span class="ml-2 text-muted-foreground">{listing.size}</span></div>
									{/if}
									<div><span class="font-medium">Color:</span> <span class="ml-2 text-muted-foreground">Blue</span></div>
									<div><span class="font-medium">Material:</span> <span class="ml-2 text-muted-foreground">100% Cotton</span></div>
									<div><span class="font-medium">Year:</span> <span class="ml-2 text-muted-foreground">2019</span></div>
									{#if listing.category}
										<div><span class="font-medium">Category:</span> <span class="ml-2 text-muted-foreground">{listing.category.name}</span></div>
									{/if}
								</div>
								<div class="border-t border-border pt-4">
									<p class="text-sm text-muted-foreground leading-relaxed">
										{listing.description}
									</p>
								</div>
							{:else if activeTab === 'shipping'}
								<div class="space-y-3">
									<div class="flex items-center gap-3">
										<Truck class="w-5 h-5 text-[#87CEEB]" />
										<div>
											<p class="font-medium">Standard Shipping</p>
											<p class="text-sm text-muted-foreground">3-5 business days • {listing.shipping_cost > 0 ? formatCurrency(listing.shipping_cost) : '$5.99'}</p>
										</div>
									</div>
									<div class="flex items-center gap-3">
										<Shield class="w-5 h-5 text-[#87CEEB]" />
										<div>
											<p class="font-medium">Express Shipping</p>
											<p class="text-sm text-muted-foreground">1-2 business days • $12.99</p>
										</div>
									</div>
								</div>
								<div class="border-t border-border pt-4">
									<p class="text-sm text-muted-foreground">
										Free shipping on orders over $75. All items are carefully packaged and shipped with tracking.
									</p>
								</div>
							{:else if activeTab === 'returns'}
								<div class="flex items-start gap-3">
									<RotateCcw class="w-5 h-5 text-[#87CEEB] mt-0.5" />
									<div>
										<p class="font-medium">30-Day Returns</p>
										<p class="text-sm text-muted-foreground mt-1">
											Items can be returned within 30 days of purchase in original condition. 
											Return shipping costs $3.99 unless the item was damaged or not as described.
										</p>
									</div>
								</div>
								<div class="border-t border-border pt-4">
									<p class="text-sm text-muted-foreground">
										Questions? Contact the seller directly through the message button or reach out to Driplo support.
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-4 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
		<div class="max-w-6xl mx-auto flex gap-3">
			{#if !isOwner}
				<button
					onclick={handleLike}
					class={cn(
						"flex-1 py-3.5 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl",
						isLiked 
							? "bg-red-50 text-red-600 border-2 border-red-200 shadow-red-200/50" 
							: "bg-white border-2 border-blue-100 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-400"
					)}
				>
					<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
					{isLiked ? 'Saved' : 'Save'}
				</button>
				<button
					onclick={handleBuyNow}
					class="flex-1 bg-[#87CEEB] text-white rounded-2xl py-3.5 font-bold hover:bg-[#87CEEB]/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] shadow-blue-300/30"
				>
					<ShoppingBag class="w-5 h-5" />
					Buy Now
				</button>
			{:else}
				<button
					onclick={() => goto(`/listings/${listing.id}/edit`)}
					class="flex-1 bg-[#87CEEB] text-white rounded-2xl py-3.5 font-bold hover:bg-[#87CEEB]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] shadow-blue-300/30"
				>
					Edit Listing
				</button>
			{/if}
		</div>
	</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<p class="text-muted-foreground">Listing not found</p>
	</div>
{/if}

<!-- Checkout Flow -->
{#if listing}
	<CheckoutFlow 
		{listing}
		isOpen={showCheckout}
		onClose={() => showCheckout = false}
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
</style>