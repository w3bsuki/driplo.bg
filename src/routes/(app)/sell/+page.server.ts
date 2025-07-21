import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { createListingSchema, createListingDefaults } from '$lib/schemas/listing'

export const load: PageServerLoad = async ({ locals }) => {
	const { data: { user }, error } = await locals.supabase.auth.getUser()
	if (error || !user) {
		throw redirect(303, '/login?redirect=/sell')
	}
	
	// Initialize form with superforms
	const form = await superValidate(createListingDefaults, zod(createListingSchema))
	
	return {
		form
	}
}

export const actions: Actions = {
	createListing: async ({ request, locals }) => {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser()
		if (authError || !user) {
			return fail(401, { error: 'Unauthorized' })
		}

		const form = await superValidate(request, zod(createListingSchema))
		
		if (!form.valid) {
			return fail(400, { form })
		}
		
		const supabase = locals.supabase
		
		const { title, description, price, category_id, subcategory_id, condition, color, location_city, shipping_type, shipping_cost, brand, size, images, tags, materials, ships_worldwide } = form.data
		
		// Generate slug
		const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now().toString(36)

		try {
			const { data, error } = await supabase
				.from('listings')
				.insert({
					seller_id: user.id,
					title,
					slug,
					description,
					price,
					category_id,
					subcategory_id,
					condition,
					images,
					image_urls: images, // Store in both fields for compatibility
					color,
					location_city,
					shipping_type,
					shipping_cost,
					ships_worldwide,
					status: 'active',
					brand,
					size,
					tags,
					materials,
					location: { city: location_city },
					shipping_info: { 
						type: shipping_type, 
						cost: shipping_cost, 
						worldwide: ships_worldwide 
					},
					published_at: new Date().toISOString()
				})
				.select()
				.single()

			if (error) {
				console.error('Database error:', error)
				return fail(500, { 
					form, 
					error: error.message || 'Failed to create listing' 
				})
			}
			
			// Redirect to success page
			throw redirect(303, `/sell/success?id=${data.id}`)
			
		} catch (error: any) {
			// If it's a redirect, rethrow it
			if (error.status === 303) {
				throw error
			}
			
			console.error('Listing creation error:', error)
			return fail(500, { 
				form,
				error: error.message || 'Failed to create listing' 
			})
		}
	}
}