# Lazy Loading Images Implementation

## Overview

Implemented an advanced lazy loading system for images that adapts to device capabilities, viewport size, and network conditions. This significantly improves page load performance and reduces bandwidth usage.

## Features

### 1. Adaptive Loading Strategy

The system dynamically adjusts loading behavior based on:

- **Viewport Size**: Calculates optimal number of images to load eagerly
- **Network Speed**: Reduces preloading on slow connections
- **Device Type**: Different strategies for mobile vs desktop
- **Save Data Mode**: Respects user's data saving preferences

### 2. Smart Eager Loading

Instead of a fixed number of eager-loaded images, the system calculates the optimal count:

```javascript
// Mobile (< 768px): 2 columns
// Tablet (768-1024px): 3 columns  
// Desktop (1024-1536px): 4 columns
// Large Desktop (> 1536px): 5 columns

// Calculates visible rows based on viewport height
// Adds buffer for smooth scrolling
```

### 3. Progressive Enhancement

- **Native lazy loading**: Uses browser's built-in `loading="lazy"` when supported
- **Intersection Observer**: Fallback for older browsers
- **Placeholder images**: Low-quality placeholders for better perceived performance
- **Connection-aware**: Adjusts root margin based on connection speed

## Implementation

### Core Components

1. **`/src/lib/utils/lazy-loading.ts`**
   - Core utilities for adaptive loading
   - Connection detection
   - Placeholder generation
   - Loading strategy calculation

2. **`/src/lib/components/common/EnhancedImage.svelte`**
   - Advanced image component with all optimizations
   - Blur-up placeholder technique
   - Error handling with fallbacks
   - Priority hints support

3. **`/src/lib/actions/lazyLoad.ts`**
   - Svelte action for easy lazy loading
   - Batch optimization for multiple images
   - Custom events for tracking

### Updated Components

1. **`ListingGrid.svelte`**
   - Uses adaptive eager loading count
   - Responds to viewport changes
   - Optimized for different screen sizes

2. **`ResponsiveImage.svelte`**
   - Enhanced with width/height attributes
   - Fetchpriority support
   - Adaptive root margins
   - Placeholder support

## Usage Examples

### Basic Lazy Loading

```svelte
<ResponsiveImage 
  src={imageUrl}
  alt="Product image"
  loading="lazy"
  width={400}
  height={600}
/>
```

### Priority Image

```svelte
<ResponsiveImage 
  src={heroImage}
  alt="Hero image"
  loading="eager"
  fetchpriority="high"
  sizes="100vw"
/>
```

### Using the Action

```svelte
<script>
  import { lazyLoad } from '$lib/actions/lazyLoad';
</script>

<img 
  use:lazyLoad={{ rootMargin: '100px' }}
  data-src="image.jpg"
  alt="Lazy loaded image"
/>
```

### Enhanced Image Component

```svelte
<EnhancedImage
  src={productImage}
  alt="Product"
  width={800}
  height={1200}
  priority={index < 4}
  usePlaceholder={true}
  lazyOptions={{ rootMargin: '200px' }}
/>
```

## Performance Metrics

### Expected Improvements

- **Initial Page Load**: 40-60% faster for image-heavy pages
- **Bandwidth Usage**: 50-70% reduction on initial load
- **LCP (Largest Contentful Paint)**: 30-40% improvement
- **CLS (Cumulative Layout Shift)**: Near zero with width/height attributes

### Monitoring

```javascript
// Track lazy loading effectiveness
window.addEventListener('lazyloaded', (e) => {
  analytics.track('image_lazy_loaded', {
    src: e.detail.src,
    timing: performance.now()
  });
});
```

## Configuration

### Loading Strategies by Device/Connection

| Condition | Eager Count | Root Margin | Placeholder | Preload Next |
|-----------|------------|-------------|-------------|--------------|
| Slow Connection + Mobile | 2 | 0px | Yes | 0 |
| Slow Connection + Desktop | 4 | 0px | Yes | 0 |
| Fast Connection + Mobile | Calculated | 100px | Yes | 2 |
| Fast Connection + Desktop | Calculated | 200px | No | 4 |

## Best Practices

1. **Always specify dimensions**: Include width/height to prevent layout shifts
2. **Use appropriate sizes**: Provide accurate `sizes` attribute for responsive images
3. **Priority hints**: Use `fetchpriority="high"` for above-fold images
4. **Preload critical images**: Use `loading="eager"` for hero images
5. **Test on slow connections**: Verify behavior with throttled network

## Browser Support

- **Native lazy loading**: Chrome 76+, Firefox 75+, Safari 15.4+
- **Intersection Observer**: All modern browsers, IE11 with polyfill
- **Fetchpriority**: Chrome 102+, with graceful degradation

## Future Enhancements

1. **AVIF/WebP with fallbacks**: Already implemented in OptimizedImage
2. **Blur hash placeholders**: Generate compact blur representations
3. **Priority hints API**: When browser support improves
4. **Resource hints**: Preconnect to image CDNs
5. **Service worker caching**: Offline image support

## Migration Guide

To migrate existing images to lazy loading:

1. Add width/height attributes to prevent layout shift
2. Change `loading="eager"` to `loading="lazy"` for below-fold images
3. Update ListingCard usage to pass width/height
4. Consider using EnhancedImage for critical images

## Testing

Test lazy loading effectiveness:

1. Use Chrome DevTools Network tab
2. Enable "Disable cache" and throttle to "Slow 3G"
3. Verify images load as you scroll
4. Check no layout shifts occur
5. Monitor Core Web Vitals in Lighthouse