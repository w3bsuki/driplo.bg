import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { isAdmin, user } = await parent();
	
	if (!isAdmin) {
		error(403, 'Unauthorized');
	}
	
	// Get the brand verification request
	const { data: request, error: requestError } = await locals.supabase
		.from('brand_verification_requests')
		.select('*')
		.eq('id', params.id)
		.single();
	
	if (requestError || !request) {
		error(404, 'Brand verification request not found');
	}
	
	// Get the user's profile
	const { data: profile, error: profileError } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', request.user_id)
		.single();
	
	if (profileError || !profile) {
		error(404, 'User profile not found');
	}
	
	// Get social media accounts
	const { data: socialAccounts } = await locals.supabase
		.from('social_media_accounts')
		.select('*')
		.eq('user_id', request.user_id);
	
	// Get admin who reviewed (if applicable)
	let reviewer = null;
	if (request.reviewed_by) {
		const { data: reviewerData } = await locals.supabase
			.from('profiles')
			.select('username, full_name')
			.eq('id', request.reviewed_by)
			.single();
		
		reviewer = reviewerData;
	}
	
	return {
		request,
		profile,
		socialAccounts: socialAccounts || [],
		reviewer,
		user
	};
};