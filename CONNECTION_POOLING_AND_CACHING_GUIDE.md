# Supabase Connection Pooling & Caching Configuration Guide

## Overview
This guide covers optimal configuration for connection pooling, caching strategies, and performance optimization for your Supabase database.

## 1. Connection Pooling Configuration

### Supabase Dashboard Settings

Navigate to Settings > Database in your Supabase dashboard:

```yaml
# Recommended Connection Pool Settings
Pool Size: 25                    # Adjust based on expected concurrent users
Pool Mode: Transaction           # Best for most web applications
Default Pool Size: 15            # For direct connections
Maximum Client Connections: 100  # Total connections allowed

# Connection Limits by Plan
Free Tier: 60 connections
Pro Tier: 200 connections
Team/Enterprise: Custom
```

### Connection String Configuration

Use the pooler connection string for your application:

```typescript
// Use pooler for serverless/edge functions
const POOLER_URL = "postgresql://postgres.[ref]:[password]@[region].pooler.supabase.com:6543/postgres"

// Use direct connection only for migrations
const DIRECT_URL = "postgresql://postgres.[ref]:[password]@[region].supabase.co:5432/postgres"
```

### SvelteKit Configuration

```typescript
// $lib/server/db.ts
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '$env/static/private'

// Connection pool configuration
const supabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-connection-pool': 'true'
    }
  }
}

// Server-side client with connection pooling
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  supabaseOptions
)

// Implement connection recycling
let connectionPool: Map<string, any> = new Map()

export function getPooledConnection(key: string) {
  if (!connectionPool.has(key)) {
    connectionPool.set(key, createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      ...supabaseOptions,
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }))
  }
  return connectionPool.get(key)
}

// Clean up stale connections
setInterval(() => {
  connectionPool.clear()
}, 300000) // 5 minutes
```

## 2. Caching Strategies

### A. Query Result Caching with Redis

```typescript
// $lib/server/cache.ts
import { Redis } from '@upstash/redis'
import { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } from '$env/static/private'

const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN
})

export class QueryCache {
  private defaultTTL = 300 // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await redis.setex(key, ttl || this.defaultTTL, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }
}

export const cache = new QueryCache()
```

### B. Cached Database Functions

```typescript
// $lib/server/db-cached.ts
import { supabaseAdmin } from './db'
import { cache } from './cache'

export async function getCachedListings(
  categoryId?: number,
  limit = 24,
  offset = 0
) {
  const cacheKey = `listings:${categoryId || 'all'}:${limit}:${offset}`
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) return cached

  // Fetch from database
  const { data, error } = await supabaseAdmin
    .rpc('search_listings', {
      p_category_id: categoryId,
      p_limit: limit,
      p_offset: offset
    })

  if (error) throw error

  // Cache the result
  await cache.set(cacheKey, data, 300) // 5 minutes
  
  return data
}

export async function getCachedUserStats(userId: string) {
  const cacheKey = `user_stats:${userId}`
  
  const cached = await cache.get(cacheKey)
  if (cached) return cached

  const { data, error } = await supabaseAdmin
    .rpc('get_user_statistics', { p_user_id: userId })

  if (error) throw error

  // Cache for 1 hour for user stats
  await cache.set(cacheKey, data, 3600)
  
  return data
}
```

### C. SvelteKit Load Function Caching

```typescript
// +page.server.ts
import { getCachedListings } from '$lib/server/db-cached'

export async function load({ params, setHeaders }) {
  const listings = await getCachedListings(params.categoryId)
  
  // Set cache headers for CDN
  setHeaders({
    'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400'
  })
  
  return {
    listings
  }
}
```

### D. In-Memory Caching for Hot Data

```typescript
// $lib/server/memory-cache.ts
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>()
  
  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  set(key: string, value: any, ttlSeconds: number) {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }
  
  // Clean expired entries every minute
  startCleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expires) {
          this.cache.delete(key)
        }
      }
    }, 60000)
  }
}

export const memCache = new MemoryCache()
memCache.startCleanup()

// Use for very hot data like categories
export async function getCachedCategories() {
  const cached = memCache.get('categories')
  if (cached) return cached
  
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  if (data) {
    memCache.set('categories', data, 3600) // 1 hour
  }
  
  return data
}
```

## 3. Edge Function Optimization

### Connection Pooling for Edge Functions

```typescript
// supabase/functions/_shared/db.ts
import { createClient } from '@supabase/supabase-js'

// Reuse connections across invocations
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        }
      }
    )
  }
  return supabaseClient
}
```

### Edge Function Response Caching

```typescript
// supabase/functions/get-popular-products/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/db.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseClient()
    
    // Use materialized view for instant response
    const { data, error } = await supabase
      .from('popular_products_mv')
      .select('*')
      .limit(24)
    
    if (error) throw error
    
    // Return with cache headers
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
        'CDN-Cache-Control': 'max-age=600',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

## 4. Database-Level Caching

### A. Prepared Statements

```sql
-- Create prepared statements for frequently used queries
PREPARE get_user_orders (uuid) AS
SELECT * FROM orders 
WHERE buyer_id = $1 
ORDER BY created_at DESC 
LIMIT 10;

-- Use: EXECUTE get_user_orders('user-uuid');

-- Create function to manage prepared statements
CREATE OR REPLACE FUNCTION prepare_common_statements()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prepare frequently used statements
    EXECUTE 'PREPARE get_active_listings (int, int) AS
        SELECT * FROM listings 
        WHERE is_active = true AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2';
    
    EXECUTE 'PREPARE get_user_notifications (uuid) AS
        SELECT * FROM notifications
        WHERE user_id = $1 AND read = false
        ORDER BY created_at DESC';
END;
$$;
```

### B. Query Plan Caching

```sql
-- Enable query plan caching
ALTER DATABASE postgres SET plan_cache_mode = 'force_generic_plan';

-- For specific expensive queries, hint the planner
CREATE OR REPLACE FUNCTION get_listings_optimized(
    p_limit int DEFAULT 24,
    p_offset int DEFAULT 0
)
RETURNS SETOF listings
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
    SELECT /*+ IndexScan(listings idx_listings_active_created) */ *
    FROM listings
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;
```

## 5. CDN and Static Asset Caching

### Cloudflare Configuration

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache API responses
  if (url.pathname.startsWith('/api/')) {
    const cache = caches.default
    let response = await cache.match(request)
    
    if (!response) {
      response = await fetch(request)
      
      // Cache successful responses
      if (response.status === 200) {
        const headers = new Headers(response.headers)
        headers.set('Cache-Control', 'public, max-age=300')
        
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        })
        
        event.waitUntil(cache.put(request, response.clone()))
      }
    }
    
    return response
  }
  
  // Pass through other requests
  return fetch(request)
}
```

## 6. Performance Monitoring

### Monitor Connection Pool Usage

```sql
-- Check current connections
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;

-- Monitor pool efficiency
SELECT 
    numbackends as active_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
    ROUND((numbackends::numeric / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')) * 100, 2) as connection_usage_percent
FROM pg_stat_database
WHERE datname = current_database();
```

### Cache Hit Rate Monitoring

```typescript
// Monitor cache performance
export class CacheMonitor {
  private hits = 0
  private misses = 0
  
  recordHit() {
    this.hits++
  }
  
  recordMiss() {
    this.misses++
  }
  
  getStats() {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      total
    }
  }
  
  reset() {
    this.hits = 0
    this.misses = 0
  }
}
```

## 7. Best Practices Summary

1. **Connection Pooling**
   - Use pooler connection string for applications
   - Set appropriate pool size based on load
   - Use transaction mode for web apps
   - Monitor connection usage

2. **Caching Strategy**
   - Cache at multiple levels (CDN, Redis, Memory, Database)
   - Use appropriate TTLs for different data types
   - Implement cache invalidation strategies
   - Monitor cache hit rates

3. **Query Optimization**
   - Use materialized views for complex aggregations
   - Implement prepared statements for frequent queries
   - Use database functions to reduce round trips
   - Monitor slow queries and optimize

4. **Edge Computing**
   - Cache responses at CDN edge
   - Use Supabase Edge Functions for dynamic content
   - Implement stale-while-revalidate strategy
   - Monitor edge function performance

5. **Monitoring**
   - Track connection pool utilization
   - Monitor cache hit rates
   - Analyze query performance
   - Set up alerts for anomalies

By implementing these strategies, you'll achieve:
- ✅ Reduced database load
- ✅ Faster response times
- ✅ Better scalability
- ✅ Lower costs
- ✅ Improved user experience