import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { isAdmin } = await parent();
	
	if (!isAdmin) {
		error(403, 'Unauthorized');
	}
	
	// Get all brand profiles (verification info is stored in profiles table)
	const { data: brandProfiles, error: profilesError } = await locals.supabase
		.from('profiles')
		.select('id, username, full_name, avatar_url, brand_name, brand_verified, brand_verification_date, created_at')
		.eq('account_type', 'brand')
		.order('created_at', { ascending: false });
	
	if (profilesError) {
		logger.error('Error loading brand profiles:', profilesError);
		error(500, 'Failed to load brand profiles');
	}
	
	// Get statistics
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	
	const [
		{ count: pending },
		{ count: approved }
	] = await Promise.all([
		locals.supabase
			.from('profiles')
			.select('*', { count: 'exact', head: true })
			.eq('account_type', 'brand')
			.is('brand_verified', null),
		
		locals.supabase
			.from('profiles')
			.select('*', { count: 'exact', head: true })
			.eq('account_type', 'brand')
			.eq('brand_verified', true)
			.gte('brand_verification_date', thirtyDaysAgo.toISOString())
	]);
	
	// Format brand profiles into request-like structure for compatibility
	const formattedRequests = brandProfiles?.map(profile => ({
		id: profile.id,
		user_id: profile.id,
		brand_name: profile.brand_name,
		verification_status: profile.brand_verified === true ? 'approved' : 
							profile.brand_verified === false ? 'rejected' : 'pending',
		submitted_at: profile.created_at,
		reviewed_at: profile.brand_verification_date,
		username: profile.username || 'unknown',
		full_name: profile.full_name,
		avatar_url: profile.avatar_url
	})) || [];
	
	return {
		requests: formattedRequests,
		stats: {
			pending: pending || 0,
			approved: approved || 0
		}
	};
};