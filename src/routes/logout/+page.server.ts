import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

// Redirect GET requests to home
export const load: PageServerLoad = async () => {
	throw redirect(303, '/')
}

export const actions = {
	default: async ({ locals: { supabase } }) => {
		try {
			await supabase.auth.signOut()
		} catch (error) {
			console.error('Logout error:', error)
		}
		// Always redirect to home page after logout
		throw redirect(303, '/')
	}
} satisfies Actions