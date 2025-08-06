import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/services/logger';

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			// Return not following if user is not authenticated
			return json({ is_following: false, follower_count: 0 });
		}

		const targetUserId = params.id;
		if (!targetUserId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Check if current user is following the target user
		const { data: followRecord, error: followError } = await supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', targetUserId)
			.single();

		if (followError && followError.code !== 'PGRST116') {
			logger.error('Error checking follow status', { 
				follower_id: user.id, 
				following_id: targetUserId,
				error: followError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		// Get total follower count for the target user
		const { data: followerCount, error: countError } = await supabase
			.from('user_follows')
			.select('id', { count: 'exact' })
			.eq('following_id', targetUserId);

		if (countError) {
			logger.error('Error getting follower count', { 
				following_id: targetUserId,
				error: countError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		return json({
			is_following: !!followRecord,
			follower_count: followerCount?.length || 0
		});

	} catch (error) {
		logger.error('Unexpected error in follow-status endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};