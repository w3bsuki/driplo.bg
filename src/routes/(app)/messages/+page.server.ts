import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ cookies }) => {
	const supabase = createSupabaseServerClient(cookies);
	
	// Get the authenticated user
	const { data: { user }, error } = await supabase.auth.getUser();
	
	if (error || !user) {
		throw redirect(303, '/auth/signin?next=/messages');
	}

	// Fetch user's conversations
	try {
		const baseUrl = process.env['PUBLIC_SITE_URL'] || url.origin;
		const response = await fetch(`${baseUrl}/api/conversations`, {
			headers: {
				Cookie: cookies.toString()
			}
		});

		let conversations = [];
		if (response.ok) {
			const data = await response.json();
			conversations = data.conversations || [];
		}

		return {
			user,
			conversations
		};
	} catch (error) {
		logger.error('Error fetching conversations in server load:', error);
		return {
			user,
			conversations: []
		};
	}
};