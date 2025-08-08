import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '$lib/utils/logger'

export async function uploadListingImage(
	supabase: SupabaseClient,
	file: File,
	userId: string,
	index: number
): Promise<string> {
	if (!file || !file.name) {
		throw new Error('Invalid file provided')
	}
	
	const fileExt = file.name.split('.').pop() || 'jpg'
	const fileName = `${userId}/${Date.now()}_${index}.${fileExt}`
	const filePath = fileName

	const { error } = await supabase.storage
		.from('listings')
		.upload(filePath, file, {
			cacheControl: '3600',
			upsert: false
		})

	if (error) {
		throw error
	}

	// Get public URL
	const { data } = supabase.storage
		.from('listings')
		.getPublicUrl(filePath)

	return data.publicUrl
}

export async function deleteListingImage(
	supabase: SupabaseClient,
	imageUrl: string
): Promise<void> {
	// Extract file path from URL
	const url = new URL(imageUrl)
	const pathParts = url.pathname.split('/storage/v1/object/public/listings/')
	
	if (pathParts.length < 2) {
		logger.error('Invalid image URL format', { imageUrl })
		return
	}

	const filePath = pathParts[1]
	
	if (!filePath) {
		logger.error('No file path extracted from URL', { imageUrl })
		return
	}

	const { error } = await supabase.storage
		.from('listings')
		.remove([filePath])

	if (error) {
		logger.error('Error deleting image', { error, filePath })
		throw error
	}
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
	const MAX_SIZE = 10 * 1024 * 1024 // 10MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

	if (file.size > MAX_SIZE) {
		return { valid: false, error: 'Image must be less than 10MB' }
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return { valid: false, error: 'Only JPEG, PNG, WebP, and AVIF images are allowed' }
	}

	return { valid: true }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		const url = URL.createObjectURL(file)

		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve({ width: img.width, height: img.height })
		}

		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('Failed to load image'))
		}

		img.src = url
	})
}