import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession()
	
	if (!user) {
		return json({ error: 'Not logged in' })
	}
	
	try {
		// Direct query to payment_accounts
		const { data, error } = await locals.supabase
			.from('payment_accounts')
			.select('*')
			.eq('user_id', user.id)
		
		// Also try with service role to see if it's RLS
		const { SUPABASE_SERVICE_ROLE_KEY } = await import('$env/static/private')
		const { createClient } = await import('@supabase/supabase-js')
		const { PUBLIC_SUPABASE_URL } = await import('$env/static/public')
		
		const adminClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
		
		const { data: adminData, error: adminError } = await adminClient
			.from('payment_accounts')
			.select('*')
			.eq('user_id', user.id)
		
		return json({
			userId: user.id,
			normalQuery: { data, error },
			adminQuery: { data: adminData, error: adminError }
		})
	} catch (err: any) {
		return json({ error: err.message })
	}
}