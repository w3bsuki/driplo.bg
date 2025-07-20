import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { email, password } = await request.json()
		
		// Test login using Supabase client
		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		})
		
		if (error) {
			return json({ 
				error: error.message,
				code: error.code,
				status: error.status,
				details: error
			}, { status: 400 })
		}
		
		return json({ 
			success: true,
			user: data.user,
			session: data.session ? 'Session created' : 'No session'
		})
	} catch (err: any) {
		return json({ error: err.message }, { status: 500 })
	}
}