import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession()
	
	// Load user profile if authenticated
	let profile = null
	if (user) {
		const { data } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single()
		profile = data
	}
	
	// Get main categories for navigation
	const { data: categories } = await supabase
		.from('categories')
		.select('id, name, slug, icon')
		.is('parent_id', null)
		.eq('is_active', true)
		.order('display_order')
		.order('name');

	return {
		session,
		user,
		profile,
		categories: categories || [],
		cookies: cookies.getAll()
	}
}