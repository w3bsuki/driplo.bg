import type { PageServerLoad } from './$types';
import { getCachedData, cacheKeys, cacheTTL } from '$lib/server/cache';

export const load: PageServerLoad = async ({ locals }) => {
  // Cache the entire homepage data as a single request
  const homepageData = await getCachedData(
    cacheKeys.homepage,
    async () => {
      // Execute all queries in parallel for better performance
      const [categoriesResult, featuredResult, popularResult, topSellersResult] = await Promise.all([
        // Get main categories with product counts
        locals.supabase
          .from('categories')
          .select(`
            *,
            product_count:listings(count)
          `)
          .is('parent_id', null)
          .eq('is_active', true)
          .order('sort_order')
          .order('name'),

        // Get featured listings
        locals.supabase
          .from('listings')
          .select(`
            *,
            seller:profiles!seller_id(username, avatar_url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(16),

        // Get most viewed listings
        locals.supabase
          .from('listings')
          .select(`
            *,
            seller:profiles!seller_id(username, avatar_url)
          `)
          .eq('status', 'active')
          .order('view_count', { ascending: false })
          .limit(16),

        // Get top sellers based on sales count and rating
        locals.supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            seller_rating,
            seller_rating_count,
            total_sales,
            bio,
            location,
            created_at
          `)
          .not('total_sales', 'is', null)
          .gte('total_sales', 1)
          .gte('seller_rating', 1.0)
          .order('total_sales', { ascending: false })
          .order('seller_rating', { ascending: false })
          .limit(5)
      ]);

      // Log any errors
      if (featuredResult.error) {
        console.error('Featured listings error:', featuredResult.error);
      }
      if (popularResult.error) {
        console.error('Popular listings error:', popularResult.error);
      }

      return {
        categories: categoriesResult.data || [],
        featuredListings: featuredResult.data || [],
        popularListings: popularResult.data || [],
        topSellers: topSellersResult.data || []
      };
    },
    cacheTTL.homepage
  );

  return homepageData;
};