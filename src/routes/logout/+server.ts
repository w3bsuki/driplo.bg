import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, locale }, cookies }) => {
	// Sign out on the server
	await supabase.auth.signOut();
	
	// Clear the auth cookies
	cookies.delete('sb-auth-token', { path: '/' });
	cookies.delete('sb-refresh-token', { path: '/' });
	
	// Helper to create localized URLs
	const getLocalizedUrl = (path: string) => {
		if (locale && locale !== 'en') {
			return `/${locale}${path}`;
		}
		return path;
	};
	
	// Redirect to login with success message
	throw redirect(303, getLocalizedUrl('/login?message=logged_out'));
};