import { v4 as uuidv4 } from 'uuid'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database'
import { compressImage } from './image-compression'

export type UploadResult = {
	url: string
	path?: string
	urls?: Record<string, string>
	srcSet?: string
	error?: string
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB for actual upload
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * Validates an image file
 */
export function validateImageFile(file: File): string | null {
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
		return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
	}
	
	if (file.size > MAX_FILE_SIZE) {
		return 'Image size must be less than 10MB'
	}
	
	return null
}

/**
 * Uploads a single image through the optimized API
 */
export async function uploadImage(
	file: File,
	bucket: 'avatars' | 'covers' | 'listings',
	supabase: SupabaseClient<Database>,
	userId?: string
): Promise<UploadResult> {
	try {
		// Validate file
		const validationError = validateImageFile(file)
		if (validationError) {
			return { url: '', error: validationError }
		}

		// Compress image if needed (especially important for Android)
		let processedFile = file
		if (file.size > MAX_UPLOAD_SIZE || file.type === 'image/jpeg' || file.type === 'image/jpg') {
			try {
				processedFile = await compressImage(file, {
					maxWidth: 1920,
					maxHeight: 1920,
					quality: 0.85,
					maxSizeMB: 4.5 // Leave some buffer under 5MB limit
				})
				console.log(`Compressed image from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`)
			} catch (compressionError) {
				console.warn('Image compression failed, using original:', compressionError)
			}
		}

		// Use the simple upload API with timeout
		const formData = new FormData();
		formData.append('file', processedFile);
		formData.append('bucket', bucket);

		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

		try {
			const response = await fetch('/api/upload/simple', {
				method: 'POST',
				body: formData,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Upload failed');
			}

			const data = await response.json();
			return {
				url: data.url,
				path: data.path
			};
		} catch (fetchError: any) {
			clearTimeout(timeoutId);
			if (fetchError.name === 'AbortError') {
				throw new Error('Upload timed out. Please try again with a smaller image.');
			}
			throw fetchError;
		}
	} catch (error) {
		console.error('Upload error:', error)
		return { 
			url: '', 
			error: error instanceof Error ? error.message : 'Failed to upload image' 
		}
	}
}

/**
 * Uploads multiple images (for listings)
 */
export async function uploadMultipleImages(
	files: File[],
	bucket: 'listings',
	supabase: SupabaseClient<Database>,
	userId: string,
	onProgress?: (progress: number) => void
): Promise<UploadResult[]> {
	const results: UploadResult[] = []
	
	for (let i = 0; i < files.length; i++) {
		const result = await uploadImage(files[i], bucket, supabase, userId)
		results.push(result)
		
		if (onProgress) {
			onProgress(((i + 1) / files.length) * 100)
		}
	}
	
	return results
}

/**
 * Gets a public URL for a storage path
 */
export function getPublicUrl(
	supabase: SupabaseClient<Database>,
	bucket: string,
	path: string
): string {
	const { data: { publicUrl } } = supabase.storage
		.from(bucket)
		.getPublicUrl(path)
	
	return publicUrl
}

/**
 * Deletes an image from storage
 */
export async function deleteImage(
	supabase: SupabaseClient<Database>,
	bucket: string,
	path: string
): Promise<{ error?: string }> {
	const { error } = await supabase.storage
		.from(bucket)
		.remove([path])
	
	if (error) {
		console.error('Delete error:', error)
		return { error: error.message }
	}
	
	return {}
}

/**
 * Converts a File to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = error => reject(error)
	})
}