<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { user } from '$lib/stores/auth'
	import { supabase } from '$lib/supabase'
	import { Button } from '$lib/components/ui'
	import { Badge } from '$lib/components/ui/badge'
	import { Card } from '$lib/components/ui/card'
	import { toast } from 'svelte-sonner'
	import { 
		Heart, Share2, ShieldCheck, MapPin, Calendar, 
		Eye, ArrowLeft, MessageCircle, User, ChevronLeft, 
		ChevronRight, Star, Package, Truck, CreditCard
	} from 'lucide-svelte'
	// Utility function for time formatting
	function formatTimeAgo(date: string): string {
		const now = new Date()
		const past = new Date(date)
		const diffMs = now.getTime() - past.getTime()
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		const diffMonths = Math.floor(diffDays / 30)
		const diffYears = Math.floor(diffDays / 365)
		
		if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''}`
		if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
		if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`
		return 'Today'
	}
	import { cn } from '$lib/utils'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
	
	// Image gallery state
	let currentImageIndex = $state(0)
	let isImageModalOpen = $state(false)
	let isLiked = $state(false)
	let likeCount = $state(data.listing.favorite_count || 0)
	let isLoading = $state(false)

	// Reactive computations
	const images = $derived(data.listing.images as string[] || [])
	const hasMultipleImages = $derived(images.length > 1)
	const currentImage = $derived(images[currentImageIndex] || 'https://picsum.photos/400/600?random=placeholder')
	const formattedPrice = $derived(new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(data.listing.price))

	// Image navigation
	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length
	}

	function prevImage() {
		currentImageIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
	}

	// Actions
	async function toggleLike() {
		if (!$user) {
			toast.error('Please login to like items')
			return
		}

		isLoading = true
		try {
			if (isLiked) {
				const { error } = await supabase
					.from('favorites')
					.delete()
					.eq('user_id', $user.id)
					.eq('listing_id', data.listing.id)

				if (error) throw error
				isLiked = false
				likeCount--
			} else {
				const { error } = await supabase
					.from('favorites')
					.insert({
						user_id: $user.id,
						listing_id: data.listing.id
					})

				if (error) throw error
				isLiked = true
				likeCount++
			}
		} catch (error) {
			console.error('Error toggling like:', error)
			toast.error('Failed to update like status')
		} finally {
			isLoading = false
		}
	}

	async function handleMessage() {
		if (!$user) {
			toast.error('Please login to message sellers')
			return
		}

		if ($user.id === data.listing.seller_id) {
			toast.error('You cannot message yourself')
			return
		}

		// TODO: Implement messaging
		toast.success('Messaging feature coming soon!')
	}

	async function handleBuy() {
		if (!$user) {
			toast.error('Please login to purchase items')
			return
		}

		if ($user.id === data.listing.seller_id) {
			toast.error('You cannot buy your own item')
			return
		}

		// TODO: Implement purchase flow
		toast.success('Purchase feature coming soon!')
	}

	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: data.listing.title,
				text: `Check out this ${data.listing.title} on Threadly`,
				url: window.location.href
			})
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast.success('Link copied to clipboard!')
		}
	}

	// Check if user has liked this listing
	onMount(async () => {
		if ($user) {
			const { data: like } = await supabase
				.from('favorites')
				.select('id')
				.eq('user_id', $user.id)
				.eq('listing_id', data.listing.id)
				.single()

			isLiked = !!like
		}
	})

	// Condition badge styling
	const getConditionBadge = (condition: string) => {
		const styles = {
			'new': 'bg-green-100 text-green-800',
			'like_new': 'bg-green-100 text-green-700',
			'good': 'bg-yellow-100 text-yellow-800',
			'fair': 'bg-orange-100 text-orange-800',
			'poor': 'bg-red-100 text-red-800'
		}
		return styles[condition as keyof typeof styles] || 'bg-gray-100 text-gray-800'
	}
</script>

<svelte:head>
	<title>{data.listing.title} - Threadly</title>
	<meta name="description" content={data.listing.description.slice(0, 160)} />
	<meta property="og:title" content={data.listing.title} />
	<meta property="og:description" content={data.listing.description.slice(0, 160)} />
	<meta property="og:image" content={currentImage} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:type" content="product" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Mobile Header -->
	<div class="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b md:hidden">
		<div class="flex items-center justify-between p-4">
			<button 
				onclick={() => history.back()}
				class="p-2 hover:bg-muted rounded-lg transition-colors"
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
			<div class="flex items-center gap-2">
				<button 
					onclick={handleShare}
					class="p-2 hover:bg-muted rounded-lg transition-colors"
				>
					<Share2 class="w-5 h-5" />
				</button>
				<button 
					onclick={toggleLike}
					disabled={isLoading}
					class={cn(
						"p-2 rounded-lg transition-colors",
						isLiked ? "text-red-500" : "hover:bg-muted"
					)}
				>
					<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
				</button>
			</div>
		</div>
	</div>

	<div class="container max-w-7xl mx-auto px-4 py-6">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Image Gallery -->
			<div class="space-y-4">
				<!-- Main Image -->
				<div class="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
					<img 
						src={currentImage}
						alt={data.listing.title}
						class="w-full h-full object-cover cursor-zoom-in"
						onclick={() => isImageModalOpen = true}
					/>
					
					{#if hasMultipleImages}
						<button 
							onclick={prevImage}
							class="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
						>
							<ChevronLeft class="w-5 h-5" />
						</button>
						<button 
							onclick={nextImage}
							class="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
						>
							<ChevronRight class="w-5 h-5" />
						</button>
						
						<!-- Image Counter -->
						<div class="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
							{currentImageIndex + 1} / {images.length}
						</div>
					{/if}
				</div>

				<!-- Thumbnail Strip -->
				{#if hasMultipleImages}
					<div class="flex gap-2 overflow-x-auto pb-2">
						{#each images as image, index}
							<button
								onclick={() => currentImageIndex = index}
								class={cn(
									"flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
									currentImageIndex === index ? "border-primary" : "border-transparent"
								)}
							>
								<img 
									src={image}
									alt={`${data.listing.title} ${index + 1}`}
									class="w-full h-full object-cover"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Product Details -->
			<div class="space-y-6">
				<!-- Price & Title -->
				<div>
					<div class="flex items-start justify-between mb-2">
						<h1 class="text-2xl md:text-3xl font-bold leading-tight">{data.listing.title}</h1>
						<!-- Desktop Actions -->
						<div class="hidden md:flex items-center gap-2">
							<button 
								onclick={handleShare}
								class="p-2 hover:bg-muted rounded-lg transition-colors"
							>
								<Share2 class="w-5 h-5" />
							</button>
							<button 
								onclick={toggleLike}
								disabled={isLoading}
								class={cn(
									"p-2 rounded-lg transition-colors",
									isLiked ? "text-red-500" : "hover:bg-muted"
								)}
							>
								<Heart class={cn("w-5 h-5", isLiked && "fill-current")} />
							</button>
						</div>
					</div>
					<div class="text-3xl font-bold text-primary mb-4">{formattedPrice}</div>
					
					<!-- Quick Details -->
					<div class="flex flex-wrap gap-2 mb-4">
						<Badge class={getConditionBadge(data.listing.condition)}>
							{data.listing.condition.replace('_', ' ')}
						</Badge>
						{#if data.listing.size}
							<Badge variant="outline">Size {data.listing.size}</Badge>
						{/if}
						{#if data.listing.brand}
							<Badge variant="outline">{data.listing.brand}</Badge>
						{/if}
						{#if data.listing.color}
							<Badge variant="outline">{data.listing.color}</Badge>
						{/if}
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-3">
					<Button 
						onclick={handleBuy}
						class="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
						size="lg"
					>
						<CreditCard class="w-5 h-5 mr-2" />
						Buy Now
					</Button>
					<Button 
						onclick={handleMessage}
						variant="outline"
						size="lg"
						class="px-6"
					>
						<MessageCircle class="w-5 h-5 mr-2" />
						Message
					</Button>
				</div>

				<!-- Seller Info -->
				<Card class="p-4">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-full bg-muted overflow-hidden">
							{#if data.listing.seller.avatar_url}
								<img 
									src={data.listing.seller.avatar_url}
									alt={data.listing.seller.username}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<User class="w-6 h-6 text-muted-foreground" />
								</div>
							{/if}
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-semibold">{data.listing.seller.full_name || data.listing.seller.username}</h3>
								<ShieldCheck class="w-4 h-4 text-green-500" />
							</div>
							<div class="text-sm text-muted-foreground">
								@{data.listing.seller.username} • {data.listing.seller.followers_count} followers
							</div>
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onclick={() => goto(`/profile/${data.listing.seller.username}`)}
						>
							View Profile
						</Button>
					</div>
					
					<div class="text-sm text-muted-foreground grid grid-cols-2 gap-4">
						<div class="flex items-center gap-2">
							<Package class="w-4 h-4" />
							<span>{data.listing.seller.listings_count} items</span>
						</div>
						<div class="flex items-center gap-2">
							<Calendar class="w-4 h-4" />
							<span>Joined {formatTimeAgo(data.listing.seller.created_at)} ago</span>
						</div>
					</div>
				</Card>

				<!-- Description -->
				<div>
					<h3 class="font-semibold mb-3">Description</h3>
					<p class="text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.listing.description}</p>
				</div>

				<!-- Details -->
				<div>
					<h3 class="font-semibold mb-3">Details</h3>
					<div class="grid grid-cols-2 gap-4 text-sm">
						{#if data.listing.category}
							<div>
								<span class="text-muted-foreground">Category:</span>
								<span class="ml-2">{data.listing.category.icon} {data.listing.category.name}</span>
							</div>
						{/if}
						{#if data.listing.location}
							<div class="flex items-center">
								<MapPin class="w-4 h-4 text-muted-foreground mr-1" />
								<span>{data.listing.location}</span>
							</div>
						{/if}
						<div class="flex items-center">
							<Eye class="w-4 h-4 text-muted-foreground mr-1" />
							<span>{data.listing.view_count} views</span>
						</div>
						<div class="flex items-center">
							<Heart class="w-4 h-4 text-muted-foreground mr-1" />
							<span>{likeCount} likes</span>
						</div>
					</div>
				</div>

				<!-- Shipping -->
				<div>
					<h3 class="font-semibold mb-3">Shipping</h3>
					<div class="flex items-center gap-2 text-sm">
						<Truck class="w-4 h-4 text-muted-foreground" />
						<span class="capitalize">{data.listing.shipping_type.replace('_', ' ')}</span>
						{#if data.listing.shipping_cost > 0}
							<span>• ${data.listing.shipping_cost}</span>
						{:else}
							<span>• Free shipping</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Related Items -->
		{#if data.relatedListings.length > 0}
			<div class="mt-12">
				<h2 class="text-xl font-bold mb-6">You might also like</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{#each data.relatedListings as item}
						<a 
							href="/listings/{item.id}"
							class="group block bg-card rounded-xl overflow-hidden hover:shadow-lg transition-all"
						>
							<div class="aspect-[3/4] bg-muted overflow-hidden">
								<img 
									src={(item.images as string[])?.[0] || `https://picsum.photos/400/600?random=${item.id}`}
									alt={item.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform"
								/>
							</div>
							<div class="p-3">
								<h3 class="font-medium text-sm line-clamp-2 mb-1">{item.title}</h3>
								<div class="text-xs text-muted-foreground mb-1">
									{item.size && `Size ${item.size} • `}{item.brand}
								</div>
								<div class="font-bold text-primary">${item.price}</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Image Modal -->
	{#if isImageModalOpen}
		<div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
			<button 
				onclick={() => isImageModalOpen = false}
				class="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
			>
				<ArrowLeft class="w-6 h-6" />
			</button>
			
			<div class="relative max-w-4xl max-h-full">
				<img 
					src={currentImage}
					alt={data.listing.title}
					class="max-w-full max-h-full object-contain"
				/>
				
				{#if hasMultipleImages}
					<button 
						onclick={prevImage}
						class="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
					>
						<ChevronLeft class="w-6 h-6" />
					</button>
					<button 
						onclick={nextImage}
						class="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
					>
						<ChevronRight class="w-6 h-6" />
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>