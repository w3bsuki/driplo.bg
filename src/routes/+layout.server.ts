import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, depends, cookies }) => {
	// Add dependency for auth invalidation
	depends('app:auth')
	
	const { session, user } = await safeGetSession()
	
	// Get main categories for navigation
	const { data: categories } = await supabase
		.from('categories')
		.select('id, name, slug, icon')
		.is('parent_id', null)
		.eq('is_active', true)
		.order('sort_order')
		.order('name');

	return {
		session,
		user: session ? user : null, // Only return user if we have a valid session
		categories: categories || [],
		cookies: cookies.getAll()
	}
}