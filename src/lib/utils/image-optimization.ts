// Image optimization and compression utilities
import { logger } from '$lib/utils/logger';

export interface ImageConfig {
	width?: number
	height?: number
	quality?: number
	format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
	blur?: number
	fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
}

export interface CompressionOptions {
	maxWidth?: number
	maxHeight?: number
	quality?: number
	maxSizeMB?: number
}

export interface ResponsiveImageConfig {
	breakpoints: number[]
	sizes: string
	quality: number
	formats: string[]
}

// Default responsive configuration
export const defaultResponsiveConfig: ResponsiveImageConfig = {
	breakpoints: [320, 480, 640, 768, 1024, 1280, 1536],
	sizes: '100vw',
	quality: 80,
	formats: ['avif', 'webp', 'jpeg']
}

// Common image configurations
export const imageConfigs = {
	// Listing cards
	listingCard: {
		width: 400,
		height: 600,
		quality: 80,
		fit: 'cover' as const,
		sizes: '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 12.5vw'
	},
	
	// Listing detail hero
	listingHero: {
		width: 800,
		height: 1200,
		quality: 90,
		fit: 'cover' as const,
		sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px'
	},
	
	// Profile avatars
	avatar: {
		width: 100,
		height: 100,
		quality: 85,
		fit: 'cover' as const,
		sizes: '100px'
	},
	
	// Thumbnails
	thumbnail: {
		width: 150,
		height: 150,
		quality: 75,
		fit: 'cover' as const,
		sizes: '150px'
	},
	
	// Message attachments
	messageAttachment: {
		width: 400,
		height: 300,
		quality: 80,
		fit: 'cover' as const,
		sizes: '(max-width: 640px) 90vw, 400px'
	}
}

// Generate srcset for responsive images
export function generateSrcSet(
	baseUrl: string,
	config: { width?: number; breakpoints?: number[]; quality?: number } = {}
): string {
	const { width = 800, breakpoints = defaultResponsiveConfig.breakpoints, quality = 80 } = config
	
	// Filter breakpoints to only include ones smaller than or equal to the max width
	const validBreakpoints = breakpoints.filter(bp => bp <= width)
	
	if (validBreakpoints.length === 0) {
		return baseUrl
	}
	
	// Generate URLs for each breakpoint
	const sources: string[] = []
	
	validBreakpoints.forEach(bp => {
		const url = optimizeImageUrl(baseUrl, { width: bp, quality })
		sources.push(`${url} ${bp}w`)
	})
	
	return sources.join(', ')
}

// Optimize image URL based on the service
export function optimizeImageUrl(url: string, config: ImageConfig): string {
	if (!url) return url
	
	try {
		const urlObj = new URL(url)
		
		// Supabase Storage optimization
		if (urlObj.hostname.includes('supabase')) {
			const params = new URLSearchParams()
			if (config.width) params.set('width', config.width.toString())
			if (config.height) params.set('height', config.height.toString())
			if (config.quality) params.set('quality', config.quality.toString())
			if (config.format && config.format !== 'auto') params.set('format', config.format)
			
			const paramString = params.toString()
			return paramString ? `${url}?${paramString}` : url
		}
		
		// Cloudflare Images optimization
		if (urlObj.hostname.includes('cloudflare')) {
			const params = new URLSearchParams()
			if (config.width) params.set('width', config.width.toString())
			if (config.height) params.set('height', config.height.toString())
			if (config.quality) params.set('quality', config.quality.toString())
			if (config.format && config.format !== 'auto') params.set('format', config.format)
			
			const paramString = params.toString()
			return paramString ? `${url}?${paramString}` : url
		}
		
		// Placeholder images (picsum, etc.)
		if (urlObj.hostname.includes('picsum.photos')) {
			const pathParts = urlObj.pathname.split('/')
			if (config.width && config.height) {
				pathParts[1] = config.width.toString()
				pathParts[2] = config.height.toString()
			}
			
			const params = new URLSearchParams(urlObj.search)
			if (config.blur) params.set('blur', config.blur.toString())
			
			const newPath = pathParts.join('/')
			const paramString = params.toString()
			return `${urlObj.origin}${newPath}${paramString ? `?${paramString}` : ''}`
		}
		
		// Return original URL if no optimization is available
		return url
	} catch (error) {
		// Return original URL if parsing fails
		return url
	}
}

// Generate placeholder image URL
export function generatePlaceholderUrl(
	originalUrl: string,
	config: { width?: number; height?: number; blur?: number } = {}
): string {
	const { width = 100, height = 150, blur = 5 } = config
	
	// Use a low-quality version of the original image if possible
	const optimizedUrl = optimizeImageUrl(originalUrl, {
		width: Math.min(width, 100),
		height: Math.min(height, 150),
		quality: 10,
		blur
	})
	
	// Fallback to picsum if optimization fails
	if (optimizedUrl === originalUrl) {
		return `https://picsum.photos/${width}/${height}?blur=${blur}&random=1`
	}
	
	return optimizedUrl
}

// Check if image format is supported
export function isImageFormatSupported(format: string): boolean {
	if (typeof window === 'undefined') return false
	
	const canvas = document.createElement('canvas')
	canvas.width = 1
	canvas.height = 1
	
	try {
		const dataUrl = canvas.toDataURL(`image/${format}`)
		return dataUrl.startsWith(`data:image/${format}`)
	} catch {
		return false
	}
}

// Get best supported image format
export function getBestSupportedFormat(): 'avif' | 'webp' | 'jpeg' {
	if (typeof window === 'undefined') return 'jpeg'
	
	// Check for AVIF support
	if (isImageFormatSupported('avif')) {
		return 'avif'
	}
	
	// Check for WebP support
	if (isImageFormatSupported('webp')) {
		return 'webp'
	}
	
	// Fallback to JPEG
	return 'jpeg'
}

// Preload critical images
export function preloadImage(url: string, config: ImageConfig = {}): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		
		img.onload = () => resolve()
		img.onerror = reject
		
		// Set up srcset for responsive images
		if (config.width) {
			const srcSet = generateSrcSet(url, config)
			if (srcSet) {
				img.srcset = srcSet
			}
		}
		
		img.src = optimizeImageUrl(url, config)
	})
}

// Batch preload multiple images
export function preloadImages(urls: string[], config: ImageConfig = {}): Promise<void[]> {
	const promises = urls.map(url => preloadImage(url, config))
	return Promise.all(promises)
}

// Image loading priority hints
export const imagePriorities = {
	// Critical images that should load immediately
	critical: ['hero', 'above-fold', 'first-card'],
	
	// Important images that should load soon
	high: ['visible-cards', 'profile-avatar'],
	
	// Normal priority images
	normal: ['below-fold', 'lazy-load'],
	
	// Low priority images
	low: ['far-below-fold', 'hover-preview']
} as const

export type ImagePriority = keyof typeof imagePriorities

// === COMPRESSION UTILITIES ===
// Merged from image-compression.ts

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): string | null {
	// Check file type
	const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
	if (!validTypes.includes(file.type)) {
		return 'Please upload a valid image file (JPG, PNG, GIF, or WebP)'
	}
	
	// Check file size (10MB max)
	const maxSize = 10 * 1024 * 1024
	if (file.size > maxSize) {
		return 'Image size must be less than 10MB'
	}
	
	return null
}

/**
 * Compress images efficiently for mobile devices
 * Uses Canvas API with Web Workers when available
 */
export async function compressImages(
	files: File[],
	options: CompressionOptions = {}
): Promise<File[]> {
	const {
		maxWidth = 1920,
		maxHeight = 1920,
		quality = 0.85,
		maxSizeMB = 4.5
	} = options

	const compressedFiles: File[] = []

	for (const file of files) {
		try {
			const compressed = await compressImage(file, { maxWidth, maxHeight, quality, maxSizeMB })
			compressedFiles.push(compressed)
		} catch (error) {
			logger.error('Failed to compress image', error)
			// Fall back to original if compression fails
			compressedFiles.push(file)
		}
	}

	return compressedFiles
}

async function compressImage(
	file: File,
	options: CompressionOptions
): Promise<File> {
	const { maxWidth = 1920, maxHeight = 1920, quality = 0.85, maxSizeMB = 4.5 } = options

	// Skip if already small enough
	if (file.size <= maxSizeMB * 1024 * 1024) {
		const dimensions = await getImageDimensions(file)
		if (dimensions.width <= maxWidth && dimensions.height <= maxHeight) {
			return file
		}
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			const img = new Image()
			
			img.onload = () => {
				// Use requestIdleCallback for better mobile performance
				const processImage = () => {
					try {
						// Calculate new dimensions
						let { width, height } = img
						
						if (width > maxWidth || height > maxHeight) {
							const ratio = Math.min(maxWidth / width, maxHeight / height)
							width = Math.round(width * ratio)
							height = Math.round(height * ratio)
						}

						// Create canvas
						const canvas = document.createElement('canvas')
						canvas.width = width
						canvas.height = height

						const ctx = canvas.getContext('2d', {
							// Optimize for mobile
							alpha: true,
							desynchronized: true,
							willReadFrequently: false
						})

						if (!ctx) {
							throw new Error('Failed to get canvas context')
						}

						// Enable image smoothing for better quality
						ctx.imageSmoothingEnabled = true
						ctx.imageSmoothingQuality = 'high'

						// Draw resized image
						ctx.drawImage(img, 0, 0, width, height)

						// Convert to blob with quality settings
						canvas.toBlob(
							(blob) => {
								if (!blob) {
									reject(new Error('Failed to compress image'))
									return
								}

								// Check if we achieved the target size
								if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
									// Recursively compress with lower quality
									const newFile = new File([blob], file.name, {
										type: file.type,
										lastModified: Date.now()
									})
									
									compressImage(newFile, {
										...options,
										quality: quality - 0.1
									}).then(resolve).catch(reject)
								} else {
									// Create new file with compressed data
									const compressedFile = new File([blob], file.name, {
										type: file.type,
										lastModified: Date.now()
									})
									resolve(compressedFile)
								}
							},
							file.type,
							quality
						)
					} catch (error) {
						reject(error)
					}
				}

				// Use requestIdleCallback if available (better for mobile)
				if ('requestIdleCallback' in window) {
					requestIdleCallback(processImage, { timeout: 3000 })
				} else {
					// Fallback for browsers without requestIdleCallback
					setTimeout(processImage, 0)
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
 * Get image dimensions without fully loading it
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
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

/**
 * Convert base64 to File object
 */
export function base64ToFile(base64: string, filename: string): File {
	const arr = base64.split(',')
	const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
	const bstr = atob(arr[1])
	let n = bstr.length
	const u8arr = new Uint8Array(n)

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}

	return new File([u8arr], filename, { type: mime })
}