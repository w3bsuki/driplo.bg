# Driplo Anti-Patterns Guide

This document outlines common anti-patterns found in the Driplo codebase and how to avoid them.

## 1. Component Anti-Patterns

### ❌ Duplicate Image Components
**Problem**: Multiple image components with overlapping functionality
```svelte
// BAD: Three different image components
- OptimizedImage.svelte
- ResponsiveImage.svelte  
- Image.svelte
```

**Solution**: Single unified image component
```svelte
// GOOD: One image component with all features
<Image 
  src={imageUrl}
  alt={description}
  loading="lazy"
  responsive={true}
  optimize={true}
/>
```

### ❌ Inconsistent Import Paths
**Problem**: Mixed relative and $lib imports
```typescript
// BAD: Relative imports
import { formatPrice } from '../../../utils/format'
import type { User } from '../../../../types'
```

**Solution**: Always use $lib imports
```typescript
// GOOD: $lib imports
import { formatPrice } from '$lib/utils/format'
import type { User } from '$lib/types'
```

### ❌ Client-Side Data Fetching in SSR Components
**Problem**: Fetching data on mount instead of server-side
```svelte
// BAD: Client-side fetching
<script>
  import { onMount } from 'svelte'
  
  let listings = []
  
  onMount(async () => {
    const response = await fetch('/api/listings')
    listings = await response.json()
  })
</script>
```

**Solution**: Use +page.server.ts for data loading
```typescript
// GOOD: Server-side loading
// +page.server.ts
export async function load({ locals: { supabase } }) {
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    
  return { listings }
}
```

## 2. State Management Anti-Patterns

### ❌ Prop Drilling
**Problem**: Passing props through multiple component layers
```svelte
// BAD: Deep prop drilling
<ParentComponent user={user}>
  <ChildComponent user={user}>
    <GrandchildComponent user={user}>
      <GreatGrandchildComponent user={user} />
    </GrandchildComponent>
  </ChildComponent>
</ParentComponent>
```

**Solution**: Use stores or context
```typescript
// GOOD: Using stores
import { userStore } from '$lib/stores/user'

// In any component
$: user = $userStore
```

### ❌ Duplicated Store Logic
**Problem**: Similar store patterns repeated
```typescript
// BAD: Repeated patterns
// messagesStore.ts
export function createMessagesStore() { /* ... */ }

// notificationsStore.ts  
export function createNotificationsStore() { /* ... */ }

// ordersStore.ts
export function createOrdersStore() { /* ... */ }
```

**Solution**: Generic store factory
```typescript
// GOOD: Reusable store factory
export function createResourceStore<T>(resourceName: string) {
  return {
    subscribe,
    load: async () => { /* ... */ },
    create: async (item: T) => { /* ... */ },
    update: async (id: string, updates: Partial<T>) => { /* ... */ },
    delete: async (id: string) => { /* ... */ }
  }
}
```

## 3. Database Anti-Patterns

### ❌ Missing RLS Policies
**Problem**: Tables without Row Level Security
```sql
-- BAD: No RLS policies
CREATE TABLE listings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title text
);
```

**Solution**: Always add RLS policies
```sql
-- GOOD: With RLS policies
CREATE TABLE listings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title text
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all listings"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own listings"
  ON listings FOR ALL
  USING (auth.uid() = user_id);
```

### ❌ N+1 Queries
**Problem**: Multiple queries in loops
```typescript
// BAD: N+1 query pattern
const listings = await getListings()
for (const listing of listings) {
  listing.user = await getUser(listing.user_id)
  listing.images = await getImages(listing.id)
}
```

**Solution**: Use joins or batch queries
```typescript
// GOOD: Single query with joins
const { data: listings } = await supabase
  .from('listings')
  .select(`
    *,
    user:users(*),
    images:listing_images(*)
  `)
```

### ❌ Incorrect Column Naming
**Problem**: camelCase in database
```sql
-- BAD: camelCase columns
CREATE TABLE user_profiles (
  userId uuid,
  firstName text,
  createdAt timestamp
);
```

**Solution**: Use snake_case
```sql
-- GOOD: snake_case columns
CREATE TABLE user_profiles (
  user_id uuid,
  first_name text,
  created_at timestamp
);
```

## 4. Performance Anti-Patterns

### ❌ Unoptimized Images
**Problem**: Loading full-size images
```svelte
<!-- BAD: No optimization -->
<img src={listing.image_url} alt={listing.title} />
```

**Solution**: Use optimized images with lazy loading
```svelte
<!-- GOOD: Optimized with lazy loading -->
<Image
  src={listing.image_url}
  alt={listing.title}
  width={400}
  height={300}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### ❌ Missing Error Boundaries
**Problem**: No error handling for component failures
```svelte
<!-- BAD: No error handling -->
<ListingCard {listing} />
```

**Solution**: Wrap in error boundaries
```svelte
<!-- GOOD: With error boundary -->
{#try}
  <ListingCard {listing} />
{:catch error}
  <ErrorFallback {error} />
{/try}
```

## 5. Security Anti-Patterns

### ❌ Client-Side Validation Only
**Problem**: Trusting client-side validation
```typescript
// BAD: Only client validation
function handleSubmit(formData) {
  if (formData.price > 0) {
    createListing(formData)
  }
}
```

**Solution**: Always validate server-side
```typescript
// GOOD: Server-side validation
// +server.ts
export async function POST({ request, locals }) {
  const formData = await request.json()
  
  // Server-side validation
  const validated = listingSchema.parse(formData)
  
  // Additional business logic validation
  if (validated.price <= 0) {
    throw error(400, 'Price must be positive')
  }
  
  return createListing(validated)
}
```

### ❌ Exposed Sensitive Data
**Problem**: Returning unnecessary user data
```typescript
// BAD: Exposing all user fields
const { data: user } = await supabase
  .from('users')
  .select('*')
  .single()
```

**Solution**: Select only needed fields
```typescript
// GOOD: Select specific fields
const { data: user } = await supabase
  .from('users')
  .select('id, username, avatar_url')
  .single()
```

## 6. Testing Anti-Patterns

### ❌ No Test Coverage
**Problem**: Components without tests
```typescript
// BAD: No tests for critical components
// ListingCard.svelte - No test file
```

**Solution**: Add comprehensive tests
```typescript
// GOOD: Component tests
// ListingCard.test.ts
describe('ListingCard', () => {
  it('displays listing information', () => { /* ... */ })
  it('handles missing images gracefully', () => { /* ... */ })
  it('formats price correctly', () => { /* ... */ })
})
```

## Prevention Strategies

1. **Code Reviews**: Catch anti-patterns before merge
2. **Linting Rules**: Automate pattern detection
3. **Documentation**: Keep patterns guide updated
4. **Refactoring**: Regular cleanup sprints
5. **Education**: Team knowledge sharing

## Tools for Detection

- ESLint rules for import paths
- TypeScript strict mode
- Supabase CLI for migration validation
- Bundle analyzer for performance
- Security scanning tools