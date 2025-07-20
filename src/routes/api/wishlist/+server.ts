import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.safeGetSession()
	
	if (!session?.user) {
		error(401, 'Unauthorized')
	}

	const { data: favorites, error: favoritesError } = await locals.supabase
		.from('favorites')
		.select(`
			id,
			created_at,
			listing_id,
			listings (
				id,
				title,
				price,
				images,
				size,
				brand,
				condition,
				seller_id,
				profiles (
					username,
					avatar_url
				)
			)
		`)
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false })

	if (favoritesError) {
		console.error('Error fetching favorites:', favoritesError)
		error(500, 'Failed to fetch favorites')
	}

	return json({
		favorites: favorites || []
	})
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession()
	
	if (!session?.user) {
		error(401, 'Unauthorized')
	}

	const { listing_id } = await request.json()

	if (!listing_id) {
		error(400, 'Missing listing_id')
	}

	// Check if already favorited
	const { data: existing } = await locals.supabase
		.from('favorites')
		.select('id')
		.eq('user_id', session.user.id)
		.eq('listing_id', listing_id)
		.maybeSingle()

	if (existing) {
		return json({ success: true, message: 'Already favorited' })
	}

	const { data, error: insertError } = await locals.supabase
		.from('favorites')
		.insert({
			user_id: session.user.id,
			listing_id
		})
		.select()
		.single()

	if (insertError) {
		console.error('Error adding to favorites:', insertError)
		error(500, 'Failed to add to favorites')
	}

	return json({ success: true, favorite: data })
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession()
	
	if (!session?.user) {
		error(401, 'Unauthorized')
	}

	const { listing_id } = await request.json()

	if (!listing_id) {
		error(400, 'Missing listing_id')
	}

	const { error: deleteError } = await locals.supabase
		.from('favorites')
		.delete()
		.eq('user_id', session.user.id)
		.eq('listing_id', listing_id)

	if (deleteError) {
		console.error('Error removing from favorites:', deleteError)
		error(500, 'Failed to remove from favorites')
	}

	return json({ success: true })
}