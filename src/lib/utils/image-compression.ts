/**
 * Image compression utilities for handling large images from mobile cameras
 * Includes iOS-specific handling for HEIC/HEIF formats
 */

interface CompressionOptions {
	maxWidth?: number
	maxHeight?: number
	quality?: number
	maxSizeMB?: number
	handleHEIC?: boolean
}

/**
 * Compress an image file to reduce size while maintaining quality
 * Handles both Android large files and iOS HEIC format conversion
 */
export async function compressImage(
	file: File,
	options: CompressionOptions = {}
): Promise<File> {
	const {
		maxWidth = 1920,
		maxHeight = 1920,
		quality = 0.85,
		maxSizeMB = 5,
		handleHEIC = true
	} = options

	// Handle HEIC files (iOS)
	if (handleHEIC && (file.type === 'image/heic' || file.type === 'image/heif')) {
		console.log('Converting HEIC/HEIF to JPEG:', file.name)
		// The browser will handle conversion when drawing to canvas
		// We'll ensure the output is JPEG
	}

	// Skip compression for already small files
	const maxSizeBytes = maxSizeMB * 1024 * 1024
	const needsResizeCheck = await needsResize(file, maxWidth, maxHeight)
	if (file.size <= maxSizeBytes && !needsResizeCheck && file.type !== 'image/heic' && file.type !== 'image/heif') {
		return file
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		
		reader.onload = (e) => {
			const img = new Image()
			
			img.onload = () => {
				try {
					// Calculate new dimensions
					let { width, height } = calculateDimensions(
						img.width,
						img.height,
						maxWidth,
						maxHeight
					)

					// Create canvas for compression
					const canvas = document.createElement('canvas')
					const ctx = canvas.getContext('2d')
					
					if (!ctx) {
						reject(new Error('Failed to get canvas context'))
						return
					}

					canvas.width = width
					canvas.height = height

					// Use better image smoothing for quality
					ctx.imageSmoothingEnabled = true
					ctx.imageSmoothingQuality = 'high'
					
					// Draw and compress
					ctx.drawImage(img, 0, 0, width, height)
					
					// Convert to blob with quality setting
					// Always output as JPEG for better compatibility (especially for HEIC)
					const outputType = (file.type === 'image/png' && file.size < 1024 * 1024) ? 'image/png' : 'image/jpeg'
					
					canvas.toBlob(
						(blob) => {
							if (!blob) {
								reject(new Error('Failed to compress image'))
								return
							}

							// Create new file with compressed data
							const outputFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
							const compressedFile = new File(
								[blob],
								outputFileName,
								{
									type: outputType,
									lastModified: Date.now()
								}
							)

							// If still too large, recursively compress with lower quality
							if (compressedFile.size > maxSizeBytes && quality > 0.3) {
								compressImage(file, {
									...options,
									quality: quality - 0.1
								}).then(resolve).catch(reject)
							} else {
								resolve(compressedFile)
							}
						},
						outputType,
						quality
					)
				} catch (error) {
					reject(error)
				}
			}
			
			img.onerror = () => {
				reject(new Error('Failed to load image'))
			}
			
			img.src = e.target?.result as string
		}
		
		reader.onerror = () => {
			reject(new Error('Failed to read file'))
		}
		
		reader.readAsDataURL(file)
	})
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
	originalWidth: number,
	originalHeight: number,
	maxWidth: number,
	maxHeight: number
): { width: number; height: number } {
	// If image is already within bounds, return original dimensions
	if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
		return { width: originalWidth, height: originalHeight }
	}

	// Calculate ratios
	const widthRatio = maxWidth / originalWidth
	const heightRatio = maxHeight / originalHeight
	const ratio = Math.min(widthRatio, heightRatio)

	return {
		width: Math.round(originalWidth * ratio),
		height: Math.round(originalHeight * ratio)
	}
}

/**
 * Check if image needs resizing (for performance optimization)
 */
async function needsResize(
	file: File,
	maxWidth: number,
	maxHeight: number
): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image()
		const url = URL.createObjectURL(file)
		
		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve(img.width > maxWidth || img.height > maxHeight)
		}
		
		img.onerror = () => {
			URL.revokeObjectURL(url)
			resolve(false) // Assume no resize needed if we can't check
		}
		
		img.src = url
	})
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
	files: File[],
	options: CompressionOptions = {},
	onProgress?: (progress: number) => void
): Promise<File[]> {
	const compressed: File[] = []
	
	for (let i = 0; i < files.length; i++) {
		try {
			const compressedFile = await compressImage(files[i], options)
			compressed.push(compressedFile)
			
			if (onProgress) {
				onProgress(((i + 1) / files.length) * 100)
			}
		} catch (error) {
			console.error(`Failed to compress image ${files[i].name}:`, error)
			// Add original file if compression fails
			compressed.push(files[i])
		}
	}
	
	return compressed
}