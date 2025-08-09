import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/utils/logger';

export const POST: RequestHandler = async ({ params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Favorite attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to favorite listings' }, { status: 401 });
		}

		const listingId = params.id;
		if (!listingId) {
			return json({ error: 'Listing ID is required' }, { status: 400 });
		}

		// Check if listing exists
		const { data: listing, error: listingError } = await supabase
			.from('listings')
			.select('id, title, seller_id, like_count')
			.eq('id', listingId)
			.single();

		if (listingError || !listing) {
			logger.warn('Attempt to favorite non-existent listing', { listingId, error: listingError?.message });
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		// Check if already favorited
		const { data: existingFavorite, error: checkError } = await supabase
			.from('favorites')
			.select('id')
			.eq('user_id', user.id)
			.eq('listing_id', listingId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			logger.error('Error checking existing favorite', { 
				user_id: user.id, 
				listing_id: listingId,
				error: checkError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		if (existingFavorite) {
			return json({ error: 'Listing already in favorites' }, { status: 409 });
		}

		// Add to favorites
		const { error: insertError } = await supabase
			.from('favorites')
			.insert({
				user_id: user.id,
				listing_id: listingId
			});

		if (insertError) {
			logger.error('Error adding to favorites', { 
				user_id: user.id, 
				listing_id: listingId,
				error: insertError.message 
			});
			return json({ error: 'Failed to add to favorites' }, { status: 500 });
		}

		// Get the updated like_count (trigger has already updated it)
		const { data: updatedListing, error: fetchError } = await supabase
			.from('listings')
			.select('like_count')
			.eq('id', listingId)
			.single();

		if (fetchError) {
			logger.error('Error fetching updated like count', { 
				listing_id: listingId,
				error: fetchError.message 
			});
		}

		logger.info('Listing favorited', { 
			user_id: user.id, 
			listing_id: listingId,
			listing_title: listing.title 
		});

		return json({ 
			success: true, 
			message: 'Added to favorites',
			likeCount: updatedListing?.like_count || 1
		});

	} catch (error) {
		logger.error('Unexpected error in favorite endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Unfavorite attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to manage favorites' }, { status: 401 });
		}

		const listingId = params.id;
		if (!listingId) {
			return json({ error: 'Listing ID is required' }, { status: 400 });
		}

		// Check if favorited
		const { data: existingFavorite, error: checkError } = await supabase
			.from('favorites')
			.select('id')
			.eq('user_id', user.id)
			.eq('listing_id', listingId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			logger.error('Error checking existing favorite for removal', { 
				user_id: user.id, 
				listing_id: listingId,
				error: checkError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		if (!existingFavorite) {
			return json({ error: 'Listing not in favorites' }, { status: 409 });
		}

		// Remove from favorites
		const { error: deleteError } = await supabase
			.from('favorites')
			.delete()
			.eq('user_id', user.id)
			.eq('listing_id', listingId);

		if (deleteError) {
			logger.error('Error removing from favorites', { 
				user_id: user.id, 
				listing_id: listingId,
				error: deleteError.message 
			});
			return json({ error: 'Failed to remove from favorites' }, { status: 500 });
		}

		// Get the updated like_count (trigger has already updated it)
		const { data: updatedListing, error: fetchError } = await supabase
			.from('listings')
			.select('like_count')
			.eq('id', listingId)
			.single();

		if (fetchError) {
			logger.error('Error fetching updated like count', { 
				listing_id: listingId,
				error: fetchError.message 
			});
		}

		logger.info('Listing unfavorited', { 
			user_id: user.id, 
			listing_id: listingId 
		});

		return json({ 
			success: true, 
			message: 'Removed from favorites',
			likeCount: updatedListing?.like_count || 0
		});

	} catch (error) {
		logger.error('Unexpected error in unfavorite endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};