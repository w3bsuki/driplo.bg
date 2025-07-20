<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { 
		Heart, Share2, MapPin, Shield, Eye, Star,
		ShoppingBag, ChevronLeft, ChevronRight, MessageCircle, 
		UserPlus, UserMinus, Truck, RotateCcw, Info, FileText,
		Ruler, Palette, Tag, Package
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import CheckoutFlow from '$lib/components/checkout/CheckoutFlow.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';

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

	let isOwner = $derived(currentUser?.id === listing?.seller_id);
	let images = $derived(listing?.images?.map(img => typeof img === 'string' ? img : img.url) || []);
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
							
							<!-- Sold Badge Overlay -->
							{#if listing.status === 'sold'}
								<div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
									Sold
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
							<span>{listing.location_city || listing.location_country || 'Location not specified'}</span>
							<span>•</span>
							<span>Usually ships in 1-2 days</span>
						</div>
					</div>


					<!-- Product Details Tabs -->
					<Tabs bind:value={activeTab} class="w-full">
						<TabsList class="grid w-full grid-cols-3 h-auto p-1">
							<TabsTrigger value="description" class="flex items-center gap-2">
								<FileText class="w-4 h-4" />
								Description
							</TabsTrigger>
							<TabsTrigger value="details" class="flex items-center gap-2">
								<Info class="w-4 h-4" />
								Details
							</TabsTrigger>
							<TabsTrigger value="shipping" class="flex items-center gap-2">
								<Package class="w-4 h-4" />
								Shipping
							</TabsTrigger>
						</TabsList>
						
						<TabsContent value="description" class="mt-6">
							<div class="space-y-4">
								<p class="text-sm text-muted-foreground leading-relaxed">
									{listing.description}
								</p>
								
								<!-- Product Attributes as Badges -->
								<div class="flex flex-wrap gap-2 pt-4">
									{#if listing.size}
										<Badge variant="secondary" class="flex items-center gap-1.5">
											<Ruler class="w-3.5 h-3.5" />
											Size {listing.size}
										</Badge>
									{/if}
									{#if listing.color}
										<Badge variant="secondary" class="flex items-center gap-1.5">
											<Palette class="w-3.5 h-3.5" />
											{listing.color}
										</Badge>
									{/if}
									{#if listing.tags && listing.tags.length > 0}
										{#each listing.tags.slice(0, 3) as tag}
											<Badge variant="outline" class="flex items-center gap-1.5">
												<Tag class="w-3.5 h-3.5" />
												{tag}
											</Badge>
										{/each}
									{/if}
								</div>
							</div>
						</TabsContent>
						
						<TabsContent value="details" class="mt-6">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{#if listing.brand}
									<div class="flex justify-between">
										<span class="font-medium text-sm">Brand</span>
										<span class="text-sm text-muted-foreground">{listing.brand}</span>
									</div>
								{/if}
								{#if listing.category}
									<div class="flex justify-between">
										<span class="font-medium text-sm">Category</span>
										<span class="text-sm text-muted-foreground">{listing.category.name}</span>
									</div>
								{/if}
								{#if listing.material}
									<div class="flex justify-between">
										<span class="font-medium text-sm">Material</span>
										<span class="text-sm text-muted-foreground">{listing.material}</span>
									</div>
								{/if}
								{#if listing.condition}
									<div class="flex justify-between">
										<span class="font-medium text-sm">Condition</span>
										<span class="text-sm text-muted-foreground">{getConditionBadge(listing.condition).label}</span>
									</div>
								{/if}
								<div class="flex justify-between">
									<span class="font-medium text-sm">Item ID</span>
									<span class="text-sm text-muted-foreground">#{listing.id.slice(0, 8)}</span>
								</div>
								<div class="flex justify-between">
									<span class="font-medium text-sm">Listed</span>
									<span class="text-sm text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()}</span>
								</div>
							</div>
						</TabsContent>
						
						<TabsContent value="shipping" class="mt-6">
							<div class="space-y-4">
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
								<div class="flex items-start gap-3 pt-4">
									<RotateCcw class="w-5 h-5 text-[#87CEEB] mt-0.5" />
									<div>
										<p class="font-medium">Easy Returns</p>
										<p class="text-sm text-muted-foreground mt-1">
											Items can be returned within 30 days of purchase in original condition. 
											Return shipping costs $3.99.
										</p>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
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