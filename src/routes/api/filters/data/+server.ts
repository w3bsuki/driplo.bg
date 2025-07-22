import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { supabase } = locals;

	try {
		// Fetch categories
		const { data: categories, error: catError } = await supabase
			.from('categories')
			.select('id, name, slug, icon')
			.eq('is_active', true)
			.eq('parent_id', null) // Get only parent categories
			.order('sort_order');

		if (catError) throw catError;

		// Fetch subcategories
		const { data: subcategories, error: subError } = await supabase
			.from('categories')
			.select('id, name, slug, icon, parent_id')
			.eq('is_active', true)
			.not('parent_id', 'is', null)
			.order('sort_order');

		if (subError) throw subError;

		// Fetch popular brands (top 20 by listing count)
		const { data: brands, error: brandError } = await supabase
			.rpc('get_popular_brands', { limit_count: 20 });

		if (brandError) {
			// Fallback if RPC doesn't exist
			const { data: listings } = await supabase
				.from('listings')
				.select('brand')
				.eq('status', 'active')
				.not('brand', 'is', null);

			const brandCounts = new Map<string, number>();
			listings?.forEach(l => {
				if (l.brand) {
					brandCounts.set(l.brand, (brandCounts.get(l.brand) || 0) + 1);
				}
			});

			// Sort by count and take top 20
			const topBrands = Array.from(brandCounts.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 20)
				.map(([brand, count]) => ({ brand, count }));

			return json({
				categories: categories || [],
				subcategories: subcategories || [],
				brands: topBrands
			});
		}

		return json({
			categories: categories || [],
			subcategories: subcategories || [],
			brands: brands || []
		});
	} catch (error) {
		console.error('Error fetching filter data:', error);
		return json({
			categories: [],
			subcategories: [],
			brands: []
		}, { status: 500 });
	}
};