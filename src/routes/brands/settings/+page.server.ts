import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession()
	
	if (!user) {
		throw redirect(303, '/login')
	}
	
	// Get user profile with brand info
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select(`
			*,
			social_media_accounts(*)
		`)
		.eq('id', user.id)
		.single()
	
	// Get verification status
	const { data: verificationRequest } = await locals.supabase
		.from('brand_verification_requests')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()
	
	return {
		profile,
		verificationRequest
	}
}

export const actions = {
	updateBrand: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession()
		if (!user) throw redirect(303, '/login')
		
		const formData = await request.formData()
		
		// Update profile with brand info
		const { error } = await locals.supabase
			.from('profiles')
			.update({
				brand_name: formData.get('brand_name'),
				brand_description: formData.get('brand_description'),
				brand_size: formData.get('brand_size'),
				account_type: 'brand'
			})
			.eq('id', user.id)
		
		if (error) {
			return { success: false, error: error.message }
		}
		
		return { success: true }
	},
	
	requestVerification: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession()
		if (!user) throw redirect(303, '/login')
		
		const formData = await request.formData()
		
		// Create verification request
		const { error } = await locals.supabase
			.from('brand_verification_requests')
			.insert({
				user_id: user.id,
				business_type: formData.get('business_type'),
				business_registration_number: formData.get('registration_number'),
				business_description: formData.get('business_description'),
				documents: [], // In production, handle file uploads
				status: 'pending'
			})
		
		if (error) {
			return { success: false, error: error.message }
		}
		
		return { success: true }
	}
} satisfies Actions