<script lang="ts">
	import { onMount } from 'svelte'
	import ListingCard from './ListingCard.svelte';
	import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';
	import VirtualGrid from '$lib/components/ui/VirtualGrid.svelte';
	import { getLoadingStrategy, calculateEagerLoadCount } from '$lib/utils/lazy-loading';
	import type { Database } from '$lib/types/database'
	import type { SupabaseClient } from '@supabase/supabase-js'
	
	type ListingData = {
		id: string;
		title: string;
		price: number;
		size?: string;
		brand?: string;
		images?: string[];
		seller?: {
			username: string;
			avatar_url?: string;
		};
		favorite_count?: number;
		condition?: 'new' | 'good' | 'worn';
		status: string;
		created_at: string;
		view_count?: number;
	};

	interface Props {
		title?: string;
		limit?: number;
		orderBy?: 'created_at' | 'price' | 'view_count';
		listings?: ListingData[]; // Pre-loaded listings from server
		showLoading?: boolean; // Override loading state
		infiniteScroll?: boolean; // Enable infinite scroll
		hasMore?: boolean; // Has more items to load
		onLoadMore?: () => Promise<void> | void; // Load more callback
		userFavorites?: string[]; // User's favorite listing IDs
		supabase?: SupabaseClient<Database>; // Supabase client passed as prop
		useVirtualScrolling?: boolean; // Enable virtual scrolling for large lists
		virtualScrollHeight?: number; // Height of virtual scroll container
	}
	
	let { 
		title = 'Popular items', 
		limit = 16, 
		orderBy = 'created_at',
		listings: serverListings = null,
		showLoading = false,
		infiniteScroll = false,
		hasMore = false,
		onLoadMore,
		userFavorites = [],
		supabase,
		useVirtualScrolling = false,
		virtualScrollHeight = 600
	}: Props = $props();
	
	// Transform server listings if provided, otherwise empty array
	const transformedListings = $derived(
		serverListings ? transformListings(serverListings) : []
	)
	
	// Use client-side loaded listings or server listings
	let clientListings = $state<any[]>([])
	const listings = $derived(serverListings ? transformedListings : clientListings)
	
	// Loading state
	let loading = $state(!serverListings)
	
	// Virtual scrolling configuration
	const shouldUseVirtualScrolling = $derived(useVirtualScrolling && listings.length > 50)
	const columns = $derived(getResponsiveColumns())
	
	// Adaptive loading strategy
	let loadingStrategy = $state(getLoadingStrategy())
	const eagerLoadCount = $derived(loadingStrategy.eagerCount)
	
	// Update loading strategy on mount and resize
	onMount(() => {
		loadingStrategy = getLoadingStrategy()
		
		const handleResize = () => {
			loadingStrategy = getLoadingStrategy()
		}
		
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	})
	
	function getResponsiveColumns() {
		if (typeof window === 'undefined') return 4
		if (window.innerWidth >= 1536) return 8 // 2xl
		if (window.innerWidth >= 1280) return 6 // xl
		if (window.innerWidth >= 1024) return 4 // lg
		if (window.innerWidth >= 768) return 4 // md
		if (window.innerWidth >= 640) return 3 // sm
		return 2 // default
	}
	
	onMount(async () => {
		// Only load client-side if no server listings provided
		if (!serverListings && supabase) {
			await loadListings()
		}
	})
	
	async function loadListings() {
		if (!supabase) {
			console.warn('ListingGrid: No supabase client provided')
			return
		}
		
		try {
			loading = true
			
			const { data, error } = await supabase
				.from('listings')
				.select(`
					*,
					seller:profiles(username, avatar_url, account_type, is_verified)
				`)
				.eq('status', 'active')
				.order(orderBy, { ascending: false })
				.limit(limit)
			
			if (error) throw error
			
			clientListings = transformListings(data || [])
			
		} catch (error) {
			console.error('Error loading listings:', error)
			clientListings = []
		} finally {
			loading = false
		}
	}
	
	function transformListings(rawListings: any[]) {
		if (!rawListings || rawListings.length === 0) {
			return []
		}
		
		return rawListings.map(listing => ({
			id: listing.id,
			title: listing.title,
			price: listing.price,
			size: listing.size,
			brand: listing.brand,
			image: listing.images?.[0] || `https://picsum.photos/400/600?random=${listing.id}`,
			seller: {
				username: listing.seller?.username || 'user',
				avatar: listing.seller?.avatar_url
			},
			likes: listing.favorite_count || 0,
			isLiked: userFavorites.includes(listing.id),
			condition: listing.condition
		}))
	}
</script>

<section class="py-3 md:py-4">
	<div class="container px-4">
		{#if title}
			<h2 class="mb-2 text-base md:text-lg font-semibold text-gray-900">{title}</h2>
		{/if}
		
		{#if loading}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
				{#each Array(8) as _, i (i)}
					<div class="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse"></div>
				{/each}
			</div>
		{:else if listings.length > 0}
			{#if shouldUseVirtualScrolling}
				<!-- Virtual scrolling for large lists -->
				<VirtualGrid
					items={listings}
					itemHeight={280}
					{columns}
					gap={16}
					containerHeight={virtualScrollHeight}
					overscan={5}
					let:item
					let:index
				>
					<ListingCard {...item} eagerLoading={index < eagerLoadCount} />
				</VirtualGrid>
			{:else}
				<!-- Regular grid for smaller lists -->
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
					{#each listings as listing, index (listing.id)}
						<ListingCard {...listing} eagerLoading={index < eagerLoadCount} />
					{/each}
				</div>
			{/if}
			
			{#if infiniteScroll && onLoadMore && !shouldUseVirtualScrolling}
				<InfiniteScroll 
					{hasMore} 
					loading={loading} 
					onLoadMore={onLoadMore}
					class="mt-8"
				/>
			{/if}
		{:else}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🛍️</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
				<p class="text-gray-600 mb-4">Be the first to sell something amazing!</p>
				<a 
					href="/sell" 
					class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-300 to-red-500 hover:from-blue-400 hover:to-red-600 text-white font-medium rounded-lg transition-all"
				>
					Start Selling
				</a>
			</div>
		{/if}
	</div>
</section>