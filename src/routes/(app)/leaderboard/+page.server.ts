import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const timePeriod = (url.searchParams.get('period') as 'week' | 'month' | 'year' | 'all') || 'month';
	
	// Fetch all data in parallel for better performance
	const [topSellersResult, topBrandsResult, recentReviewsResult] = await Promise.all([
		// Top personal sellers
		locals.supabase.rpc('get_top_sellers', {
			time_period: timePeriod,
			result_limit: 20
		}),
		
		// Top brands
		locals.supabase.rpc('get_top_brands', {
			time_period: timePeriod,
			result_limit: 20
		}),
		
		// Recent reviews
		locals.supabase.rpc('get_recent_reviews', {
			time_period: timePeriod,
			page: 1,
			page_size: 20
		})
	]);
	
	// Handle any errors
	if (topSellersResult.error) {
		console.error('Error fetching top sellers:', topSellersResult.error);
	}
	if (topBrandsResult.error) {
		console.error('Error fetching top brands:', topBrandsResult.error);
	}
	if (recentReviewsResult.error) {
		console.error('Error fetching recent reviews:', recentReviewsResult.error);
	}
	
	return {
		topSellers: topSellersResult.data || [],
		topBrands: topBrandsResult.data || [],
		recentReviews: recentReviewsResult.data || [],
		initialTimePeriod: timePeriod
	};
};