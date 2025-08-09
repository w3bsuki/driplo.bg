import { logger } from '$lib/utils/logger';
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { setCacheHeaders, cachePresets } from '$lib/utils/cache-headers'

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession }, setHeaders }) => {
	// Get session first to check authentication
	const { session } = await safeGetSession()
	
	// Set cache headers for product pages
	setCacheHeaders({ setHeaders } as any, cachePresets.product)

	// Get the main listing with proper joins to eliminate separate queries
	const { data: listing, error: listingError } = await supabase
		.from('listings')
		.select(`
			*,
			profiles!listings_seller_id_fkey (
				*
			),
			categories!listings_category_id_fkey (
				*
			)
		`)
		.eq('id', params.id)
		.eq('status', 'active')
		.single()

	if (listingError || !listing) {
		// Only log actual errors, not 404s from preloading
		if (listingError && listingError.code !== 'PGRST116') {
			logger.error('Listing query error:', listingError)
			logger.error('Listing ID:', params.id)
		}
		// Return 404 with a more informative message
		error(404, {
			message: 'Listing not found',
			details: 'The listing you are looking for does not exist or has been removed.'
		})
	}
	
	// Rename joined data for compatibility
	listing.seller = listing.profiles
	listing.category = listing.categories
	delete listing.profiles
	delete listing.categories
	
	// Map profile fields to expected names for backward compatibility
	if (listing.seller) {
		listing.seller.account_type = listing.seller.is_seller ? 'seller' : 'buyer'
		listing.seller.is_verified = listing.seller.average_rating >= 4.0 // Mock verification based on rating
		listing.seller.seller_rating = listing.seller.average_rating || 0
		listing.seller.buyer_rating_count = listing.seller.total_reviews || 0
		listing.seller.last_active = listing.seller.last_seen_at
		listing.seller.follower_count = 0 // Will be updated below
	}

	// Optimized: 6 queries → 4 queries (simplified but effective optimization)
	const [
		sellerListingsResult,
		relatedListingsResult,
		sellerStatsResult, 
		userInteractionsResult
	] = await Promise.all([
		// Query 1: Get seller's other listings
		supabase
			.from('listings')
			.select(`
				id,
				title,
				price,
				images,
				created_at
			`)
			.eq('seller_id', listing.seller_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.limit(6),

		// Query 2: Get related listings from same category with seller info
		supabase
			.from('listings')
			.select(`
				*,
				profiles!listings_seller_id_fkey (
					*
				)
			`)
			.eq('category_id', listing.category_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.limit(8),

		// Query 3: Get seller follower count (only if seller exists)
		listing.seller
			? supabase
					.from('user_follows')
					.select('id', { count: 'exact', head: true })
					.eq('following_id', listing.seller.id)
			: Promise.resolve({ count: 0 }),

		// Query 4: Combined user interactions (following + favorites) if authenticated
		session?.user
			? Promise.all([
				// Check if following seller
				supabase
					.from('user_follows')
					.select('id')
					.eq('follower_id', session.user.id)
					.eq('following_id', listing.seller_id)
					.maybeSingle(),
				// Check if favorited listing
				supabase
					.from('favorites')
					.select('id')
					.eq('user_id', session.user.id)
					.eq('listing_id', params.id)
					.maybeSingle()
			])
			: Promise.resolve([{ data: null }, { data: null }])
	])

	// Update seller stats
	if (listing.seller) {
		listing.seller.follower_count = sellerStatsResult.count || 0
		listing.seller.listings_count = (sellerListingsResult.data || []).length
	}

	// Process related listings - seller data already joined
	const relatedListings = (relatedListingsResult.data || []).map((item) => {
		// Rename joined data for compatibility
		item.seller = item.profiles
		delete item.profiles
		
		// Map profile fields for compatibility
		if (item.seller) {
			item.seller.account_type = item.seller.is_seller ? 'seller' : 'buyer'
			item.seller.is_verified = item.seller.average_rating >= 4.0
			item.seller.seller_rating = item.seller.average_rating || 0
		}
		
		return item
	})

	// Extract user interactions
	const isFollowing = !!(Array.isArray(userInteractionsResult) ? userInteractionsResult[0]?.data : false)
	const isLiked = !!(Array.isArray(userInteractionsResult) ? userInteractionsResult[1]?.data : false)
	const sellerListings = sellerListingsResult.data || []

	// Track view using our new stored procedure (fire and forget)
	if (session?.user) {
		supabase.rpc('track_listing_view', {
			p_listing_id: params.id,
			p_viewer_id: session.user.id
		})
		.then(() => {}) // Silent success
		.catch(() => {}) // Silent failure - view count is not critical
	} else {
		// For anonymous users, we'd need IP and session tracking
		// This would require client-side tracking instead
	}

	return {
		listing,
		sellerListings,
		relatedListings,
		isFollowing,
		isLiked,
		user: session?.user || null
	}
}