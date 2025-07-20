import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
	try {
		// Test signup using Supabase client
		const { data, error } = await locals.supabase.auth.signUp({
			email: 'w3bsuki@gmail.com',
			password: '12345678',
			options: {
				data: {
					username: 'w3bsuki',
					full_name: 'Admin User'
				}
			}
		})
		
		if (error) {
			return json({ 
				error: error.message,
				code: error.code,
				status: error.status,
				details: error
			}, { status: 400 })
		}
		
		// If signup successful, make them admin
		if (data.user) {
			const { error: updateError } = await locals.supabase
				.from('profiles')
				.update({
					role: 'admin',
					is_admin: true,
					setup_completed: true
				})
				.eq('id', data.user.id)
			
			if (updateError) {
				console.error('Failed to update profile:', updateError)
			}
		}
		
		return json({ 
			success: true,
			user: data.user,
			session: data.session ? 'Session created' : 'No session (check email)'
		})
	} catch (err: any) {
		return json({ error: err.message }, { status: 500 })
	}
}