# Streaming Data Implementation

## Overview

Streaming allows SvelteKit applications to send an initial response immediately while continuing to fetch and stream additional data. This dramatically improves perceived performance for pages with slow queries.

## Benefits

- **Instant page load**: Users see content immediately
- **Progressive enhancement**: Data appears as it becomes available
- **Better UX**: No long waiting times for complex queries
- **SEO friendly**: Initial HTML is sent immediately

## Implementation

### 1. Streaming Utilities (`/src/lib/utils/streaming.ts`)

Core utilities for implementing streaming:

```typescript
// Create streamed data
const streamedData = createStreamedData(
  initialData,      // Fast data shown immediately
  promiseForMore    // Slow data that streams in
)

// Handle in components
handleStreamedData(streamedData, 
  (data) => updateUI(data),
  (error) => handleError(error)
)
```

### 2. Dashboard Example

#### Original (All data blocks page load):
```typescript
// Everything waits for slowest query
const [stats, brands, reports] = await Promise.all([
  fastQuery(),
  slowQuery(),    // Blocks entire page
  verySlowQuery() // Makes it worse
])

return { stats, brands, reports }
```

#### Streaming (Fast data first):
```typescript
// Fast counts load immediately
const quickCounts = await getQuickCounts()

// Detailed data streams in after page loads
const detailedPromise = getDetailedData()

return {
  streamed: {
    dashboard: createStreamedDashboard(quickCounts, detailedPromise)
  }
}
```

### 3. Component Usage

```svelte
<script>
  export let data
  
  let dashboard = $state({
    quickCounts: {},
    detailedData: {}
  })
  
  onMount(() => {
    handleStreamedData(
      data.streamed.dashboard,
      (updated) => dashboard = updated
    )
  })
</script>

<!-- Quick stats show immediately -->
<div class="stats">
  <p>Users: {dashboard.quickCounts.totalUsers ?? '—'}</p>
</div>

<!-- Detailed data shows loading state, then content -->
{#if dashboard.detailedData.topSellers}
  <TopSellers sellers={dashboard.detailedData.topSellers} />
{:else}
  <LoadingSkeleton />
{/if}
```

## When to Use Streaming

### Good Candidates
- **Dashboards**: Multiple independent data sources
- **Analytics pages**: Complex aggregations
- **Search results**: Initial results + facets/suggestions
- **Profile pages**: Basic info + activity history
- **Product pages**: Core details + recommendations

### When NOT to Stream
- Simple CRUD operations
- Pages requiring all data for initial render
- Data with complex dependencies
- Real-time data that changes frequently

## Streaming Patterns

### 1. Priority Streaming
```typescript
// Critical data first
const critical = await getCriticalData()

// Nice-to-have data streams in
const supplemental = getSupplementalData()

return {
  critical,
  streamed: { supplemental }
}
```

### 2. Paginated Streaming
```typescript
// First page immediately
const firstPage = await getFirstPage()

// Stream remaining pages
const remainingPages = streamPaginatedResults(query)

return {
  firstPage,
  streamed: { remainingPages }
}
```

### 3. Progressive Detail
```typescript
// Summary first
const summary = await getSummary()

// Full details stream in
const details = getFullDetails()

return {
  summary,
  streamed: { details }
}
```

## Performance Guidelines

### 1. Identify Slow Queries
Use Supabase query performance monitoring:
```sql
SELECT * FROM pg_stat_statements 
WHERE mean_exec_time > 100 -- Queries over 100ms
ORDER BY mean_exec_time DESC;
```

### 2. Split Data Fetching
- **Immediate**: Counts, IDs, critical fields
- **Streamed**: Joins, aggregations, non-critical data

### 3. Use Materialized Views
Stream from pre-computed views for complex analytics:
```typescript
// Fast: Read from materialized view
const topSellers = await supabase
  .from('seller_analytics_mv')
  .select('*')
  .limit(10)
```

### 4. Loading States
Always provide meaningful loading indicators:
```svelte
{#if data.isLoading}
  <Skeleton lines={3} />
{:else if data.error}
  <ErrorMessage {error} />
{:else}
  <Content {data} />
{/if}
```

## Migration Guide

### Step 1: Identify Slow Pages
```bash
# Monitor page load times
# Look for pages > 1s load time
```

### Step 2: Analyze Queries
```typescript
// Add timing to identify slow queries
console.time('query-name')
const data = await slowQuery()
console.timeEnd('query-name')
```

### Step 3: Split Load Function
```typescript
// Before
export const load = async () => {
  const data = await getAllData() // Slow
  return { data }
}

// After  
export const load = async () => {
  const quick = await getQuickData()
  const slowPromise = getSlowData()
  
  return {
    quick,
    streamed: { slow: slowPromise }
  }
}
```

### Step 4: Update Component
```svelte
<!-- Add loading states -->
{#if $page.data.streamed.slow}
  <StreamedContent data={$page.data.streamed.slow} />
{/if}
```

## Best Practices

1. **Stream Independent Data**: Don't stream data with dependencies
2. **Prioritize User Needs**: Stream most important data first
3. **Set Expectations**: Show loading states for streaming content
4. **Handle Errors**: Gracefully handle streaming failures
5. **Monitor Performance**: Track streaming impact on UX

## Examples in Codebase

1. **Dashboard Streaming**: `/src/routes/dashboard/+page.server.streaming.ts`
   - Quick counts load instantly
   - Analytics data streams in

2. **Streamed Component**: `/src/lib/components/dashboard/StreamedDashboard.svelte`
   - Shows immediate stats
   - Progressive loading for details

3. **Utilities**: `/src/lib/utils/streaming.ts`
   - Reusable streaming helpers
   - Pagination streaming support

## Monitoring

Track streaming effectiveness:
```typescript
// Log streaming timing
const streamStart = Date.now()
handleStreamedData(data, (result) => {
  const streamTime = Date.now() - streamStart
  analytics.track('stream_complete', {
    page: 'dashboard',
    duration: streamTime
  })
})
```

## Future Enhancements

1. **Partial Hydration**: Stream HTML chunks with React Server Components pattern
2. **WebSocket Streaming**: Real-time data streaming for live updates
3. **Service Worker**: Cache streamed data for offline support
4. **Compression**: Stream compressed data for faster transmission