import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/utils/logger';

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			// Return not favorited if user is not authenticated
			return json({ is_favorited: false, favorite_count: 0 });
		}

		const listingId = params.id;
		if (!listingId) {
			return json({ error: 'Listing ID is required' }, { status: 400 });
		}

		// Check if current user has favorited this listing
		const { data: favoriteRecord, error: favoriteError } = await supabase
			.from('favorites')
			.select('id')
			.eq('user_id', user.id)
			.eq('listing_id', listingId)
			.single();

		if (favoriteError && favoriteError.code !== 'PGRST116') {
			logger.error('Error checking favorite status', { 
				user_id: user.id, 
				listing_id: listingId,
				error: favoriteError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		// Get total favorite count for the listing
		const { data: favoriteCount, error: countError } = await supabase
			.from('favorites')
			.select('id', { count: 'exact' })
			.eq('listing_id', listingId);

		if (countError) {
			logger.error('Error getting favorite count', { 
				listing_id: listingId,
				error: countError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		return json({
			is_favorited: !!favoriteRecord,
			favorite_count: favoriteCount?.length || 0
		});

	} catch (error) {
		logger.error('Unexpected error in favorite-status endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};