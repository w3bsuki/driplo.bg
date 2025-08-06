import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/services/logger';

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Follow attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to follow users' }, { status: 401 });
		}

		const followingId = params.id;
		if (!followingId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Prevent users from following themselves
		if (user.id === followingId) {
			return json({ error: 'You cannot follow yourself' }, { status: 400 });
		}

		// Check if user exists
		const { data: targetUser, error: userError } = await supabase
			.from('profiles')
			.select('id, username')
			.eq('id', followingId)
			.single();

		if (userError || !targetUser) {
			logger.warn('Attempt to follow non-existent user', { followingId, error: userError?.message });
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check if already following
		const { data: existingFollow, error: checkError } = await supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', followingId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			logger.error('Error checking existing follow relationship', { 
				follower_id: user.id, 
				following_id: followingId,
				error: checkError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		if (existingFollow) {
			return json({ error: 'Already following this user' }, { status: 409 });
		}

		// Create the follow relationship
		const { error: insertError } = await supabase
			.from('user_follows')
			.insert({
				follower_id: user.id,
				following_id: followingId
			});

		if (insertError) {
			logger.error('Error creating follow relationship', { 
				follower_id: user.id, 
				following_id: followingId,
				error: insertError.message 
			});
			return json({ error: 'Failed to follow user' }, { status: 500 });
		}

		// Get updated follow counts
		const { data: followerCount } = await supabase
			.from('user_follows')
			.select('id', { count: 'exact' })
			.eq('following_id', followingId);

		logger.info('User follow created', { 
			follower_id: user.id, 
			following_id: followingId,
			target_username: targetUser.username 
		});

		return json({ 
			success: true, 
			message: `Now following ${targetUser.username}`,
			follower_count: followerCount?.length || 0
		});

	} catch (error) {
		logger.error('Unexpected error in follow endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Unfollow attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to unfollow users' }, { status: 401 });
		}

		const followingId = params.id;
		if (!followingId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Check if currently following
		const { data: existingFollow, error: checkError } = await supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', followingId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			logger.error('Error checking existing follow relationship for unfollow', { 
				follower_id: user.id, 
				following_id: followingId,
				error: checkError.message 
			});
			return json({ error: 'Database error occurred' }, { status: 500 });
		}

		if (!existingFollow) {
			return json({ error: 'Not following this user' }, { status: 409 });
		}

		// Remove the follow relationship
		const { error: deleteError } = await supabase
			.from('user_follows')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', followingId);

		if (deleteError) {
			logger.error('Error removing follow relationship', { 
				follower_id: user.id, 
				following_id: followingId,
				error: deleteError.message 
			});
			return json({ error: 'Failed to unfollow user' }, { status: 500 });
		}

		// Get updated follow counts
		const { data: followerCount } = await supabase
			.from('user_follows')
			.select('id', { count: 'exact' })
			.eq('following_id', followingId);

		logger.info('User unfollow completed', { 
			follower_id: user.id, 
			following_id: followingId 
		});

		return json({ 
			success: true, 
			message: 'Successfully unfollowed user',
			follower_count: followerCount?.length || 0
		});

	} catch (error) {
		logger.error('Unexpected error in unfollow endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};