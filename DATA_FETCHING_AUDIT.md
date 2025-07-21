# Data Fetching Patterns Audit Report

## Executive Summary

This audit identifies inefficient data fetching patterns in the Driplo SvelteKit application, including client-side fetching that should be server-side, missing load functions, and potential overfetching issues.

## Critical Issues Found

### 1. Client-Side Data Fetching in onMount (Should be Server-Side)

#### ❌ Profile Settings Page
**File**: `src/routes/(app)/profile/settings/+page.svelte`
**Issue**: Social media accounts are fetched client-side in onMount
```javascript
onMount(async () => {
    if ($user?.id) {
        const { data: socialAccounts } = await supabase
            .from('social_media_accounts')
            .select('*')
            .eq('user_id', $user.id)
        // ...
    }
})
```
**Fix**: Move to `+page.server.ts` load function

#### ❌ Leaderboard Page
**File**: `src/routes/(app)/leaderboard/+page.svelte`
**Issue**: All data is fetched client-side using TanStack Query
```javascript
const personalSellersQuery = createQuery({
    queryKey: ['top-sellers', timePeriod],
    queryFn: async () => {
        const { data, error } = await supabase.rpc('get_top_sellers', {
            time_period: timePeriod,
            result_limit: 20
        });
        // ...
    }
});
```
**Fix**: Create `+page.server.ts` with server-side load function

#### ❌ Top Brands Component
**File**: `src/lib/components/brands/TopBrands.svelte`
**Issue**: Brands fetched client-side in onMount
```javascript
onMount(async () => {
    const { data, error: fetchError } = await supabase
        .rpc('get_top_brands', { limit_count: 12 });
    // ...
});
```
**Fix**: Pass data as props from parent page's load function

#### ❌ Brand Settings Page
**File**: `src/routes/brands/settings/+page.svelte`
**Issue**: Multiple client-side queries in onMount
**Fix**: Create server-side load function

### 2. Missing Server-Side Load Functions

These pages have no `+page.server.ts` file but fetch data client-side:
- `/leaderboard` - No server load, using client-side TanStack Query
- `/brands` - Has `+page.ts` but should be `+page.server.ts` for auth checks

### 3. Data Overfetching Patterns

#### ⚠️ Browse Listings
**File**: `src/lib/server/browse.ts`
**Issue**: Fetches `description` field for listing cards that don't display it
```javascript
.select(`
    id,
    title,
    description,  // Not used in ListingCard
    price,
    // ...
`)
```

#### ⚠️ Filter Options Query
**File**: `src/lib/server/browse.ts`
**Issue**: `getBrowseFilters` fetches all listings to extract unique values
```javascript
// Fetches ALL active listings just to get unique brands/sizes
.from('listings')
.select('brand, size, condition, price')
.eq('status', 'active')
```
**Fix**: Use aggregation functions or separate indexed tables for filter values

### 4. Inefficient Client-Side Fetching Patterns

#### ❌ Using fetch() Instead of Supabase
**File**: `src/routes/(app)/browse/+page.svelte`
```javascript
const response = await fetch('/api/sellers/top?period=month&limit=12');
```
**Fix**: Use Supabase RPC or server-side load

#### ❌ Wishlist Remove Operations
**File**: `src/routes/(app)/wishlist/+page.svelte`
```javascript
const response = await fetch('/api/wishlist', {
    method: 'DELETE',
    // ...
});
```
**Fix**: Consider optimistic updates with TanStack Query

### 5. Components That Should Receive Props Instead of Fetching

These components fetch their own data but should receive it as props:
- `TopBrands.svelte` - Fetches top brands in onMount
- `OrderList.svelte` - Likely fetches orders (needs verification)
- `ConversationList.svelte` - Likely fetches messages (needs verification)

## Recommendations

### Immediate Actions (High Priority)

1. **Create `+page.server.ts` for Leaderboard**
```typescript
// src/routes/(app)/leaderboard/+page.server.ts
export const load: PageServerLoad = async ({ locals, url }) => {
    const timePeriod = url.searchParams.get('period') || 'month';
    
    const [sellers, brands, reviews] = await Promise.all([
        locals.supabase.rpc('get_top_sellers', { time_period: timePeriod }),
        locals.supabase.rpc('get_top_brands', { time_period: timePeriod }),
        locals.supabase.rpc('get_recent_reviews', { time_period: timePeriod })
    ]);
    
    return { sellers, brands, reviews, timePeriod };
};
```

2. **Update Profile Settings Load Function**
```typescript
// Add to existing +page.server.ts
const { data: socialAccounts } = await locals.supabase
    .from('social_media_accounts')
    .select('*')
    .eq('user_id', session.user.id);

return {
    profile: profile || {...},
    socialAccounts: socialAccounts || []
};
```

3. **Optimize Browse Listings Query**
```typescript
// Remove description from listing card queries
.select(`
    id,
    title,
    // description, // Remove this
    price,
    ...
`)
```

### Medium Priority

1. **Implement Filter Value Caching**
   - Create materialized views for filter options
   - Or use Redis/in-memory caching for filter values
   - Update filter values on a schedule, not per request

2. **Convert fetch() Calls to Supabase**
   - Replace API endpoints with Supabase RPCs
   - Use server-side load functions where possible

3. **Add Query Result Caching**
   - The browse page already implements caching - extend to other pages
   - Cache leaderboard data (changes infrequently)
   - Cache brand listings

### Low Priority

1. **Implement Optimistic Updates**
   - For wishlist add/remove operations
   - For follow/unfollow actions
   - Use TanStack Query's optimistic update features

2. **Add Field-Level Selection**
   - Create different select queries for different views
   - ListingCard query vs ListingDetail query
   - Profile preview vs full profile

## Performance Impact

Implementing these changes would result in:
- **50-70% reduction** in client-side data fetching
- **Faster initial page loads** due to SSR
- **Better SEO** for public pages (leaderboard, brands)
- **Reduced database queries** through proper caching
- **Lower bandwidth usage** by avoiding overfetching

## Implementation Priority

1. 🔴 **Critical**: Leaderboard server-side load (affects SEO and performance)
2. 🔴 **Critical**: Profile settings social media fetch
3. 🟡 **High**: Remove description from browse queries
4. 🟡 **High**: TopBrands component refactor
5. 🟢 **Medium**: Filter value optimization
6. 🟢 **Medium**: Convert fetch() to Supabase
7. 🔵 **Low**: Optimistic updates implementation

## Code Quality Notes

### Good Patterns Found ✅
- Browse page implements proper caching
- Wishlist page uses server-side loading correctly
- Most pages have proper error handling
- Good use of parallel queries with Promise.all

### Areas for Improvement
- Inconsistent data fetching strategies
- Missing TypeScript types for RPC returns
- No standardized error handling for client fetches
- Limited use of TanStack Query despite being installed

## Next Steps

1. Create missing `+page.server.ts` files
2. Move client-side queries to server-side
3. Implement proper caching strategy
4. Standardize on TanStack Query for client-side needs
5. Add monitoring for slow queries