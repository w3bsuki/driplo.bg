# HTTP Caching Strategy Implementation

## Overview

This document describes the HTTP caching strategy implemented for the Driplo marketplace to improve performance and reduce server load.

## Implementation Details

### 1. Cache Headers Utility (`/src/lib/utils/cache-headers.ts`)

Created a comprehensive caching utility that provides:
- Type-safe cache configuration
- Common cache presets for different content types
- Easy-to-use API for setting cache headers

### 2. Global Caching Handler (`/src/hooks.server.ts`)

Added `handleCaching` to the request pipeline that:
- Automatically applies cache headers based on URL patterns
- Respects manually set cache headers from routes
- Only caches GET requests
- Adds proper Vary headers for content negotiation

### 3. Route-Specific Caching

Updated key routes to use optimal caching strategies:
- **Browse page**: 5 min browser, 1 hour CDN cache
- **Listing pages**: 10 min browser, 24 hour CDN cache
- **Profile pages**: 1 min browser, 5 min CDN cache

## Cache Presets

| Preset | Browser Cache | CDN Cache | Use Case |
|--------|--------------|-----------|----------|
| `noCache` | No store | No store | User-specific data |
| `static` | 1 year | 1 year | CSS, JS, images |
| `api` | 0 seconds | 1 minute | API responses |
| `browse` | 5 minutes | 1 hour | Browse/category pages |
| `product` | 10 minutes | 24 hours | Product detail pages |
| `profile` | 1 minute | 5 minutes | User profiles |
| `search` | 1 minute | 5 minutes | Search results |
| `private` | Browser only | No CDN | Private user data |

## Default Route Caching

The global handler applies these defaults:

| Route Pattern | Cache Strategy | Reason |
|--------------|----------------|---------|
| `/_app/*`, `*.js`, `*.css` | 1 year immutable | Static assets with hash |
| `/api/*` | No browser, 1 min CDN | Fresh data, CDN offload |
| `/auth/*`, `/account/*` | No store | Private user data |
| `/`, `/browse` | 5 min browser, 1 hour CDN | Frequently updated |
| `/listings/*` | 10 min browser, 24 hour CDN | Stable content |
| `/sellers/*`, `/brands/*` | 1 min browser, 5 min CDN | Profile updates |

## Usage in Routes

### Basic Usage
```typescript
import { setCacheHeaders, cachePresets } from '$lib/utils/cache-headers'

export const load = async ({ setHeaders }) => {
  // Use a preset
  setCacheHeaders({ setHeaders }, cachePresets.browse)
  
  // Or custom configuration
  setCacheHeaders({ setHeaders }, {
    maxAge: 300,      // 5 minutes browser
    sMaxAge: 3600,    // 1 hour CDN
    mustRevalidate: true
  })
}
```

### Conditional Caching
```typescript
export const load = async ({ setHeaders, locals }) => {
  const { session } = await locals.safeGetSession()
  
  if (session) {
    // Private data for logged-in users
    setCacheHeaders({ setHeaders }, cachePresets.private)
  } else {
    // Public data can be cached
    setCacheHeaders({ setHeaders }, cachePresets.browse)
  }
}
```

## Vary Headers

The caching handler automatically adds appropriate Vary headers:
- `Accept-Encoding`: For compression negotiation
- `Accept-Language`: For i18n content

## Best Practices

1. **Use Database Caching**: The app already implements database-level caching. HTTP caching complements this.

2. **Cache Invalidation**: When content updates:
   - Database cache is invalidated automatically
   - HTTP cache expires based on TTL
   - Consider cache busting for critical updates

3. **Private vs Public**: 
   - Always use `private` or `no-store` for user-specific data
   - Use `public` for content same for all users

4. **Mobile Considerations**:
   - Short browser cache times respect mobile data limits
   - CDN caching reduces bandwidth for all users

## Performance Impact

Expected improvements:
- **50-70%** reduction in server requests for repeat visitors
- **200-500ms** faster page loads from browser cache
- **30-50%** reduction in bandwidth usage
- **Better SEO** from faster page loads

## Monitoring

Monitor cache effectiveness using:
1. CDN analytics for cache hit rates
2. Browser DevTools Network tab
3. Server logs for origin requests
4. Core Web Vitals scores

## Next Steps

1. Monitor cache hit rates after deployment
2. Adjust TTLs based on content update patterns
3. Consider implementing cache warming for popular pages
4. Add cache purge API for content updates