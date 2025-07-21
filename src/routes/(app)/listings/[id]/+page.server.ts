import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {

	const { data: listing, error: listingError } = await supabase
		.from('listings')
		.select(`
			*,
			seller:profiles!seller_id(
				id,
				username,
				full_name,
				avatar_url,
				bio,
				location,
				created_at,
				account_type,
				is_verified
			),
			category:categories!category_id(
				id,
				name,
				slug,
				icon_url
			)
		`)
		.eq('id', params.id)
		.eq('status', 'active')
		.single()

	if (listingError || !listing) {
		throw error(404, 'Listing not found')
	}

	// Calculate followers_count and listings_count for the seller
	if (listing.seller) {
		const [followersResult, listingsResult] = await Promise.all([
			supabase
				.from('user_follows')
				.select('id', { count: 'exact', head: true })
				.eq('following_id', listing.seller.id),
			supabase
				.from('listings')
				.select('id', { count: 'exact', head: true })
				.eq('seller_id', listing.seller.id)
				.eq('status', 'active')
		])

		listing.seller.followers_count = followersResult.count || 0
		listing.seller.listings_count = listingsResult.count || 0
	}

	// Increment view count
	await supabase
		.from('listings')
		.update({ view_count: (listing.view_count || 0) + 1 })
		.eq('id', params.id)

	// Get related listings from same seller
	const { data: sellerListings } = await supabase
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
		.limit(6)

	// Get related listings from same category
	const { data: relatedListings } = await supabase
		.from('listings')
		.select(`
			id,
			title,
			price,
			images,
			size,
			brand,
			condition,
			seller:profiles!seller_id(username, avatar_url, account_type, is_verified)
		`)
		.eq('category_id', listing.category_id)
		.eq('status', 'active')
		.neq('id', params.id)
		.limit(8)

	// Check if current user is following the seller
	const { session } = await safeGetSession()
	let isFollowing = false
	
	if (session?.user) {
		const { data: followData } = await supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', session.user.id)
			.eq('following_id', listing.seller_id)
			.single()
		
		isFollowing = !!followData
	}

	return {
		listing,
		sellerListings: sellerListings || [],
		relatedListings: relatedListings || [],
		isFollowing,
		user: session?.user || null
	}
}