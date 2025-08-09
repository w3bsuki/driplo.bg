import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const query = url.searchParams.get('q')?.trim();
	try {
		const { supabase } = locals;

		// If no query, return popular items
		if (!query || query.length < 2) {
			const { data: popularListings, error } = await supabase
				.from('listings')
				.select('title, brand, view_count')
				.eq('status', 'active')
				.not('brand', 'is', null)
				.order('view_count', { ascending: false })
				.order('created_at', { ascending: false })
				.limit(20);

			if (error) {
				return json({ suggestions: [] });
			}

			const suggestions = new Set<string>();
			popularListings?.forEach(listing => {
				if (listing.brand && listing.brand.trim().length > 2) {
					suggestions.add(listing.brand.trim());
				}
			});

			return json({
				suggestions: Array.from(suggestions).slice(0, 6)
			});
		}

		// Search matching listings
		const { data: matchingListings, error } = await supabase
			.from('listings')
			.select('title, brand')
			.eq('status', 'active')
			.or(`title.ilike.%${query}%,brand.ilike.%${query}%`)
			.limit(10);

		if (error) {
			return json({ suggestions: [] });
		}

		// Extract suggestions from matching listings
		const suggestions = new Set<string>();
		
		matchingListings?.forEach(listing => {
			// Add exact brand matches
			if (listing.brand && listing.brand.toLowerCase().includes(query.toLowerCase())) {
				suggestions.add(listing.brand.trim());
			}
			
			// Add title matches
			if (listing.title && listing.title.toLowerCase().includes(query.toLowerCase())) {
				suggestions.add(listing.title.trim());
			}
		});

		return json({
			suggestions: Array.from(suggestions).slice(0, 6)
		});

	} catch (error) {
		console.error('Search suggestions API error:', error);
		return json({ 
			suggestions: [],
			error: 'Failed to load suggestions'
		}, { status: 500 });
	}
};