import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { browseListings } from '$lib/server/browse'
import { getCachedData, cacheKeys, cacheTTL } from '$lib/server/cache'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	// Extract filter parameters from URL
	const searchParams = url.searchParams
	const filters = {
		category: searchParams.get('category') || '',
		subcategory: searchParams.get('subcategory') || '',
		search: searchParams.get('q') || '',
		minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : null,
		maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : null,
		sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
		brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
		conditions: searchParams.get('conditions')?.split(',').filter(Boolean) || [],
		sortBy: searchParams.get('sort') || 'recent',
		page: Number(searchParams.get('page')) || 1,
		limit: Number(searchParams.get('limit')) || 24
	}

	try {
		// Cache browse results for 5 minutes
		const cacheKey = cacheKeys.browseResults(filters)
		const browseResult = await getCachedData(
			cacheKey,
			() => browseListings(supabase, filters),
			cacheTTL.browseResults
		)

		// Transform listings to match expected format
		const enrichedListings = browseResult.listings.map(listing => ({
			id: listing.id,
			title: listing.title,
			price: listing.price,
			size: listing.size,
			brand: listing.brand,
			image: listing.images?.[0] || '/placeholder.jpg',
			seller: {
				username: listing.seller?.username || 'Unknown',
				avatar: listing.seller?.avatar_url
			},
			likes: listing.favorite_count || 0,
			condition: listing.condition,
			// Include full listing data
			...listing,
			is_negotiable: false,
			shipping_included: false
		}))

		return json({
			listings: enrichedListings,
			totalCount: browseResult.totalCount,
			hasMore: browseResult.hasMore,
			page: browseResult.page,
			limit: browseResult.limit
		})
	} catch (err) {
		console.error('Load more error:', err)
		return json(
			{ error: 'Failed to load more listings' },
			{ status: 500 }
		)
	}
}