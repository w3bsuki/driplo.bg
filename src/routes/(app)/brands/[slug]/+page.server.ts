import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/database.types';
import { logger } from '$lib/utils/logger';

type BrandProfile = Database['public']['Tables']['brand_profiles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

type BrandProfileWithUser = BrandProfile & { 
	user: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'bio' | 'location' | 'seller_rating' | 'seller_rating_count' | 'account_type' | 'is_verified' | 'badges'>; 
};

type ListingWithImages = Listing & {
	images: Array<{
		id: string;
		image_url: string;
		display_order: number;
	}>;
};

type ReviewWithReviewer = Review & {
	reviewer: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>;
};

type UserStats = {
	total_sales: number;
	total_listings: number;
	avg_rating: number;
	total_reviews: number;
};

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { slug } = params;

	// Fetch brand profile
	const { data: brandProfile, error: brandError } = await supabase
		.from('brand_profiles')
		.select('*')
		.eq('brand_slug', slug)
		.single();

	if (brandError || !brandProfile) {
		logger.error('Brand fetch error:', brandError);
		error(404, 'Brand not found');
	}

	// Fetch user profile separately
	const { data: userProfile, error: userError } = await supabase
		.from('profiles')
		.select(`
			id,
			username,
			full_name,
			avatar_url,
			bio,
			location,
			seller_rating,
			seller_rating_count,
			account_type,
			is_verified,
			badges
		`)
		.eq('id', brandProfile.user_id)
		.single();

	if (userError || !userProfile) {
		logger.error('User profile fetch error:', userError);
		error(404, 'User profile not found');
	}

	// Create properly typed combined data
	const brandProfileWithUser: BrandProfileWithUser = {
		...brandProfile,
		user: userProfile
	};

	// Fetch brand's listings
	const { data: listings } = await supabase
		.from('listings')
		.select(`
			*,
			images:listing_images (
				id,
				image_url,
				display_order
			)
		`)
		.eq('user_id', brandProfile.user_id)
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(12);

	// Fetch brand stats - Note: RPC function may not exist, fallback to default
	let stats: UserStats = {
		total_sales: 0,
		total_listings: 0,
		avg_rating: 0,
		total_reviews: 0
	};

	try {
		const { data: statsData } = await supabase
			.rpc('get_user_stats', { user_id_param: brandProfile.user_id });
		if (statsData && statsData[0]) {
			stats = statsData[0] as UserStats;
		}
	} catch (rpcError) {
		logger.warn('get_user_stats RPC not available, using defaults:', rpcError);
	}

	// Fetch reviews
	const { data: reviews } = await supabase
		.from('reviews')
		.select(`
			*,
			reviewer:profiles!reviews_reviewer_id_fkey (
				username,
				full_name,
				avatar_url
			)
		`)
		.eq('seller_id', brandProfile.user_id)
		.order('created_at', { ascending: false })
		.limit(5);

	return {
		brandProfile: brandProfileWithUser,
		listings: (listings as ListingWithImages[]) || [],
		stats,
		reviews: (reviews as ReviewWithReviewer[]) || []
	};
};