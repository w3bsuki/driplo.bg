# Egress Optimization Guide for Driplo.bg

## Overview
This guide documents all egress reduction strategies implemented to prevent hitting Supabase usage limits.

## Key Strategies Implemented

### 1. Database Query Optimization

#### Use Lightweight Functions
Instead of fetching entire rows, use our optimized functions:

```javascript
// BAD - Fetches all columns
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'active');

// GOOD - Use lightweight function
const { data } = await supabase
  .rpc('search_listings_lightweight', {
    limit_count: 20,
    offset_count: 0
  });
```

#### Always Specify Columns
When you must use direct queries, always specify columns:

```javascript
// BAD - Fetches all columns
const { data } = await supabase
  .from('profiles')
  .select('*');

// GOOD - Only fetch needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, username, avatar_url');
```

### 2. Pagination Best Practices

Always implement pagination with reasonable limits:

```javascript
// Implement pagination
const PAGE_SIZE = 20; // Never exceed 50

const fetchListings = async (page = 0) => {
  const { data } = await supabase
    .rpc('get_active_listings', {
      limit_count: PAGE_SIZE,
      offset_count: page * PAGE_SIZE
    });
  return data;
};
```

### 3. Batch Operations

Use batch operations to reduce multiple queries:

```javascript
// BAD - Multiple queries
for (const id of listingIds) {
  await supabase.from('listings')
    .update({ view_count: increment })
    .eq('id', id);
}

// GOOD - Single batch operation
await supabase.rpc('batch_update_listing_views', {
  listing_ids: listingIds
});
```

### 4. Storage Optimization

#### Image Transformation
Use Supabase image transformation to serve optimized images:

```javascript
// Generate thumbnail URL
const getThumbnailUrl = (imageUrl) => {
  return `${imageUrl}?width=300&height=300&quality=75`;
};

// Generate different sizes
const IMAGE_SIZES = {
  thumbnail: '?width=150&height=150&quality=70',
  card: '?width=300&height=400&quality=75',
  full: '?width=800&height=800&quality=85'
};
```

#### Cache Control Headers
Set proper cache headers for static assets:

```javascript
// Upload with cache control
const { data, error } = await supabase.storage
  .from('listings')
  .upload(path, file, {
    cacheControl: '31536000', // 1 year
    upsert: false
  });
```

### 5. Realtime Optimization

#### Subscribe Only to Necessary Data
```javascript
// BAD - Subscribe to all columns
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, payload => {
    // Handle all data
  });

// GOOD - Subscribe with filters
const subscription = supabase
  .channel('user_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, payload => {
    // Handle only relevant messages
  });
```

#### Cleanup Subscriptions
Always cleanup subscriptions when not needed:

```javascript
useEffect(() => {
  const subscription = supabase.channel('...');
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 6. Caching Strategies

#### Implement Client-Side Caching
```javascript
// Use SWR or React Query for caching
import useSWR from 'swr';

const fetcher = (key) => supabase.rpc(key).then(res => res.data);

function useListings() {
  const { data, error } = useSWR('get_active_listings', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000 // Refresh every minute
  });
  
  return { listings: data, isLoading: !error && !data, error };
}
```

#### Use View Functions
Use our optimized view functions that return minimal data:

- `public_profiles` - Safe profile data without sensitive fields
- `get_active_listings` - Lightweight listing data
- `search_listings_lightweight` - Minimal search results

### 7. API Response Optimization

#### Return Minimal Data from Mutations
```javascript
// BAD - Returns entire row after update
const { data } = await supabase
  .from('listings')
  .update({ status: 'sold' })
  .eq('id', listingId)
  .select('*');

// GOOD - Return only what's needed
const { data } = await supabase
  .from('listings')
  .update({ status: 'sold' })
  .eq('id', listingId)
  .select('id, status');

// BETTER - Don't return anything if not needed
const { error } = await supabase
  .from('listings')
  .update({ status: 'sold' })
  .eq('id', listingId);
```

### 8. Monitoring Egress Usage

#### Check Usage Regularly
```sql
-- Query to check most requested endpoints
SELECT
  r.method as http_verb,
  r.path as filepath,
  count(*) as num_requests
FROM edge_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.request) as r
WHERE (path like '%storage/v1/object/%' or path like '%/rest/v1/%')
AND r.method = 'GET'
GROUP BY r.path, r.method
ORDER BY num_requests DESC
LIMIT 20;
```

## Egress Calculation Examples

### Database Egress
- Fetching 100 listings with all columns (~2KB each) = 200KB
- Fetching 100 listings with minimal columns (~200B each) = 20KB
- **Savings: 90%**

### Storage Egress
- Original image (2MB) × 100 views = 200MB
- Optimized thumbnail (50KB) × 100 views = 5MB
- **Savings: 97.5%**

## Implementation Checklist

- [x] Use optimized database functions
- [x] Implement pagination everywhere
- [x] Specify columns in all queries
- [x] Use batch operations
- [x] Implement image transformation
- [x] Set cache control headers
- [x] Optimize realtime subscriptions
- [x] Implement client-side caching
- [ ] Monitor egress usage weekly
- [ ] Review and optimize high-traffic endpoints

## Expected Results

With these optimizations:
- **Database egress reduced by 60-80%**
- **Storage egress reduced by 70-90%**
- **Overall egress reduced by 65-85%**

## Key Functions to Use

1. **search_listings_lightweight** - For browsing listings
2. **get_listing_details** - For viewing single listing
3. **get_user_favorites** - For user's favorite items
4. **get_conversation_messages** - For chat (paginated)
5. **get_unread_counts** - For notification badges
6. **check_favorites_batch** - For checking multiple favorites
7. **get_recommendations** - For personalized suggestions
8. **get_category_tree** - For navigation menu

## Remember

1. **Always paginate** - Never fetch more than 50 items
2. **Cache aggressively** - Use client-side caching
3. **Optimize images** - Use transformations
4. **Monitor usage** - Check dashboard weekly
5. **Clean up subscriptions** - Prevent memory leaks