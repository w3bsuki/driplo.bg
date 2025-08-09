import { logger } from '$lib/utils/logger';
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { browseListings, getBrowseFilters } from '$lib/server/browse'
import { getCachedData, cacheKeys, cacheTTL, clearCache } from '$lib/server/cache'
import { setCacheHeaders, cachePresets } from '$lib/utils/cache-headers'

// Don't clear cache on every import - this causes issues

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.safeGetSession()
	const { supabase } = locals
	
	// Set cache headers for browse page - disabled for now due to dynamic content
	// setCacheHeaders({ setHeaders }, cachePresets.browse)
	
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
		// Temporarily bypass caching for debugging
		const browseResult = await browseListings(supabase, filters)

		// Get filter options without caching
		const filterOptions = await getBrowseFilters(supabase, filters.category)

		// Get all categories for filter UI (cached for 1 hour)
		// Don't use locale-specific caching for data that's the same across locales
		const categories = await getCachedData(
			'browse-categories-global',
			async () => {
				const { data } = await supabase
					.from('categories')
					.select('id, name, slug, icon_url, parent_id')
					.eq('is_active', true)
					.order('sort_order')
				return data || []
			},
			cacheTTL.categories
		)

		// Get user's favorites if logged in
		let userFavorites: string[] = []
		if (session?.user) {
			const { data: favorites } = await supabase
				.from('favorites')
				.select('listing_id')
				.eq('user_id', session.user.id)
			
			userFavorites = favorites?.map(f => f.listing_id) || []
		}

		// Get top sellers (cached for 1 hour)
		const topSellers = await getCachedData(
			'browse-top-sellers',
			async () => {
				const { data } = await supabase
					.from('profiles')
					.select('id, username, avatar_url, seller_rating, total_sales, created_at')
					.not('seller_rating', 'is', null)
					.gte('total_sales', 1)
					.order('seller_rating', { ascending: false })
					.order('total_sales', { ascending: false })
					.limit(10)
				return data || []
			},
			cacheTTL.leaderboard
		)

		// Calculate pagination info
		const totalPages = Math.ceil(browseResult.totalCount / browseResult.limit)
		const hasNextPage = browseResult.page < totalPages
		const hasPrevPage = browseResult.page > 1

		// Transform listings to match ListingCard props
		const enrichedListings = browseResult.listings.map(listing => ({
			id: listing.id,
			title: listing.title,
			price: listing.price,
			size: listing.size,
			brand: listing.brand,
			image: listing.images?.[0] || '/placeholder.jpg',
			seller: {
				username: listing.seller?.username || 'Unknown',
				avatar: listing.seller?.avatar_url,
				account_type: listing.seller?.account_type,
				is_verified: listing.seller?.is_verified
			},
			likes: listing.like_count || 0,
			isLiked: userFavorites.includes(listing.id),
			condition: listing.condition,
			// Include full listing data for other components
			...listing,
			is_negotiable: false,
			shipping_included: false
		}))

		return {
			listings: enrichedListings,
			totalCount: browseResult.totalCount,
			categories,
			popularBrands: filterOptions.brands,
			userFavorites,
			topSellers,
			pagination: {
				currentPage: browseResult.page,
				totalPages,
				hasNextPage,
				hasPrevPage,
				limit: browseResult.limit
			},
			filters: {
				category: filters.category,
				subcategory: filters.subcategory,
				search: filters.search,
				minPrice: filters.minPrice,
				maxPrice: filters.maxPrice,
				sizes: filters.sizes,
				brands: filters.brands,
				conditions: filters.conditions,
				sortBy: filters.sortBy
			},
			filterOptions
		}
	} catch (err) {
		logger.error('Browse page error:', err)
		throw error(500, `Failed to load browse page: ${err instanceof Error ? err.message : 'Unknown error'}`)
	}
}