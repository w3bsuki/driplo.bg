import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	const { data: { user }, error } = await locals.supabase.auth.getUser();
	
	if (error || !user) {
		throw redirect(303, '/login?redirect=/settings/payments');
	}
	
	// Get existing payment account if any
	const { data: paymentAccount } = await locals.supabase
		.from('payment_accounts')
		.select('*')
		.eq('user_id', user.id)
		.single();
	
	return {
		user,
		paymentAccount
	};
};