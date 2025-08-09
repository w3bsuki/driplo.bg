import type { PageServerLoad } from './$types';
import { getCachedData, cacheKeys, cacheTTL } from '$lib/server/cache';

export const load: PageServerLoad = async ({ locals }) => {
	// Load critical data first, stream the rest
	// Don't use locale-specific caching for product data
	const criticalData = await getCachedData(
		'homepage-critical-global',
		async () => {
			// Load only categories and featured listings first (critical for FCP)
			const [categoriesResult, featuredResult] = await Promise.all([
				// Get main categories with product counts
				locals.supabase
					.from('categories')
					.select(
						`
            *,
            product_count:listings(count)
          `
					)
					.is('parent_id', null)
					.eq('is_active', true)
					.order('sort_order')
					.order('name'),

				// Get featured listings
				locals.supabase
					.from('listings')
					.select(
						`
            *,
            seller:profiles!seller_id(username, avatar_url),
            condition
          `
					)
					.eq('status', 'active')
					.order('created_at', { ascending: false })
					.limit(8) // Reduced for faster initial load
			]);

			return {
				categories: categoriesResult.data || [],
				featuredListings: featuredResult.data || []
			};
		},
		cacheTTL.homepage
	);

	// Load non-critical data asynchronously
	const nonCriticalData = getCachedData(
		'homepage-secondary-global',
		async () => {
			const [popularResult, topSellersResult] = await Promise.all([
				// Get most viewed listings
				locals.supabase
					.from('listings')
					.select(
						`
            *,
            seller:profiles!seller_id(username, avatar_url),
            condition
          `
					)
					.eq('status', 'active')
					.order('view_count', { ascending: false })
					.limit(16),

				// Get top sellers based on sales count and rating
				locals.supabase
					.from('profiles')
					.select(
						`
            id,
            username,
            avatar_url,
            seller_rating,
            buyer_rating_count,
            total_sales,
            bio,
            location,
            created_at
          `
					)
					.not('username', 'is', null)
					.order('total_sales', { ascending: false, nullsFirst: false })
					.order('seller_rating', { ascending: false, nullsFirst: false })
					.limit(20)
			]);

			// Temporary: Show multiple avatars for UI testing
			const sellers = topSellersResult.data?.length
				? topSellersResult.data
				: Array(15)
						.fill(null)
						.map((_, i) => ({
							id: String(i),
							username: i === 0 ? 'w3bsuki' : `user${i}`,
							avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i === 0 ? 'w3bsuki' : `user${i}`}`,
							seller_rating: 5.0,
							total_sales: Math.floor(Math.random() * 1000),
							buyer_rating_count: 100,
							bio: 'Seller',
							location: 'Sofia',
							created_at: new Date().toISOString()
						}));

			return {
				popularListings: popularResult.data || [],
				topSellers: sellers
			};
		},
		cacheTTL.homepage
	);

	// Return critical data immediately, non-critical will stream
	return {
		...criticalData,
		popularListings: (await nonCriticalData).popularListings,
		topSellers: (await nonCriticalData).topSellers
	};
};
