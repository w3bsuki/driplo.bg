import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Parse a Supabase storage URL to extract bucket and path
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
	const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
	if (!match) return null;
	
	const [, bucket, path] = match;
	return { bucket: bucket ?? '', path: path ?? '' };
}

/**
 * Generate picture element sources for modern image formats
 */
export function generatePictureSources(
	bucket: string,
	path: string,
	options: {
		widths: number[];
		formats: Array<'avif' | 'webp' | 'jpg'>;
		quality?: number;
	}
): Array<{ type: string; srcset: string }> {
	const { widths, formats, quality = 80 } = options;
	const sources: Array<{ type: string; srcset: string }> = [];
	
	// Generate sources for each format except jpg (fallback)
	const modernFormats = formats.filter(f => f !== 'jpg');
	
	for (const format of modernFormats) {
		const srcsetParts = widths.map(width => {
			const url = getTransformedImageUrl({
				bucket,
				path,
				width,
				quality,
				format
			});
			return `${url} ${width}w`;
		});
		
		sources.push({
			type: `image/${format}`,
			srcset: srcsetParts.join(', ')
		});
	}
	
	return sources;
}

/**
 * Generate a transformed image URL using Supabase Image Transformation API
 */
export function getTransformedImageUrl(options: {
	bucket: string;
	path: string;
	width?: number;
	height?: number;
	resize?: 'cover' | 'contain' | 'fill';
	quality?: number;
	format?: 'origin' | 'avif' | 'webp' | 'jpg' | 'png';
}): string {
	const { bucket, path, width, height, resize, quality, format } = options;
	
	// Build transformation parameters
	const params = new URLSearchParams();
	
	if (width) params.append('width', width.toString());
	if (height) params.append('height', height.toString());
	if (resize) params.append('resize', resize);
	if (quality) params.append('quality', quality.toString());
	if (format && format !== 'origin') {
		params.append('format', format);
	}
	
	const queryString = params.toString();
	const transformPath = queryString ? `?${queryString}` : '';
	
	return `${PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${path}${transformPath}`;
}