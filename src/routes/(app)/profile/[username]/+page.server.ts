import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
	const { username } = params
	const session = await locals.safeGetSession()
	
	// Load profile data
	const { data: profileData, error: profileError } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('username', username)
		.maybeSingle()
	
	if (profileError || !profileData) {
		error(404, 'Profile not found')
	}
	
	// Execute all related queries in parallel for maximum performance
	const [
		brandProfileResult,
		listingsResult,
		followCheckResult,
		socialAccountsResult,
		totalListingsResult
	] = await Promise.all([
		// Brand profile if applicable
		profileData.account_type === 'brand'
			? locals.supabase
					.from('brand_profiles')
					.select(`
						brand_name,
						brand_description,
						website,
						verification_status,
						established_year
					`)
					.eq('seller_id', profileData.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),

		// User's listings with optimized field selection
		locals.supabase
			.from('listings')
			.select(`
				id,
				title,
				price,
				images,
				size,
				brand,
				condition,
				created_at,
				like_count
			`)
			.eq('seller_id', profileData.id)
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(12),

		// Follow check
		session?.user && session.user.id !== profileData.id
			? locals.supabase
					.from('user_follows')
					.select('id')
					.eq('follower_id', session.user.id)
					.eq('following_id', profileData.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),

		// Social media accounts with specific fields only
		locals.supabase
			.from('social_media_accounts')
			.select(`
				platform,
				username,
				url
			`)
			.eq('seller_id', profileData.id),

		// Total listings count (optimized with just id count)
		locals.supabase
			.from('listings')
			.select('id', { count: 'exact', head: true })
			.eq('seller_id', profileData.id)
	])

	// Calculate likes from listing data (like_count already included)
	const totalLikes = (listingsResult.data || []).reduce((sum, listing) => sum + (listing.like_count || 0), 0)
	
	return {
		profile: {
			...profileData,
			achievements: [],
			member_since: profileData.created_at,
			seller_rating: profileData.seller_rating || 0,
			seller_rating_count: profileData.seller_rating_count || 0,
			response_time_hours: 24,
			total_sales: profileData.total_sales || 0,
			verification_badges: profileData.badges || []
		},
		brandProfile: brandProfileResult.data,
		listings: listingsResult.data || [],
		reviews: [],
		socialAccounts: socialAccountsResult.data || [],
		isFollowing: !!followCheckResult.data,
		stats: {
			totalListings: totalListingsResult.count || 0,
			totalLikes: totalLikes,
			followers: profileData.follower_count || 0,
			following: profileData.following_count || 0
		},
		isOwnProfile: session?.user?.id === profileData.id,
		user: session?.user || null
	}
}