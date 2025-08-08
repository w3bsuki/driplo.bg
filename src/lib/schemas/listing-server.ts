import { z } from 'zod'

// Server-safe listing schema - no client imports, no barrel exports
export const serverListingSchema = z.object({
	// Basic Info
	title: z.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must be less than 100 characters')
		.trim(),
	description: z.string()
		.min(3, 'Description must be at least 3 characters')
		.max(2000, 'Description must be less than 2000 characters')
		.trim(),
	category_id: z.string().uuid('Please select a valid category'),
	subcategory_id: z.string().uuid('Please select a subcategory').optional().nullable(),
	
	// Images
	images: z.array(z.string().url())
		.min(1, 'At least one image is required')
		.max(10, 'Maximum 10 images allowed')
		.default([]),
	
	// Pricing & Details
	price: z.number()
		.positive('Price must be greater than 0')
		.max(100000, 'Price must be less than 100,000'),
	condition: z.enum([
		'new_with_tags',
		'new_without_tags',
		'excellent',
		'good',
		'fair'
	] as [string, ...string[]], {
		required_error: 'Please select the item condition'
	}),
	brand: z.string().max(50).optional().nullable(),
	size: z.string().max(20).optional().nullable(),
	color: z.string().max(30).optional().default(''),
	materials: z.array(z.string()).optional().default([]),
	
	// Shipping & Location
	location_city: z.string()
		.min(2, 'City name must be at least 2 characters')
		.max(100, 'City name must be less than 100 characters')
		.trim(),
	shipping_type: z.enum(['standard', 'express', 'pickup']).default('standard'),
	shipping_price: z.number().min(0).default(0),
	ships_worldwide: z.boolean().default(false),
	tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional().default([])
})

export type ServerListingFormData = z.infer<typeof serverListingSchema>