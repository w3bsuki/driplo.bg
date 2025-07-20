import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession()
	
	if (!user) {
		return json({ 
			loggedIn: false,
			message: 'No user session found' 
		})
	}
	
	// Get profile data
	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, email, username, role, is_admin')
		.eq('id', user.id)
		.single()
	
	return json({
		loggedIn: true,
		user: {
			id: user.id,
			email: user.email
		},
		profile: profile || null,
		error: error?.message || null
	})
}