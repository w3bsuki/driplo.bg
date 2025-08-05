import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

// Redirect GET requests to home
export const load: PageServerLoad = async () => {
	throw redirect(303, '/')
}

export const actions = {
	default: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut()
		throw redirect(303, '/')
	}
} satisfies Actions