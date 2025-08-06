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
			id,
			title,
			description,
			price,
			currency,
			images,
			size,
			brand,
			condition,
			location,
			view_count,
			like_count,
			shipping_price,
			created_at,
			user_id,
			category_id,
			status,
			profiles:user_id (
				id,
				username,
				avatar_url,
				account_type,
				is_verified,
				follower_count,
				seller_rating,
				buyer_rating_count,
				total_sales,
				bio,
				last_active
			),
			categories:category_id (
				id,
				name,
				slug,
				icon
			)
			// Fixed: using icon instead of icon_url
		`)
		.eq('id', params.id)
		.eq('status', 'active')
		.single()

	if (listingError || !listing) {
		console.error('Listing query error:', listingError)
		console.error('Listing ID:', params.id)
		throw error(404, 'Listing not found')
	}
	
	// Rename joined data for compatibility
	listing.seller = listing.profiles
	listing.category = listing.categories
	delete listing.profiles
	delete listing.categories

	// Now execute all dependent queries in parallel
	const [
		followersResult,
		listingsCountResult,
		sellerListingsResult,
		relatedListingsResult,
		followCheckResult,
		favoriteCheckResult
	] = await Promise.all([
		// Get seller's followers count
		listing.seller
			? supabase
					.from('user_follows')
					.select('id', { count: 'exact', head: true })
					.eq('following_id', listing.seller.id)
			: Promise.resolve({ count: 0 }),

		// Get seller's active listings count
		listing.seller
			? supabase
					.from('listings')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', listing.seller.id)
					.eq('status', 'active')
			: Promise.resolve({ count: 0 }),

		// Get seller's other listings
		supabase
			.from('listings')
			.select(`
				id,
				title,
				price,
				images,
				created_at
			`)
			.eq('user_id', listing.user_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.limit(6),

		// Get related listings from same category with seller info in one query
		supabase
			.from('listings')
			.select(`
				id,
				title,
				price,
				images,
				size,
				brand,
				condition,
				user_id,
				profiles:user_id (
					username,
					avatar_url,
					account_type,
					is_verified
				)
			`)
			.eq('category_id', listing.category_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.limit(8),

		// Check if current user is following the seller
		session?.user
			? supabase
					.from('user_follows')
					.select('id')
					.eq('follower_id', session.user.id)
					.eq('following_id', listing.user_id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
		
		// Check if current user has favorited this listing
		session?.user
			? supabase
					.from('favorites')
					.select('id')
					.eq('user_id', session.user.id)
					.eq('listing_id', params.id)
					.maybeSingle()
			: Promise.resolve({ data: null })
	])

	// Update seller stats
	if (listing.seller) {
		listing.seller.follower_count = followersResult.count || 0
		listing.seller.listings_count = listingsCountResult.count || 0
	}

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

	// Process related listings - seller data already joined
	const relatedListings = (relatedListingsResult.data || []).map((item) => {
		// Rename joined data for compatibility
		item.seller = item.profiles
		delete item.profiles
		return item
	})
	
	return {
		listing,
		sellerListings: sellerListingsResult.data || [],
		relatedListings,
		isFollowing: !!followCheckResult.data,
		isLiked: !!favoriteCheckResult.data,
		user: session?.user || null
	}
}