import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { v4 as uuidv4 } from 'uuid'

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession()
	
	if (!user) {
		throw error(401, 'Unauthorized')
	}

	try {
		const formData = await request.formData()
		const file = formData.get('file') as File
		const bucket = formData.get('bucket') as string || 'listings'
		
		if (!file) {
			throw error(400, 'No file provided')
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
		if (!allowedTypes.includes(file.type)) {
			throw error(400, 'Invalid file type')
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			console.log(`File too large: ${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB`)
			throw error(400, `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 5MB)`)
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop()
		const fileName = `${user.id}/${uuidv4()}.${fileExt}`

		// Convert File to ArrayBuffer for Supabase
		const arrayBuffer = await file.arrayBuffer()
		const buffer = new Uint8Array(arrayBuffer)

		// Upload to Supabase Storage with retry
		let uploadError = null
		let data = null
		
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				console.log(`Upload attempt ${attempt} for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
				
				const result = await supabase.storage
					.from(bucket)
					.upload(fileName, buffer, {
						contentType: file.type,
						upsert: false
					})
				
				if (result.error) {
					uploadError = result.error
					console.error(`Upload attempt ${attempt} failed:`, result.error)
					if (attempt < 3) {
						// Wait before retry
						await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
					}
				} else {
					data = result.data
					uploadError = null
					break
				}
			} catch (err) {
				uploadError = err
				console.error(`Upload attempt ${attempt} error:`, err)
				if (attempt < 3) {
					await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
				}
			}
		}

		if (uploadError) {
			console.error('All upload attempts failed:', uploadError)
			throw error(500, uploadError.message || 'Upload failed after 3 attempts')
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from(bucket)
			.getPublicUrl(fileName)

		return json({
			url: publicUrl,
			path: fileName,
			bucket
		})
	} catch (err: any) {
		console.error('Upload error:', err)
		if (err.status) {
			throw err
		}
		throw error(500, err.message || 'Internal server error')
	}
}