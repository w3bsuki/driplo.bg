import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Unified Image Service
 * Consolidates image transformation, optimization, and responsive handling
 */

export interface TransformOptions {
  width?: number;
  height?: number;
  resize?: 'cover' | 'contain' | 'fill';
  quality?: number;
  format?: 'origin' | 'avif' | 'webp' | 'jpg' | 'png';
}

export interface ResponsiveOptions {
  sizes?: string;
  widths?: number[];
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

/**
 * Common image size presets for the marketplace
 */
export const imageSizes = {
  thumbnail: { width: 150, height: 150, resize: 'cover' as const },
  card: { width: 300, height: 400, resize: 'cover' as const },
  cardMobile: { width: 200, height: 267, resize: 'cover' as const },
  detail: { width: 600, height: 800, resize: 'contain' as const },
  detailLarge: { width: 1200, height: 1600, resize: 'contain' as const },
  avatar: { width: 100, height: 100, resize: 'cover' as const },
  avatarLarge: { width: 200, height: 200, resize: 'cover' as const },
  banner: { width: 1200, height: 400, resize: 'cover' as const },
  bannerMobile: { width: 600, height: 200, resize: 'cover' as const }
} as const;

export type ImageSize = keyof typeof imageSizes;

export class ImageService {
  /**
   * Parse a Supabase storage URL to extract bucket and path
   */
  static parseStorageUrl(url: string): { bucket: string; path: string } | null {
    const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
    if (!match) return null;
    
    const [, bucket, path] = match;
    return { bucket: bucket ?? '', path: path ?? '' };
  }

  /**
   * Generate a transformed image URL using Supabase Image Transformation API
   */
  static transform(bucket: string, path: string, options: TransformOptions = {}): string {
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.resize) params.append('resize', options.resize);
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format && options.format !== 'origin') {
      params.append('format', options.format);
    }
    
    const queryString = params.toString();
    const transformPath = queryString ? `?${queryString}` : '';
    
    return `${PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${path}${transformPath}`;
  }

  /**
   * Generate a srcset for responsive images
   */
  static responsive(bucket: string, path: string, widths: number[], options: Omit<TransformOptions, 'width'> = {}): string {
    return widths
      .map(width => {
        const url = this.transform(bucket, path, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get optimized image URL with preset or custom options
   */
  static optimize(
    imageUrl: string | null | undefined,
    size: ImageSize = 'card',
    customOptions?: TransformOptions
  ): string {
    if (!imageUrl) {
      return '/images/placeholder.jpg';
    }
    
    const parsed = this.parseStorageUrl(imageUrl);
    if (!parsed) {
      return imageUrl; // Return original if not a Supabase URL
    }
    
    return this.transform(parsed.bucket, parsed.path, {
      ...imageSizes[size],
      ...customOptions
    });
  }

  /**
   * Generate responsive image props for img elements
   */
  static getResponsiveProps(
    imageUrl: string | null | undefined,
    alt: string,
    options: ResponsiveOptions = {}
  ) {
    const {
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      widths = [200, 300, 400, 600, 800, 1200],
      loading = 'lazy',
      decoding = 'async'
    } = options;

    if (!imageUrl) {
      return {
        src: '/images/placeholder.jpg',
        alt,
        loading,
        decoding
      };
    }

    const parsed = this.parseStorageUrl(imageUrl);
    if (!parsed) {
      return {
        src: imageUrl,
        alt,
        loading,
        decoding
      };
    }

    const srcset = this.responsive(parsed.bucket, parsed.path, widths, { quality: 80 });
    const src = this.transform(parsed.bucket, parsed.path, { width: 600, quality: 80 });

    return {
      src,
      srcset,
      sizes,
      alt,
      loading,
      decoding
    };
  }

  /**
   * Generate picture element sources for modern formats
   */
  static generatePictureSources(
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
        const url = this.transform(bucket, path, { width, quality, format });
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
   * Handle responsive image variants (for backward compatibility)
   */
  static getResponsiveVariant(
    src: string | Record<string, string>,
    preferredSize: 'thumb' | 'small' | 'medium' | 'large' | 'full' = 'medium'
  ): string {
    // If src is a string, return it as-is
    if (typeof src === 'string') {
      return src;
    }

    // If src is an object with size variants, return the preferred size or fallback
    if (src[preferredSize]) {
      return src[preferredSize];
    }

    // Fallback order: medium -> small -> large -> thumb -> full -> first available
    const fallbackOrder = ['medium', 'small', 'large', 'thumb', 'full'];
    
    for (const size of fallbackOrder) {
      if (src[size]) {
        return src[size];
      }
    }

    // Return the first available URL if none of the preferred sizes exist
    const firstUrl = Object.values(src).find(url => url);
    return firstUrl || '/images/placeholder.jpg';
  }

  /**
   * Check if browser supports modern image formats
   */
  static supportsModernFormats(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  /**
   * Get an optimized avatar URL
   */
  static avatar(imageUrl: string | null | undefined, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: 'avatar',
      medium: 'avatarLarge', 
      large: { width: 300, height: 300, resize: 'cover' as const }
    };
    
    const avatarSize = sizeMap[size];
    
    if (typeof avatarSize === 'string') {
      return this.optimize(imageUrl, avatarSize);
    }
    
    return this.optimize(imageUrl, 'avatar', avatarSize);
  }
}

// Export commonly used functions for convenience
export const {
  transform,
  responsive, 
  optimize,
  getResponsiveProps,
  avatar
} = ImageService;