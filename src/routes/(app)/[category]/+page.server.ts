import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const VALID_CATEGORIES = ['men', 'women', 'shoes', 'bags', 'accessories'] as const;
type ValidCategory = typeof VALID_CATEGORIES[number];

export const load: PageServerLoad = async ({ params, locals: { supabase }, url }) => {
	const category = params.category as string;
	
	// Check if it's a valid category
	if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
		throw error(404, 'Category not found');
	}
	
	// Get filters from URL params
	const searchParams = url.searchParams;
	const page = parseInt(searchParams.get('page') || '1');
	const limit = 24;
	const offset = (page - 1) * limit;
	const sortBy = searchParams.get('sort') || 'created_at';
	const order = searchParams.get('order') || 'desc';
	
	// Build the query based on category
	let query = supabase
		.from('listings')
		.select('*, seller:profiles(*), images:listing_images(*)', { count: 'exact' })
		.eq('status', 'published')
		.eq('is_deleted', false);
	
	// Apply category-specific filters
	if (category === 'men' || category === 'women') {
		query = query.eq('gender', category);
	} else {
		query = query.eq('category', category);
	}
	
	// Apply sorting
	query = query.order(sortBy, { ascending: order === 'asc' });
	
	// Apply pagination
	query = query.range(offset, offset + limit - 1);
	
	const { data: listings, count, error: listingsError } = await query;
	
	if (listingsError) {
		console.error('Error fetching listings:', listingsError);
		throw error(500, 'Failed to load listings');
	}
	
	// Get category info
	const categoryInfo = {
		men: {
			title: 'Men\'s Fashion',
			description: 'Shop the latest men\'s clothing and accessories',
			emoji: '👨'
		},
		women: {
			title: 'Women\'s Fashion',
			description: 'Discover trendy women\'s clothing and accessories',
			emoji: '👩'
		},
		shoes: {
			title: 'Shoes',
			description: 'Step up your style with our shoe collection',
			emoji: '👟'
		},
		bags: {
			title: 'Bags',
			description: 'Find the perfect bag for any occasion',
			emoji: '👜'
		},
		accessories: {
			title: 'Accessories',
			description: 'Complete your look with stylish accessories',
			emoji: '💍'
		}
	};
	
	return {
		category,
		categoryInfo: categoryInfo[category as ValidCategory],
		listings: listings || [],
		pagination: {
			currentPage: page,
			totalPages: Math.ceil((count || 0) / limit),
			totalItems: count || 0,
			itemsPerPage: limit
		}
	};
};