
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/database.types'

export type PageServerLoadParams = {
	id: string
}

export type PageServerLoadOutput = {
	listing: {
		id: string
		seller_id: string
		title: string
		description: string
		price: number
		currency: string
		condition: string
		size: string | null
		brand: string | null
		images: string[]
		location: string
		shipping_price: number
		status: string
		view_count: number
		like_count: number
		created_at: string
		user_id: string
		category_id: string | null
		seller?: {
			id: string
			username: string
			avatar_url: string | null
			account_type: string | null
			is_verified: boolean | null
			follower_count: number
			seller_rating: number | null
			buyer_rating_count: number | null
			total_sales: number | null
			bio: string | null
			last_active: string | null
			listings_count?: number
		}
		category?: {
			id: string
			name: string
			slug: string
			icon: string | null
		} | null
	}
	sellerListings: Array<{
		id: string
		title: string
		price: number
		images: string[]
		created_at: string
	}>
	relatedListings: Array<{
		id: string
		title: string
		price: number
		images: string[]
		size: string | null
		brand: string | null
		condition: string
		user_id: string
		seller?: {
			username: string
			avatar_url: string | null
			account_type: string | null
			is_verified: boolean | null
		}
	}>
	isFollowing: boolean
	isLiked: boolean
	user: {
		id: string
		email?: string
	} | null
	supabase: SupabaseClient<Database>
}

export type PageData = PageServerLoadOutput