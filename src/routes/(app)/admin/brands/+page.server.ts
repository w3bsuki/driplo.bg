import type { PageServerLoad, Actions } from './$types'
import type { Database } from '$lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// TODO: Add these missing tables to database.types.ts when they're created in Supabase
interface BrandVerificationRequest {
	id: string;
	user_id: string;
	status: 'pending' | 'approved' | 'rejected';
	created_at: string | null;
	reviewed_at: string | null;
	reviewed_by: string | null;
	rejection_reason: string | null;
	business_name: string;
	business_email: string;
	business_address: unknown;
	tax_id: string;
	documents: string[];
	profiles?: Pick<Profile, 'id' | 'username' | 'email' | 'brand_name'>;
}

interface AdminApproval {
	id?: string;
	admin_id: string;
	action_type: string;
	target_id: string;
	target_type: string;
	action_details: Record<string, unknown>;
	created_at?: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Remove 'as any' when brand_verification_requests table is added to database.types.ts
	const { data: requests } = await locals.supabase
		.from('brand_verification_requests' as any)
		.select(`
			*,
			profiles!inner(
				id,
				username,
				email,
				brand_name
			)
		`)
		.order('created_at', { ascending: false })
	
	return {
		requests: (requests as BrandVerificationRequest[]) || []
	}
}

export const actions = {
	approve: async ({ request, locals }) => {
		const formData = await request.formData()
		const requestId = formData.get('requestId')
		const userId = formData.get('userId')
		
		if (!requestId || !userId || typeof requestId !== 'string' || typeof userId !== 'string') {
			return { success: false, error: 'Invalid request data' }
		}

		const session = await locals.safeGetSession()
		if (!session.user?.id) {
			return { success: false, error: 'Unauthorized' }
		}
		
		// Update verification request
		// TODO: Remove 'as any' when brand_verification_requests table is added to database.types.ts
		await locals.supabase
			.from('brand_verification_requests' as any)
			.update({
				status: 'approved',
				reviewed_at: new Date().toISOString(),
				reviewed_by: session.user.id
			})
			.eq('id', requestId)
		
		// Update user profile with properly typed data
		const profileUpdate: Partial<Database['public']['Tables']['profiles']['Update']> = {
			is_verified: true,
			is_seller: true,
			account_type: 'brand'
		}
		
		await locals.supabase
			.from('profiles')
			.update(profileUpdate)
			.eq('id', userId)
			
		// Create admin approval record
		// TODO: Remove 'as any' when admin_approvals table is added to database.types.ts
		const approvalRecord: Omit<AdminApproval, 'id' | 'created_at'> = {
			admin_id: session.user.id,
			action_type: 'brand_verification',
			target_id: requestId,
			target_type: 'brand_verification_request',
			action_details: { status: 'approved' }
		}
		
		await locals.supabase
			.from('admin_approvals' as any)
			.insert(approvalRecord)
		
		return { success: true }
	},
	
	reject: async ({ request, locals }) => {
		const formData = await request.formData()
		const requestId = formData.get('requestId')
		const reason = formData.get('reason')
		
		if (!requestId || !reason || typeof requestId !== 'string' || typeof reason !== 'string') {
			return { success: false, error: 'Invalid request data' }
		}

		const session = await locals.safeGetSession()
		if (!session.user?.id) {
			return { success: false, error: 'Unauthorized' }
		}
		
		// Update verification request
		// TODO: Remove 'as any' when brand_verification_requests table is added to database.types.ts
		await locals.supabase
			.from('brand_verification_requests' as any)
			.update({
				status: 'rejected',
				rejection_reason: reason,
				reviewed_at: new Date().toISOString(),
				reviewed_by: session.user.id
			})
			.eq('id', requestId)
			
		// Create admin approval record
		// TODO: Remove 'as any' when admin_approvals table is added to database.types.ts
		const approvalRecord: Omit<AdminApproval, 'id' | 'created_at'> = {
			admin_id: session.user.id,
			action_type: 'brand_verification',
			target_id: requestId,
			target_type: 'brand_verification_request',
			action_details: { status: 'rejected', reason }
		}
		
		await locals.supabase
			.from('admin_approvals' as any)
			.insert(approvalRecord)
		
		return { success: true }
	}
} satisfies Actions