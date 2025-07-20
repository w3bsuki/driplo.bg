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
			throw error(400, 'File too large (max 5MB)')
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop()
		const fileName = `${user.id}/${uuidv4()}.${fileExt}`

		// Upload to Supabase Storage
		const { data, error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(fileName, file, {
				contentType: file.type,
				upsert: false
			})

		if (uploadError) {
			console.error('Upload error:', uploadError)
			throw error(500, uploadError.message || 'Upload failed')
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