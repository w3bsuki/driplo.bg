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
	create: async ({ request, locals, cookies }) => {
		// CRITICAL FIX: Get session first to ensure proper JWT context
		const { data: { session }, error: sessionError } = await locals.supabase.auth.getSession()
		if (sessionError || !session) {
			console.error('No valid session found:', sessionError)
			return fail(401, { error: 'Please log in to create a listing' })
		}

		const { data: { user }, error: authError } = await locals.supabase.auth.getUser()
		if (authError || !user) {
			console.error('Auth error:', authError)
			return fail(401, { error: 'Authentication failed' })
		}

		console.log('=== AUTH CHECK ===')
		console.log('Session exists:', !!session)
		console.log('User ID:', user.id)
		console.log('JWT present:', !!session.access_token)
		console.log('==================')

		// Use superValidate to parse the request directly
		const form = await superValidate(request, zod(createListingSchema))
		
		if (!form.valid) {
			console.error('Form validation failed:', form.errors)
			console.error('Form data received:', form.data)
			return fail(400, { form, error: 'Validation failed. Please check all fields.' })
		}
		
		const supabase = locals.supabase
		
		// CRITICAL FIX: Check if user profile exists first (foreign key requirement)
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('id, username')
			.eq('id', user.id)
			.single()
		
		if (profileError || !profile) {
			console.error('Profile not found for user:', user.id, profileError)
			return fail(400, { form, error: 'User profile not found. Please complete your profile setup first.' })
		}
		
		console.log('User authenticated:', user.id, 'Profile exists:', profile.username)
		
		const { title, description, price, category_id, subcategory_id, condition, color, location_city, shipping_type, shipping_cost, brand, size, images, tags, materials, ships_worldwide } = form.data
		
		// Generate slug
		const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now().toString(36)

		try {
			console.log('Attempting to create listing for user:', user.id)
			console.log('Form data:', { title, price, category_id, condition, images: images?.length || 0 })
			
			// CRITICAL DEBUG: Test if auth.uid() is working in the database context
			const { data: authDebug, error: authDebugError } = await supabase
				.rpc('debug_listing_insert', { p_user_id: user.id })
				.single()
			
			if (authDebugError) {
				console.error('Auth debug test failed:', authDebugError)
			} else {
				console.log('=== AUTH DEBUG RESULTS ===')
				console.log('current_auth_uid:', authDebug.current_auth_uid)
				console.log('provided_user_id:', authDebug.provided_user_id)
				console.log('auth_matches:', authDebug.auth_matches)
				console.log('profile_exists:', authDebug.profile_exists)
				console.log('========================')
				
				// If auth doesn't match, this is the core issue
				if (!authDebug.auth_matches) {
					console.error('CRITICAL: auth.uid() does not match user.id!')
					console.error('This will cause RLS policy to fail')
					console.error('Expected user.id:', user.id)
					console.error('Database auth.uid():', authDebug.current_auth_uid)
					return fail(401, { 
						form, 
						error: 'Authentication context error. Please log out and log back in.' 
					})
				}
			}
			
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
				console.error('=== DETAILED DATABASE ERROR ===')
				console.error('Error message:', error.message)
				console.error('Error code:', error.code)
				console.error('Error details:', error.details)
				console.error('Error hint:', error.hint)
				console.error('Full error object:', JSON.stringify(error, null, 2))
				console.error('=== INSERT DATA ATTEMPTED ===')
				console.error('user_id:', user.id)
				console.error('title:', title)
				console.error('price:', price)
				console.error('category_id:', category_id)
				console.error('condition:', condition)
				console.error('images count:', images?.length || 0)
				console.error('=== AUTH CONTEXT ===')
				console.error('JWT user.id:', user.id)
				console.error('Profile found:', !!profile)
				console.error('===========================')
				
				// Return user-friendly error based on error code
				let userError = 'Failed to create listing'
				if (error.code === '42501') {
					userError = 'Permission denied. Please make sure you are logged in and try again.'
				} else if (error.code === '23503') {
					userError = 'Invalid category or missing profile information.'
				}
				
				return fail(500, { 
					form, 
					error: userError,
					debugError: error.message // Include debug info for development
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