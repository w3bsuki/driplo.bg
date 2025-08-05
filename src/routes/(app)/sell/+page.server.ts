import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { createListingSchema, createListingDefaults } from '$lib/schemas/listing'
import { serverCache, cacheKeys } from '$lib/server/cache'
import { uploadListingImage } from '$lib/utils/upload'

export const load: PageServerLoad = async ({ locals }) => {
	try {
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
	} catch (error: any) {
		// If error is "no rows returned", that's fine
		if (error?.code !== 'PGRST116') {
			console.error('Failed to check payment account:', error)
		}
	}
	
	return {
		form,
		user, // Return user data explicitly
		categories: categories || [],
		hasPaymentAccount
	}
	} catch (error) {
		// If it's a redirect, rethrow it
		if (error instanceof Response && error.status === 303) {
			throw error
		}
		
		console.error('Error in sell page load:', error)
		// Return minimal data to prevent complete failure
		return {
			form: await superValidate(createListingDefaults, zod(createListingSchema)),
			user: null,
			categories: [],
			hasPaymentAccount: false
		}
	}
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		console.log('Create listing action started');
		
		// Get user from auth
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser()
		if (authError || !user) {
			console.error('Auth error:', authError)
			return fail(401, { error: 'Please log in to create a listing' })
		}
		
		console.log('User authenticated:', user.id);

		// Get form data
		const formData = await request.formData()
		
		// Extract image files
		const imageFiles = formData.getAll('imageFiles') as File[]
		
		// Remove image files from form data before validation
		formData.delete('imageFiles')
		formData.delete('imageCount')
		
		// Validate form data
		const form = await superValidate(formData, zod(createListingSchema))
		
		if (!form.valid) {
			console.error('Form validation failed:', form.errors)
			return fail(400, { form, error: 'Please check all required fields.' })
		}
		
		// Check if user profile exists (required by foreign key)
		const { data: profile, error: profileError } = await locals.supabase
			.from('profiles')
			.select('id')
			.eq('id', user.id)
			.single()
		
		if (profileError || !profile) {
			console.error('Profile not found:', profileError)
			return fail(400, { form, error: 'Profile not found. Please complete your profile setup.' })
		}
		
		// Upload images if any
		const uploadedImageUrls: string[] = []
		if (imageFiles.length > 0) {
			for (let i = 0; i < imageFiles.length; i++) {
				try {
					const url = await uploadListingImage(locals.supabase, imageFiles[i], user.id, i)
					uploadedImageUrls.push(url)
				} catch (error) {
					console.error('Image upload failed:', error)
					return fail(500, { form, error: 'Failed to upload images. Please try again.' })
				}
			}
		}
		
		const { title, description, price, category_id, subcategory_id, condition, color, location_city, shipping_type, shipping_cost, brand, size, tags, materials, ships_worldwide } = form.data

		try {
			// Create the listing
			const { data: listing, error } = await locals.supabase
				.from('listings')
				.insert({
					user_id: user.id,
					title,
					description,
					price,
					category_id,
					subcategory_id,
					condition,
					images: uploadedImageUrls,
					thumbnail_url: uploadedImageUrls[0] || null,
					color,
					location: location_city,
					country: 'Bulgaria',
					shipping_price: shipping_cost || 0,
					shipping_options: { 
						standard: shipping_type === 'standard',
						express: shipping_type === 'express',
						pickup: shipping_type === 'pickup',
						worldwide: ships_worldwide || false
					},
					brand: brand || null,
					size: size || null,
					tags: tags || [],
					materials: materials || [],
					is_sold: false,
					is_archived: false,
					is_draft: false,
					is_featured: false,
					quantity: 1,
					view_count: 0,
					like_count: 0,
					save_count: 0,
					currency: 'EUR'
				})
				.select()
				.single()

			if (error) {
				console.error('Database error:', error)
				
				// User-friendly error messages
				let userError = 'Failed to create listing. Please try again.'
				if (error.code === '42501') {
					userError = 'Permission denied. Please log out and log back in.'
				} else if (error.code === '23503') {
					if (error.message.includes('category')) {
						userError = 'Invalid category selected.'
					} else if (error.message.includes('profile')) {
						userError = 'Profile not found. Please complete your profile setup.'
					}
				} else if (error.code === '23505') {
					userError = 'A similar listing already exists.'
				}
				
				return fail(500, { form, error: userError })
			}
			
			// Clear cache to show new listing immediately
			serverCache.clear()
			
			// Redirect to the new listing
			throw redirect(303, `/listings/${listing.id}`)
			
		} catch (error: any) {
			// If it's a redirect, rethrow it
			if (error?.status === 303) {
				throw error
			}
			
			console.error('Unexpected error:', error)
			return fail(500, { 
				form,
				error: 'An unexpected error occurred. Please try again.' 
			})
		}
	}
}