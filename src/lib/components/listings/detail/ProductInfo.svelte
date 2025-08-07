<script lang="ts">
	import { Heart, Share2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte';
	import CategoryBadge from '$lib/components/badges/CategoryBadge.svelte';
	import SizeBadge from '$lib/components/badges/SizeBadge.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Truck, RotateCcw, MapPin, Star, MessageCircle } from 'lucide-svelte';
	import Image from '$lib/components/ui/Image.svelte';
	import { goto } from '$app/navigation';

	let { 
		listing,
		isLiked = false,
		isOwner = false,
		onLike = () => {},
		onShare = () => {}
	} = $props();

	function getAvatarColor(username) {
		const colors = [
			'bg-blue-400', 'bg-blue-300', 'bg-blue-500', 
			'bg-cyan-400', 'bg-sky-400', 'bg-indigo-400'
		];
		return colors[username.charCodeAt(0) % colors.length];
	}

	let isDescriptionExpanded = $state(false);
</script>

<div class="space-y-3">
	<!-- Header -->
	<div class="space-y-2">
		<div class="flex items-center justify-between gap-2">
			<h1 class="text-base font-semibold text-foreground flex-1">
				{listing.title}
			</h1>
			<div class="flex items-center gap-1">
				<button
					onclick={onLike}
					class={cn("p-1.5 rounded-sm hover:bg-gray-100 transition-colors duration-100",
						isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
					)}
				>
					<Heart class={cn("w-4 h-4", isLiked && "fill-current")} />
				</button>
				<button 
					onclick={onShare}
					class="p-1.5 rounded-sm text-gray-500 hover:bg-gray-100 transition-colors duration-100"
				>
					<Share2 class="w-4 h-4" />
				</button>
			</div>
		</div>
		
		<div class="flex items-center gap-3">
			<span class="text-xl font-bold text-gray-900">{formatCurrency(listing.price, getLocale())}</span>
			{#if listing.original_price && listing.original_price > listing.price}
				<span class="text-sm text-gray-500 line-through">{formatCurrency(listing.original_price, getLocale())}</span>
				<Badge variant="destructive" class="text-xs px-1.5 py-0.5">
					{Math.round((1 - listing.price / listing.original_price) * 100)}% off
				</Badge>
			{/if}
		</div>

		<!-- Quick info badges -->
		<div class="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 pb-1">
			{#if listing.condition}
				<div class="flex-shrink-0">
					<ConditionBadge condition={listing.condition} size="md" />
				</div>
			{/if}
			{#if listing.size}
				<div class="flex-shrink-0">
					<SizeBadge size={listing.size} badgeSize="md" />
				</div>
			{/if}
			{#if listing.category}
				<div class="flex-shrink-0">
					<CategoryBadge category={listing.category.name} size="md" />
				</div>
			{/if}
			{#if listing.brand}
				<div class="flex-shrink-0">
					<BrandBadge brand={listing.brand} size="md" isVerified={false} />
				</div>
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
						class="text-primary hover:underline ml-1"
					>
						See more
					</button>
				</p>
			{/if}
		</div>
	</div>

	<!-- Details Section with Tabs -->
	<div class="overflow-hidden">
		<Tabs value="details" class="w-full">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="details" class="text-sm flex-1 min-w-0">
					<span class="mr-1">📋</span> 
					<span class="truncate">Details</span>
				</TabsTrigger>
				<TabsTrigger value="shipping" class="text-sm flex-1 min-w-0">
					<span class="mr-1">📦</span> 
					<span class="truncate">Shipping</span>
				</TabsTrigger>
				<TabsTrigger value="seller" class="text-sm flex-1 min-w-0">
					<span class="mr-1">👤</span> 
					<span class="truncate">Seller</span>
				</TabsTrigger>
			</TabsList>
		
		<TabsContent value="details" class="mt-4 space-y-4 overflow-hidden">
			<div class="grid grid-cols-1 gap-3">
				{#if listing.materials && listing.materials.length > 0}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Materials</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listing.materials.join(', ')}</span>
					</div>
				{/if}
				{#if listing.category}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Category</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listing.category.name}</span>
					</div>
				{/if}
				{#if listing.subcategory}
					<div class="flex justify-between items-center py-2 border-b border-gray-100">
						<span class="text-sm text-gray-500 flex-shrink-0">Subcategory</span>
						<span class="text-sm text-gray-900 font-medium truncate ml-2">{listing.subcategory?.name}</span>
					</div>
				{/if}
				<div class="flex justify-between items-center py-2 border-b border-gray-100">
					<span class="text-sm text-gray-500">Listed</span>
					<span class="text-sm text-gray-900 font-medium">{new Date(listing.created_at).toLocaleDateString()}</span>
				</div>
			</div>
			
			{#if listing.tags && listing.tags.length > 0}
				<div class="flex flex-wrap gap-1.5 pt-2">
					{#each listing.tags as tag (tag)}
						<Badge variant="secondary" size="sm">
							#{tag}
						</Badge>
					{/each}
				</div>
			{/if}
		</TabsContent>
		
		<TabsContent value="shipping" class="mt-4 space-y-4 overflow-hidden">
			<div class="space-y-2">
				<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
					<Truck class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900">Standard Shipping</p>
						<p class="text-sm text-gray-600">3-5 business days</p>
						<p class="text-sm font-medium text-gray-900 mt-1">
							{listing.shipping_price > 0 ? formatCurrency(listing.shipping_price, getLocale()) : 'Free'}
						</p>
					</div>
				</div>
				
				<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
					<RotateCcw class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900">Returns</p>
						<p class="text-sm text-gray-600">30-day return policy</p>
						<p class="text-xs text-gray-500 mt-1">Item must be in original condition</p>
					</div>
				</div>
				
				{#if listing.location_city}
					<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-sm">
						<MapPin class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Ships from</p>
							<p class="text-sm text-gray-600 truncate">{listing.location_city}</p>
						</div>
					</div>
				{/if}
			</div>
		</TabsContent>
		
		<TabsContent value="seller" class="mt-4 space-y-4 overflow-hidden">
			<div class="flex items-start gap-3">
				{#if listing.seller.avatar_url}
					<div class="relative flex-shrink-0">
						<Image
							src={listing.seller.avatar_url}
							alt={listing.seller.username}
							class="w-12 h-12 rounded-full border-2 border-white shadow-sm"
							objectFit="cover"
							preferredSize="thumb"
						/>
						{#if listing.seller.seller_verified}
							<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
								<span class="text-white text-xs">✓</span>
							</div>
						{/if}
					</div>
				{:else}
					<div class="relative flex-shrink-0">
						<div class={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm", getAvatarColor(listing.seller.username))}>
							<span class="text-white font-medium">{listing.seller.username.charAt(0).toUpperCase()}</span>
						</div>
						{#if listing.seller.seller_verified}
							<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
								<span class="text-white text-xs">✓</span>
							</div>
						{/if}
					</div>
				{/if}
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-medium text-gray-900 truncate">{listing.seller.username}</h3>
						{#if listing.seller.seller_verified}
							<BrandBadge size="xs" isVerified={listing.seller.seller_verified} showText={false} />
						{/if}
					</div>
					<!-- Enhanced rating display -->
					<div class="flex items-center gap-2 mt-1">
						<div class="flex items-center gap-1">
							{#each Array(5) as _, i}
								<Star class={cn("w-3 h-3", (listing.seller.seller_rating || 4.8) > i ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
							{/each}
						</div>
						<span class="text-sm font-medium text-gray-900">{listing.seller.seller_rating || 4.8}</span>
						<span class="text-xs text-gray-500">({listing.seller.seller_rating_count || 42} reviews)</span>
					</div>
					<div class="flex items-center gap-2 mt-1 text-xs text-gray-600 flex-wrap">
						<span class="flex items-center gap-1">
							<span>🏆</span>
							<span>{listing.seller.total_sales || 0} sales</span>
						</span>
						<span>•</span>
						<span>Joined {new Date(listing.seller.created_at || Date.now()).getFullYear()}</span>
					</div>
					<div class="flex gap-2 mt-3">
						<a 
							href="/profile/{listing.seller.username}" 
							class="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-sm text-center text-sm font-medium text-gray-700 transition-colors duration-100 min-w-0"
						>
							<span class="truncate">View Profile</span>
						</a>
						{#if !isOwner}
							<button 
								class="p-2 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors duration-100 flex-shrink-0"
								onclick={() => goto(`/messages?user=${listing.seller.username}`)}
								title="Message seller"
							>
								<MessageCircle class="w-4 h-4 text-gray-700" />
							</button>
						{/if}
					</div>
				</div>
			</div>
		</TabsContent>
		</Tabs>
	</div>
</div>