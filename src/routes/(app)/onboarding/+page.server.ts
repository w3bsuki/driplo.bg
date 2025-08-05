import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();
	
	// Redirect to login if not authenticated
	if (!session || !user) {
		throw redirect(303, '/login');
	}
	
	// Get user profile for onboarding checks
	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();
	
	return {
		user,
		profile
	};
};