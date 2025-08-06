import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase }, cookies }) => {
	// Sign out on the server
	await supabase.auth.signOut();
	
	// Clear the auth cookies
	cookies.delete('sb-auth-token', { path: '/' });
	cookies.delete('sb-refresh-token', { path: '/' });
	
	// Redirect to home with success message
	throw redirect(303, '/login?message=logged_out');
};