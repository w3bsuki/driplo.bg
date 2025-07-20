import type { PageServerLoad } from './$types'

export type PageData = {
	listings: Array<{
		id: string
		title: string
		description: string
		price: number
		currency: string
		brand: string | null
		size: string | null
		condition: string
		images: any[]
		location: string | null
		view_count: number
		like_count: number
		is_negotiable: boolean
		shipping_included: boolean
		shipping_cost: number | null
		created_at: string
		seller: {
			id: string
			username: string
			full_name: string | null
			avatar_url: string | null
			is_verified: boolean
		}
		category: {
			id: string
			name: string
			slug: string
			icon_url: string | null
		} | null
	}>
	totalCount: number
	categories: Array<{
		id: string
		name: string
		slug: string
		icon_url: string | null
		parent_id: string | null
	}>
	popularBrands: string[]
	pagination: {
		currentPage: number
		totalPages: number
		hasNextPage: boolean
		hasPrevPage: boolean
		limit: number
	}
	filters: {
		category: string
		subcategory: string
		search: string
		minPrice: number | null
		maxPrice: number | null
		sizes: string[]
		brands: string[]
		conditions: string[]
		sortBy: string
	}
}