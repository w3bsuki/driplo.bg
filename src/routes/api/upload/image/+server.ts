import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession()
	
	if (!session?.user) {
		throw error(401, 'Unauthorized')
	}

	try {
		const formData = await request.formData()
		const file = formData.get('file') as File
		const type = formData.get('type') as string || 'general' // avatar, cover, listing, general
		
		if (!file) {
			throw error(400, 'No file provided')
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.type)) {
			throw error(400, 'Invalid file type')
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			throw error(400, 'File too large')
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop()
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
		
		// Determine storage path based on type
		let storagePath = ''
		switch (type) {
			case 'avatar':
				storagePath = `avatars/${session.user.id}/${fileName}`
				break
			case 'cover':
				storagePath = `covers/${session.user.id}/${fileName}`
				break
			case 'listing':
				storagePath = `listings/${session.user.id}/${fileName}`
				break
			default:
				storagePath = `general/${session.user.id}/${fileName}`
		}

		// Upload to Supabase Storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('images')
			.upload(storagePath, file, {
				cacheControl: '3600',
				upsert: false
			})

		if (uploadError) {
			console.error('Upload error:', uploadError)
			throw error(500, 'Failed to upload image')
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('images')
			.getPublicUrl(uploadData.path)

		if (!urlData?.publicUrl) {
			throw error(500, 'Failed to get image URL')
		}

		// If this is an avatar or cover update, update the user's profile
		if (type === 'avatar' || type === 'cover') {
			const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url'
			
			const { error: profileError } = await supabase
				.from('profiles')
				.update({ [updateField]: urlData.publicUrl })
				.eq('id', session.user.id)

			if (profileError) {
				console.error('Profile update error:', profileError)
				// Don't throw error here, just log it
			}
		}

		return json({
			url: urlData.publicUrl,
			path: uploadData.path,
			type
		})
	} catch (err) {
		console.error('Image upload error:', err)
		if (err instanceof Error && 'status' in err) {
			throw err
		}
		throw error(500, 'Internal server error')
	}
}