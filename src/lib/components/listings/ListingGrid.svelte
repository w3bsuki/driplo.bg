<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import ListingCard from './ListingCard.svelte';
	import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';
	import VirtualGrid from '$lib/components/ui/VirtualGrid.svelte';
	import { getLoadingStrategy } from '$lib/utils/lazy-loading';
	import type { Database } from '$lib/types/database'
	import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
	import * as m from '$lib/paraglide/messages.js';
	
	// Constants
	const RESPONSIVE_BREAKPOINTS = {
		'2xl': { width: 1536, columns: 6 }, // Reduced from 8 for better readability
		xl: { width: 1280, columns: 5 },
		lg: { width: 1024, columns: 4 },
		md: { width: 768, columns: 3 },
		sm: { width: 640, columns: 2 },
		default: { width: 0, columns: 2 }
	};
	
	const SKELETON_COUNT = 8;
	const DEFAULT_LIMIT = 16;
	const VIRTUAL_SCROLL_THRESHOLD = 50;
	const RETRY_DELAY = 1000;
	const MAX_RETRIES = 3;
	
	type ListingData = {
		id: string;
		title: string;
		price: number;
		size?: string;
		brand?: string;
		images?: string[];
		image_urls?: string[];
		seller?: {
			username: string;
			avatar_url?: string;
			account_type?: string;
			is_verified?: boolean;
		};
		favorite_count?: number;
		condition?: string | null;
		status: string;
		created_at: string;
		view_count?: number;
	};

	interface Props {
		title?: string;
		limit?: number;
		orderBy?: 'created_at' | 'price' | 'view_count' | 'favorite_count';
		listings?: ListingData[];
		showLoading?: boolean;
		infiniteScroll?: boolean;
		hasMore?: boolean;
		onLoadMore?: () => Promise<void> | void;
		userFavorites?: string[];
		supabase?: SupabaseClient<Database>;
		useVirtualScrolling?: boolean;
		virtualScrollHeight?: number;
		enableRealtime?: boolean; // Enable real-time updates
		showEmptyState?: boolean; // Show empty state message
	}
	
	let { 
		title = m.home_featured_title(), 
		limit = DEFAULT_LIMIT, 
		orderBy = 'created_at',
		listings: serverListings = null,
		showLoading = false,
		infiniteScroll = false,
		hasMore = false,
		onLoadMore,
		userFavorites = [],
		supabase,
		useVirtualScrolling = false,
		virtualScrollHeight = 600,
		enableRealtime = true,
		showEmptyState = true
	}: Props = $props();
	
	// State
	let clientListings = $state<any[]>([])
	let loading = $state(!serverListings && showLoading !== false)
	let error = $state<string | null>(null)
	let retryCount = $state(0)
	
	// Real-time subscription
	let realtimeChannel: RealtimeChannel | null = null
	
	// Derived values
	const transformedListings = $derived(
		serverListings ? transformListings(serverListings) : []
	)
	const listings = $derived(serverListings ? transformedListings : clientListings)
	const shouldUseVirtualScrolling = $derived(useVirtualScrolling && listings.length > VIRTUAL_SCROLL_THRESHOLD)
	const columns = $derived(getResponsiveColumns())
	const loadingStrategy = $derived(getLoadingStrategy())
	const eagerLoadCount = $derived(loadingStrategy.eagerCount)
	
	// Lifecycle
	onMount(async () => {
		// Only load client-side if no server listings provided
		if (!serverListings && supabase) {
			await loadListings()
		}
		
		// Set up real-time subscription
		if (enableRealtime && supabase) {
			setupRealtimeSubscription()
		}
	})
	
	onDestroy(() => {
		// Clean up real-time subscription
		if (realtimeChannel) {
			supabase?.removeChannel(realtimeChannel)
		}
	})
	
	// Functions
	function getResponsiveColumns(): number {
		if (typeof window === 'undefined') return RESPONSIVE_BREAKPOINTS.lg.columns
		
		const width = window.innerWidth
		for (const [_, config] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
			if (width >= config.width) return config.columns
		}
		return RESPONSIVE_BREAKPOINTS.default.columns
	}
	
	async function loadListings() {
		if (!supabase) {
			console.warn('ListingGrid: No supabase client provided')
			error = m.listing_error_no_client?.() || 'No database connection'
			return
		}
		
		try {
			loading = true
			error = null
			
			const { data, error: fetchError } = await supabase
				.from('listings')
				.select(`
					*,
					seller:profiles!seller_id(username, avatar_url, account_type, is_verified)
				`)
				.eq('status', 'active')
				.order(orderBy, { ascending: false })
				.limit(limit)
			
			if (fetchError) throw fetchError
			
			clientListings = transformListings(data || [])
			retryCount = 0
			
		} catch (err) {
			console.error('Error loading listings:', err)
			error = err instanceof Error ? err.message : m.listing_error_load?.() || 'Failed to load listings'
			
			// Retry logic
			if (retryCount < MAX_RETRIES) {
				retryCount++
				setTimeout(() => loadListings(), RETRY_DELAY * retryCount)
			} else {
				clientListings = []
			}
		} finally {
			loading = false
		}
	}
	
	function setupRealtimeSubscription() {
		if (!supabase) return
		
		realtimeChannel = supabase
			.channel('public:listings')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'listings',
					filter: 'status=eq.active'
				},
				async (payload) => {
					// Fetch the complete listing with seller info
					const { data } = await supabase
						.from('listings')
						.select(`
							*,
							seller:profiles!seller_id(username, avatar_url, account_type, is_verified)
						`)
						.eq('id', payload.new.id)
						.single()
					
					if (data) {
						const transformed = transformListings([data])
						// Add to beginning if sorted by created_at
						if (orderBy === 'created_at') {
							clientListings = [transformed[0], ...clientListings]
						} else {
							// Otherwise, reload to maintain sort order
							await loadListings()
						}
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'listings'
				},
				async (payload) => {
					// Update existing listing
					const index = clientListings.findIndex(l => l.id === payload.new.id)
					if (index !== -1) {
						if (payload.new.status !== 'active') {
							// Remove if no longer active
							clientListings = clientListings.filter(l => l.id !== payload.new.id)
						} else {
							// Fetch updated data
							const { data } = await supabase
								.from('listings')
								.select(`
									*,
									seller:profiles!seller_id(username, avatar_url, account_type, is_verified)
								`)
								.eq('id', payload.new.id)
								.single()
							
							if (data) {
								const transformed = transformListings([data])
								clientListings[index] = transformed[0]
							}
						}
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'listings'
				},
				(payload) => {
					// Remove deleted listing
					clientListings = clientListings.filter(l => l.id !== payload.old.id)
				}
			)
			.subscribe()
	}
	
	function transformListings(rawListings: any[]): any[] {
		if (!rawListings || rawListings.length === 0) {
			return []
		}
		
		return rawListings.map(listing => ({
			id: listing.id,
			title: listing.title,
			price: listing.price,
			size: listing.size,
			brand: listing.brand,
			image: listing.images || listing.image_urls || [],
			imageUrls: listing.image_urls || listing.images || [],
			seller: {
				username: listing.seller?.username || listing.profiles?.username || 'user',
				avatar: listing.seller?.avatar_url || listing.profiles?.avatar_url,
				account_type: listing.seller?.account_type || listing.profiles?.account_type,
				is_verified: listing.seller?.is_verified || listing.profiles?.is_verified
			},
			likes: listing.favorite_count || 0,
			isLiked: userFavorites.includes(listing.id),
			condition: listing.condition
		}))
	}
</script>

<section class="py-3 md:py-4" aria-labelledby={title ? 'listing-grid-title' : undefined}>
	<div class="container px-4">
		{#if title}
			<h2 id="listing-grid-title" class="mb-3 text-base md:text-lg font-semibold text-foreground">
				{title}
			</h2>
		{/if}
		
		{#if error && !loading}
			<!-- Error state -->
			<div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4" role="alert">
				<div class="flex items-start gap-3">
					<span class="text-2xl" aria-hidden="true">⚠️</span>
					<div class="flex-1">
						<h3 class="font-medium text-destructive">{m.listing_error_title()}</h3>
						<p class="text-sm text-destructive/80 mt-1">{error}</p>
						{#if retryCount < MAX_RETRIES}
							<button 
								onclick={() => loadListings()}
								class="mt-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
							>
								{m.listing_retry()}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{:else if loading}
			<!-- Skeleton loader with proper grid -->
			<div 
				class="grid gap-3 md:gap-4"
				style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
				aria-busy="true"
				aria-label={m.listing_loading()}
			>
				{#each Array(SKELETON_COUNT) as _, i (i)}
					<div class="animate-pulse">
						<div class="aspect-[3/4] bg-muted rounded-t-xl"></div>
						<div class="p-3 bg-background rounded-b-xl shadow-sm space-y-2">
							<div class="h-4 bg-muted rounded w-3/4"></div>
							<div class="h-3 bg-muted rounded w-1/2"></div>
							<div class="flex items-center gap-2 mt-3">
								<div class="h-5 w-5 bg-muted rounded-full"></div>
								<div class="h-3 bg-muted rounded w-16"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if listings.length > 0}
			{#if shouldUseVirtualScrolling}
				<!-- Virtual scrolling for large lists -->
				<div role="region" aria-label={m.listing_virtual_grid()}>
					<VirtualGrid
						items={listings}
						itemHeight={320}
						{columns}
						gap={16}
						containerHeight={virtualScrollHeight}
						overscan={5}
						let:item
						let:index
					>
						<ListingCard {...item} eagerLoading={index < eagerLoadCount} />
					</VirtualGrid>
				</div>
			{:else}
				<!-- Regular responsive grid -->
				<div 
					class="grid gap-3 md:gap-4"
					style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
					role="list"
				>
					{#each listings as listing, index (listing.id)}
						<div role="listitem">
							<ListingCard {...listing} eagerLoading={index < eagerLoadCount} />
						</div>
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
		{:else if showEmptyState}
			<!-- Empty state -->
			<div class="text-center py-12">
				<div class="text-6xl mb-4" aria-hidden="true">🛍️</div>
				<h3 class="text-lg font-medium text-foreground mb-2">{m.listing_empty_title()}</h3>
				<p class="text-muted-foreground mb-4">{m.listing_empty_description()}</p>
				<a 
					href="/sell" 
					class="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				>
					{m.listing_start_selling()}
				</a>
			</div>
		{/if}
		
		{#if enableRealtime && listings.length > 0}
			<!-- Real-time indicator -->
			<div class="sr-only" role="status" aria-live="polite">
				{m.listing_realtime_enabled()}
			</div>
		{/if}
	</div>
</section>