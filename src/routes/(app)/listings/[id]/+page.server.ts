import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {

	const { data: listing, error: listingError } = await supabase
		.from('listings')
		.select(`
			*,
			seller:profiles(
				id,
				username,
				full_name,
				avatar_url,
				bio,
				location,
				followers_count,
				listings_count,
				created_at
			),
			category:categories(
				id,
				name,
				slug,
				icon
			)
		`)
		.eq('id', params.id)
		.eq('status', 'active')
		.single()

	if (listingError || !listing) {
		throw error(404, 'Listing not found')
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
			seller:profiles(username, avatar_url)
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