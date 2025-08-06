import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	// Get comprehensive seller stats from the database
	const [statsResult, sellersResult, categoriesResult] = await Promise.all([
		// Get real seller statistics
		locals.supabase.rpc('get_seller_stats'),
		
		// Get top sellers
		locals.supabase
			.from('profiles')
			.select(`
				id,
				username,
				full_name,
				avatar_url,
				seller_rating,
				total_sales,
				total_earnings,
				created_at,
				updated_at,
				last_active,
				listing_count,
				buyer_rating_count,
				seller_level,
				account_type
			`)
			.not('username', 'is', null)
			.order('total_sales', { ascending: false })
			.order('seller_rating', { ascending: false })
			.limit(10),
			
		// Get main categories
		locals.supabase
			.from('categories')
			.select('name, slug, icon')
			.is('parent_id', null)
			.eq('is_active', true)
			.order('display_order')
			.order('name')
	]);

	// Process stats from RPC function or fallback to manual calculation
	let stats = {
		totalSellers: 0,
		activeToday: 0,
		newThisMonth: 0,
		avgRating: 0.0
	};

	if (statsResult.error) {
		console.log('RPC function not available, calculating stats manually');
		
		// Calculate stats manually as fallback
		const manualStatsResult = await locals.supabase.from('profiles')
			.select('created_at, updated_at, seller_rating, account_type')
			.not('username', 'is', null);
			
		if (manualStatsResult.data) {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			
			const profiles = manualStatsResult.data;
			stats.totalSellers = profiles.length;
			stats.activeToday = profiles.filter(p => 
				p.updated_at && new Date(p.updated_at) >= today
			).length;
			stats.newThisMonth = profiles.filter(p => 
				p.created_at && new Date(p.created_at) >= monthStart
			).length;
			
			const ratingsArray = profiles
				.map(p => p.seller_rating)
				.filter(rating => rating !== null)
				.map(rating => Number(rating));
			
			stats.avgRating = ratingsArray.length > 0 
				? ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length
				: 0.0;
		}
	} else {
		// RPC function returned data successfully
		stats = typeof statsResult.data === 'string' 
			? JSON.parse(statsResult.data) 
			: statsResult.data || stats;
	}

	return {
		sellers: sellersResult.data || [],
		stats,
		categories: categoriesResult.data || []
	};
}) satisfies PageServerLoad;