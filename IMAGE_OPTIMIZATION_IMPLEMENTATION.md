# Image Optimization Implementation

## Overview
Comprehensive image optimization has been implemented to drastically reduce Supabase egress and stay within the 5GB free tier limit.

## Key Features Implemented

### 1. Server-Side Image Optimization with Sharp
- **File**: `src/lib/server/image-optimizer.ts`
- Converts all images to WebP format (80% smaller than JPEG)
- Creates multiple responsive sizes:
  - **Avatars**: 50x50 (thumb), 150x150 (small), 300x300 (medium)
  - **Covers**: 400x200 (thumb), 800x400 (medium), 1200x600 (large)
  - **Listings**: 150x150 (thumb), 400x400 (small), 800x800 (medium), 1200x1200 (large)
  - **Full size**: Original dimensions with WebP compression

### 2. Updated Image Upload API
- **File**: `src/routes/api/upload/image/+server.ts`
- Automatically optimizes images on upload
- Stores multiple sizes with responsive URLs
- Deletes old images when updating avatars/covers
- Returns srcSet for responsive image loading

### 3. Responsive Image Component
- **File**: `src/lib/components/ui/ResponsiveImage.svelte`
- Smart image loading with lazy loading by default
- Automatic size selection based on viewport
- Fallback support for missing images
- Progressive loading with skeleton animation
- Native browser lazy loading with IntersectionObserver fallback

### 4. Database Schema Updates
- **Migration**: `supabase/migrations/20250720_add_responsive_images.sql`
- Added `avatar_urls` and `cover_urls` JSONB columns to profiles
- Added `image_urls` JSONB column to listings
- Created GIN indexes for fast queries

### 5. Enhanced Caching
- **Cache Headers**: `public, max-age=31536000, immutable` (1 year)
- Browser will cache images for extended periods
- Reduces repeat downloads significantly

### 6. Migration Script
- **File**: `scripts/optimize-existing-images.ts`
- Batch processes existing images
- Creates optimized versions without breaking existing URLs
- Updates database records with new responsive URLs

## Expected Bandwidth Savings

### Before Optimization
- Average image size: 500KB - 2MB
- No compression or resizing
- No browser caching
- Result: 5.20GB egress (exceeding limit)

### After Optimization
- Thumbnail: ~10-20KB (95% reduction)
- Small: ~30-50KB (90% reduction)
- Medium: ~80-120KB (80% reduction)
- Large: ~150-250KB (75% reduction)
- WebP format: Additional 30% reduction
- Browser caching: 90%+ reduction in repeat views

### Total Expected Reduction: 85-95%
- New estimated egress: 0.5-1GB (well within free tier)

## Implementation Steps

1. **Apply Database Migration**
   ```bash
   npx supabase db push
   ```

2. **Deploy Updated Code**
   - All components now use ResponsiveImage
   - Image uploads automatically optimize

3. **Optimize Existing Images** (Optional)
   ```bash
   npx tsx scripts/optimize-existing-images.ts
   ```

## Usage Examples

### Uploading Images
```javascript
// Images are automatically optimized when uploaded through the API
const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});

const { url, urls, srcSet } = await response.json();
// url: main URL (medium size)
// urls: all size URLs { thumb, small, medium, large, full }
// srcSet: ready-to-use srcset string
```

### Displaying Images
```svelte
<ResponsiveImage
  src={imageUrls || legacyUrl}
  alt="Product image"
  preferredSize="medium"
  sizes="(max-width: 640px) 100vw, 50vw"
  loading="lazy"
/>
```

## Monitoring

### Check Bandwidth Usage
1. Go to Supabase Dashboard > Storage
2. Monitor egress usage
3. Should see immediate reduction after deployment

### Performance Metrics
- Page load times should improve by 50-70%
- Time to interactive reduced significantly
- Core Web Vitals scores improved

## Future Enhancements

1. **Cloudflare R2 Integration**
   - Environment variables already supported
   - Can reduce costs further with R2's free egress

2. **Progressive Enhancement**
   - Add AVIF format support (even better compression)
   - Implement BlurHash for better placeholders

3. **Smart Preloading**
   - Preload images on hover
   - Predictive loading based on user behavior

## Troubleshooting

### Images Not Optimizing
1. Check Sharp is installed: `npm list sharp`
2. Verify server has enough memory for Sharp
3. Check error logs in upload endpoint

### Old Images Still Loading
1. Clear browser cache
2. Run migration script for existing images
3. Check database for updated URLs

### Performance Issues
1. Ensure lazy loading is working
2. Check network tab for proper caching headers
3. Verify WebP images are being served

## Summary
This implementation provides a comprehensive solution to reduce Supabase egress by 85-95% through:
- Server-side image optimization
- Multiple responsive sizes
- WebP format conversion
- Aggressive browser caching
- Lazy loading
- Backwards compatibility

The system is designed to be transparent to users while dramatically reducing bandwidth usage and improving performance.