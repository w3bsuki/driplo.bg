import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { email } = await request.json()
		
		if (!email || typeof email !== 'string') {
			return json({ error: 'Email is required' }, { status: 400 })
		}
		
		// Check if email already exists in profiles table
		const { data: existingProfile, error } = await locals.supabase
			.from('profiles')
			.select('id')
			.eq('email', email.toLowerCase())
			.single()
		
		if (error && error.code !== 'PGRST116') {
			// PGRST116 is "no rows returned" which means email is available
			console.error('Email check error:', error)
			return json({ error: 'Failed to check email availability' }, { status: 500 })
		}
		
		// If we found a profile, email is taken
		const available = !existingProfile
		
		return json({ available, email })
		
	} catch (error) {
		console.error('Email check endpoint error:', error)
		return json({ error: 'Failed to check email availability' }, { status: 500 })
	}
}