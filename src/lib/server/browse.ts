import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database.types'
import { getCachedData, cacheTTL } from '$lib/server/cache'

export interface BrowseFilters {
	category?: string
	subcategory?: string
	search?: string
	minPrice?: number | null
	maxPrice?: number | null
	sizes?: string[]
	brands?: string[]
	conditions?: string[]
	sortBy?: string
	page?: number
	limit?: number
}

export interface BrowseResult {
	listings: unknown[]
	totalCount: number
	hasMore: boolean
	page: number
	limit: number
}

export async function browseListings(
	supabase: SupabaseClient<Database>,
	filters: BrowseFilters
): Promise<BrowseResult> {
	const {
		category = '',
		subcategory = '',
		search = '',
		minPrice,
		maxPrice,
		sizes = [],
		brands = [],
		conditions = [],
		sortBy = 'recent',
		page = 1,
		limit = 24
	} = filters

	// Only cache simple queries (no search, first page, common filters)
	const shouldCache = (
		!search &&
		page === 1 &&
		limit <= 24 &&
		sizes.length === 0 &&
		brands.length === 0 &&
		conditions.length === 0 &&
		!minPrice &&
		!maxPrice
	)

	if (shouldCache) {
		const cacheKey = `browse-listings-${category}-${subcategory}-${sortBy}-${limit}`
		return getCachedData(cacheKey, () => executeQuery(), cacheTTL.browseResults)
	}
	
	return executeQuery()

	async function executeQuery(): Promise<BrowseResult> {

	try {
		// Get category ID once for reuse
		let categoryId: string | null = null
		if (category) {
			const categoryQuery = category.includes('-')
				? supabase.from('categories').select('id').eq('slug', category).single()
				: supabase.from('categories').select('id').eq('name', category).single()
			
			const { data: categoryData } = await categoryQuery
			categoryId = categoryData?.id || null
		}

		// Get brand IDs once for reuse
		let brandIds: string[] = []
		if (brands.length > 0) {
			const { data: brandData } = await supabase
				.from('brands')
				.select('id')
				.in('name', brands)
			
			brandIds = brandData?.map(b => b.id) || []
		}

		// Build the optimized query with joins to reduce N+1
		let query = supabase
			.from('listings')
			.select(`
				id,
				title,
				description,
				price,
				currency,
				brand,
				size,
				condition,
				images,
				location,
				view_count,
				like_count,
				shipping_price,
				created_at,
				user_id,
				category_id,
				profiles:user_id (
					username,
					avatar_url,
					account_type,
					is_verified
				)
			`)
			.eq('is_sold', false)
			.eq('is_archived', false)
			.eq('is_draft', false)

		// Apply filters using pre-fetched IDs
		if (categoryId) {
			query = query.eq('category_id', categoryId)
		}

		if (subcategory) {
			// For subcategory, we need to join with the subcategory table
			query = query.eq('subcategory_id', subcategory)
		}

		if (search) {
			// Use simple ILIKE search
			query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
		}

		if (minPrice !== null && minPrice !== undefined) {
			query = query.gte('price', minPrice)
		}

		if (maxPrice !== null && maxPrice !== undefined) {
			query = query.lte('price', maxPrice)
		}

		if (sizes.length > 0) {
			query = query.in('size', sizes)
		}

		if (brandIds.length > 0) {
			query = query.in('brand_id', brandIds)
		}

		if (conditions.length > 0) {
			query = query.in('condition', conditions)
		}

		// Apply sorting
		switch (sortBy) {
			case 'price-low':
				query = query.order('price', { ascending: true })
				break
			case 'price-high':
				query = query.order('price', { ascending: false })
				break
			case 'popular':
				query = query.order('view_count', { ascending: false })
				break
			case 'favorites':
				query = query.order('like_count', { ascending: false })
				break
			case 'ending':
				// For ending soon, we'd need an end_date field
				// For now, sort by created_at ascending (oldest first)
				query = query.order('created_at', { ascending: true })
				break
			case 'recent':
			default:
				query = query.order('created_at', { ascending: false })
				break
		}

		// Build optimized count query using the same filters
		let countQuery = supabase
			.from('listings')
			.select('id', { count: 'exact', head: true })
			.eq('is_sold', false)
			.eq('is_archived', false)
			.eq('is_draft', false)

		// Apply same filters to count query using pre-fetched IDs
		if (categoryId) {
			countQuery = countQuery.eq('category_id', categoryId)
		}

		if (subcategory) {
			countQuery.eq('subcategory_id', subcategory)
		}

		if (search) {
			countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
		}

		if (minPrice !== null && minPrice !== undefined) {
			countQuery.gte('price', minPrice)
		}

		if (maxPrice !== null && maxPrice !== undefined) {
			countQuery.lte('price', maxPrice)
		}

		if (sizes.length > 0) {
			countQuery.in('size', sizes)
		}

		if (brandIds.length > 0) {
			countQuery = countQuery.in('brand_id', brandIds)
		}

		if (conditions.length > 0) {
			countQuery.in('condition', conditions)
		}

		// Execute queries in parallel
		const offset = (page - 1) * limit
		const [listingsResult, countResult] = await Promise.all([
			query.range(offset, offset + limit - 1),
			countQuery
		])

		if (listingsResult.error) {
			console.error('Browse listings error:', listingsResult.error)
			throw listingsResult.error
		}

		if (countResult.error) {
			console.error('Browse count error:', countResult.error)
		}

		const totalCount = countResult.count || 0
		const hasMore = offset + limit < totalCount

		// Process listings to extract seller data from joins
		const processedListings = (listingsResult.data || []).map((listing) => {
			// Extract seller data and attach to listing
			listing.seller = listing.profiles
			delete listing.profiles
			return listing
		})

			return {
				listings: processedListings,
				totalCount,
				hasMore,
				page,
				limit
			}
		} catch (err) {
			console.error('Browse listings error:', err)
			throw err
		}
	}
}

// Helper function to get unique filter values with caching
export async function getBrowseFilters(
	supabase: SupabaseClient<Database>,
	category?: string
): Promise<{
	brands: string[]
	sizes: string[]
	conditions: string[]
	priceRange: { min: number; max: number } | null
}> {
	// Use caching for filter data since it changes slowly
	const cacheKey = `browse-filters-${category || 'all'}`
	
	return getCachedData(cacheKey, async () => {
		let query = supabase
			.from('listings')
			.select('brand_id, size, condition, price, brands!brand_id(name)')
			.eq('is_sold', false)
			.eq('is_archived', false)
			.eq('is_draft', false)

	if (category) {
		if (category.includes('-')) {
			// Category slug
			const { data: categoryData } = await supabase
				.from('categories')
				.select('id')
				.eq('slug', category)
				.single()
			
			if (categoryData) {
				query = query.eq('category_id', categoryData.id)
			}
		} else {
			// Category name
			const { data: categoryData } = await supabase
				.from('categories')
				.select('id')
				.eq('name', category)
				.single()
			
			if (categoryData) {
				query = query.eq('category_id', categoryData.id)
			}
		}
	}

	const { data } = await query

	if (!data) {
		return {
			brands: [],
			sizes: [],
			conditions: [],
			priceRange: null
		}
	}

	// Extract unique values
	const brands = [...new Set(data.map(item => item.brands?.name).filter(Boolean) as string[])].sort()
	const sizes = [...new Set(data.map(item => item.size).filter(Boolean) as string[])].sort()
	const conditions = [...new Set(data.map(item => item.condition).filter(Boolean) as string[])].sort()
	
	const prices = data.map(item => item.price).filter(Boolean)
	const priceRange = prices.length > 0 ? {
		min: Math.min(...prices),
		max: Math.max(...prices)
	} : null

		return {
			brands,
			sizes,
			conditions,
			priceRange
		}
	}, cacheTTL.browseResults)
}