/**
 * Optimizes Supabase storage image URLs with transformations
 */

interface ImageTransformOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'origin' | 'webp' | 'avif';
	resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Get optimized image URL with Supabase transformations
 * @param url - Original Supabase storage URL
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
	url: string | null | undefined,
	options: ImageTransformOptions = {}
): string {
	if (!url) return '/images/placeholder.jpg';
	
	// Check if it's a Supabase storage URL
	if (!url.includes('supabase.co/storage') && !url.includes('supabase.in/storage')) {
		return url; // Return as-is for non-Supabase URLs
	}
	
	const {
		width = 400,
		height,
		quality = 75,
		format = 'webp',
		resize = 'cover'
	} = options;
	
	// Build transformation parameters
	const transforms: string[] = [];
	
	if (width) transforms.push(`width=${width}`);
	if (height) transforms.push(`height=${height}`);
	transforms.push(`quality=${quality}`);
	transforms.push(`format=${format}`);
	transforms.push(`resize=${resize}`);
	
	// Add transformation parameters to URL
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}${transforms.join('&')}`;
}

/**
 * Get responsive image srcset for different screen sizes
 * @param url - Original image URL
 * @param sizes - Array of widths to generate
 * @returns srcset string
 */
export function getImageSrcSet(
	url: string | null | undefined,
	sizes: number[] = [200, 400, 600, 800]
): string {
	if (!url) return '';
	
	return sizes
		.map(size => {
			const optimizedUrl = getOptimizedImageUrl(url, { width: size });
			return `${optimizedUrl} ${size}w`;
		})
		.join(', ');
}

/**
 * Preset configurations for common use cases
 */
export const imagePresets = {
	thumbnail: { width: 150, height: 150, quality: 70 },
	card: { width: 400, quality: 75 },
	cardMobile: { width: 200, quality: 70 },
	detail: { width: 800, quality: 85 },
	detailMobile: { width: 400, quality: 80 },
	avatar: { width: 100, height: 100, quality: 80 },
	avatarSmall: { width: 50, height: 50, quality: 75 }
};