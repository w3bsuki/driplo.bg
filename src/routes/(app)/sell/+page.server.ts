import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { createListingSchema, createListingDefaults } from '$lib/schemas/listing'
import { serverCache, cacheKeys } from '$lib/server/cache'

export const load: PageServerLoad = async ({ locals }) => {
	const { data: { user }, error } = await locals.supabase.auth.getUser()
	if (error || !user) {
		throw redirect(303, '/login?redirect=/sell')
	}
	
	// Initialize form with superforms - ensure all fields have proper defaults
	const formDefaults = {
		...createListingDefaults,
		condition: createListingDefaults.condition || 'new_with_tags',
		shipping_type: createListingDefaults.shipping_type || 'standard',
		color: createListingDefaults.color || '',
		images: createListingDefaults.images || [],
		tags: createListingDefaults.tags || [],
		materials: createListingDefaults.materials || []
	}
	const form = await superValidate(formDefaults, zod(createListingSchema))
	
	// Fetch categories
	const { data: categories } = await locals.supabase
		.from('categories')
		.select('*')
		.is('parent_id', null)
		.eq('is_active', true)
		.order('display_order')
	
	// Check payment account - first check payment_accounts table, then fallback to profile tags
	let hasPaymentAccount = false
	try {
		// Check payment_accounts table first
		const { data: paymentAccounts } = await locals.supabase
			.from('payment_accounts')
			.select('*')
			.eq('user_id', user.id)
		
		if (paymentAccounts && paymentAccounts.length > 0) {
			hasPaymentAccount = true
		} else {
			// Fallback: check if user has payment tags in profile
			const { data: profile } = await locals.supabase
				.from('profiles')
				.select('revolut_tag, paypal_tag, payment_methods')
				.eq('id', user.id)
				.single()
			
			if (profile && (profile.revolut_tag || profile.paypal_tag || (profile.payment_methods && profile.payment_methods.length > 0))) {
				hasPaymentAccount = true
				
				// Auto-create payment_accounts record if missing but tags exist
				if (profile.revolut_tag) {
					await locals.supabase
						.from('payment_accounts')
						.upsert({
							user_id: user.id,
							provider: 'revolut',
							account_id: profile.revolut_tag,
							account_status: 'active',
							account_data: { tag: profile.revolut_tag }
						})
				}
				
				if (profile.paypal_tag) {
					await locals.supabase
						.from('payment_accounts')
						.upsert({
							user_id: user.id,
							provider: 'paypal',
							account_id: profile.paypal_tag,
							account_status: 'active',
							account_data: { tag: profile.paypal_tag }
						})
				}
			}
		}
	} catch (error) {
		// If error is "no rows returned", that's fine
		if (error.code !== 'PGRST116') {
			console.error('Failed to check payment account:', error)
		}
	}
	
	return {
		form,
		user, // Return user data explicitly
		categories: categories || [],
		hasPaymentAccount
	}
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser()
		if (authError || !user) {
			return fail(401, { error: 'Unauthorized' })
		}

		// Use superValidate to parse the request directly
		const form = await superValidate(request, zod(createListingSchema))
		
		if (!form.valid) {
			console.error('Form validation failed:', form.errors)
			console.error('Form data received:', form.data)
			return fail(400, { form, error: 'Validation failed. Please check all fields.' })
		}
		
		const supabase = locals.supabase
		
		const { title, description, price, category_id, subcategory_id, condition, color, location_city, shipping_type, shipping_cost, brand, size, images, tags, materials, ships_worldwide } = form.data
		
		// Generate slug
		const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now().toString(36)

		try {
			const { data, error } = await supabase
				.from('listings')
				.insert({
					user_id: user.id, // Use user_id not seller_id
					title,
					description,
					price,
					category_id,
					subcategory_id,
					condition,
					images,
					thumbnail_url: images?.[0], // Set first image as thumbnail
					color,
					location: location_city, // Use location field directly
					country: 'Bulgaria', // Default country
					shipping_price: shipping_cost,
					shipping_options: { 
						standard: shipping_type === 'standard',
						express: shipping_type === 'express',
						pickup: shipping_type === 'pickup',
						worldwide: ships_worldwide 
					},
					brand: brand || null, // Add brand text field
					size,
					tags,
					materials,
					is_sold: false,
					is_archived: false,
					is_draft: false,
					is_featured: false,
					quantity: 1,
					view_count: 0,
					like_count: 0,
					save_count: 0,
					currency: 'EUR' // Default currency
				})
				.select()
				.single()

			if (error) {
				console.error('Database error:', error)
				console.error('Database error details:', {
					message: error.message,
					details: error.details,
					hint: error.hint,
					code: error.code
				})
				console.error('Data attempted to insert:', {
					seller_id: user.id,
					title,
					category_id,
					subcategory_id,
					price,
					condition,
					shipping_type,
					images_count: images?.length || 0
				})
				return fail(500, { 
					form, 
					error: error.message || 'Failed to create listing' 
				})
			}
			
			// Clear all relevant caches so new listing appears immediately
			serverCache.delete(cacheKeys.homepage)
			serverCache.delete(cacheKeys.featuredListings)
			serverCache.delete(cacheKeys.popularListings)
			// Clear browse cache entries that might contain this listing
			serverCache.clear() // Clear all cache to ensure listing appears everywhere
			
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