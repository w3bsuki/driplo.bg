import type { PageServerLoad } from './$types'
import type { Database } from '$lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Order = Database['public']['Tables']['orders']['Row']

type RecentUser = Pick<Profile, 'id' | 'email' | 'username' | 'created_at'>
type RecentOrder = Pick<Order, 'id' | 'total_amount' | 'status' | 'created_at'>

interface AdminStats {
	totalUsers: number
	totalListings: number
	totalOrders: number
	pendingVerifications: number
}

export const load: PageServerLoad = async ({ locals }) => {
	const supabase = locals.supabase
	
	// Get statistics
	const [
		{ count: totalUsers },
		{ count: totalListings },
		{ count: totalOrders },
		{ count: pendingVerifications }
	] = await Promise.all([
		supabase.from('profiles').select('*', { count: 'exact', head: true }),
		supabase.from('listings').select('*', { count: 'exact', head: true }),
		supabase.from('orders').select('*', { count: 'exact', head: true }),
		// TODO: Remove 'as any' when brand_verification_requests table is added to database.types.ts
		supabase.from('brand_verification_requests' as any)
			.select('*', { count: 'exact', head: true })
			.eq('status', 'pending')
	])
	
	// Get recent activity
	const { data: recentUsers } = await supabase
		.from('profiles')
		.select('id, email, username, created_at')
		.order('created_at', { ascending: false })
		.limit(5)
		
	const { data: recentOrders } = await supabase
		.from('orders')
		.select('id, total_amount, status, created_at')
		.order('created_at', { ascending: false })
		.limit(5)
	
	const stats: AdminStats = {
		totalUsers: totalUsers || 0,
		totalListings: totalListings || 0,
		totalOrders: totalOrders || 0,
		pendingVerifications: pendingVerifications || 0
	}
	
	return {
		stats,
		recentUsers: (recentUsers as RecentUser[]) || [],
		recentOrders: (recentOrders as RecentOrder[]) || []
	}
}