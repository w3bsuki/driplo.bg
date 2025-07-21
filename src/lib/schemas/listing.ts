import { z } from 'zod'

// Listing conditions enum
export const ListingCondition = {
	NEW: 'new',
	LIKE_NEW: 'like_new',
	GOOD: 'good',
	FAIR: 'fair'
} as const

// Shipping types enum
export const ShippingType = {
	STANDARD: 'standard',
	EXPRESS: 'express',
	PICKUP: 'pickup'
} as const

// Create listing validation schema
export const createListingSchema = z.object({
	// Basic Info (Step 1)
	title: z.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must be less than 100 characters')
		.trim(),
	description: z.string()
		.min(10, 'Description must be at least 10 characters')
		.max(2000, 'Description must be less than 2000 characters')
		.trim(),
	category_id: z.string().uuid('Please select a valid category'),
	subcategory_id: z.string().uuid('Please select a subcategory').optional().nullable(),
	
	// Images (Step 2)
	images: z.array(z.string().url())
		.min(1, 'At least one image is required')
		.max(10, 'Maximum 10 images allowed'),
	
	// Pricing & Details (Step 3)
	price: z.number()
		.positive('Price must be greater than 0')
		.max(100000, 'Price must be less than 100,000'),
	condition: z.enum(['new', 'like_new', 'good', 'fair'], {
		required_error: 'Please select the item condition'
	}),
	brand: z.string().max(50).optional().nullable(),
	size: z.string().max(20).optional().nullable(),
	color: z.string().min(1, 'Please specify the color').max(30),
	materials: z.array(z.string()).optional().default([]),
	
	// Shipping & Location (Step 4)
	location_city: z.string()
		.min(2, 'City name must be at least 2 characters')
		.max(100, 'City name must be less than 100 characters')
		.trim(),
	shipping_type: z.enum(['standard', 'express', 'pickup']).default('standard'),
	shipping_cost: z.number().min(0).default(0),
	ships_worldwide: z.boolean().default(false),
	tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional().default([])
})

// Type for the form data
export type CreateListingFormData = z.infer<typeof createListingSchema>

// Schema for form defaults
export const createListingDefaults: Partial<CreateListingFormData> = {
	title: '',
	description: '',
	category_id: '',
	subcategory_id: null,
	images: [],
	price: 0,
	condition: 'new',
	brand: null,
	size: null,
	color: '',
	materials: [],
	location_city: '',
	shipping_type: 'standard',
	shipping_cost: 0,
	ships_worldwide: false,
	tags: []
}

// Client-side validation helpers for each step
export const validateStep1 = (data: Partial<CreateListingFormData>) => {
	const step1Schema = z.object({
		title: createListingSchema.shape.title,
		description: createListingSchema.shape.description,
		category_id: createListingSchema.shape.category_id
	})
	return step1Schema.safeParse(data)
}

export const validateStep2 = (data: Partial<CreateListingFormData>) => {
	const step2Schema = z.object({
		images: createListingSchema.shape.images
	})
	return step2Schema.safeParse(data)
}

export const validateStep3 = (data: Partial<CreateListingFormData>) => {
	const step3Schema = z.object({
		price: createListingSchema.shape.price,
		condition: createListingSchema.shape.condition,
		color: createListingSchema.shape.color
	})
	return step3Schema.safeParse(data)
}

export const validateStep4 = (data: Partial<CreateListingFormData>) => {
	const step4Schema = z.object({
		location_city: createListingSchema.shape.location_city,
		shipping_type: createListingSchema.shape.shipping_type
	})
	return step4Schema.safeParse(data)
}