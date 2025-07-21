# Quick Wins - High Impact, Low Effort Improvements

**Implementation Time**: < 30 minutes each  
**Total Time**: 1-2 days for all items  
**Expected Impact**: 30-50% performance improvement

## 🚀 Database Quick Wins

### 1. Add Missing Foreign Key Indexes (20 mins)
**Impact**: 10-100x faster JOINs  
**Command**:
```bash
pnpm supabase migration apply 001_add_critical_foreign_key_indexes.sql
```
**Why**: PostgreSQL doesn't auto-create indexes on foreign keys

### 2. Switch to Estimated Counts (15 mins)
**Impact**: 100ms+ faster on large queries  
**Files**: 
- `src/routes/(app)/browse/+page.svelte`
- `src/routes/(app)/sellers/+page.svelte`

**Change**:
```typescript
// Before
const { count } = await supabase
  .from('listings')
  .select('*', { count: 'exact' })

// After
const { count } = await supabase
  .from('listings')
  .select('*', { count: 'estimated' })
```

### 3. Drop Unused Indexes (10 mins)
**Impact**: Faster writes, less storage  
**Command**:
```bash
pnpm supabase migration apply 003_drop_unused_indexes_phase1.sql
```
**Note**: Monitor for 24 hours after deployment

## ⚡ Query Optimization Quick Wins

### 4. Fix select('*') in Auth Context (20 mins)
**Impact**: Reduce payload by 80%, prevent data leaks  
**File**: `src/lib/stores/auth-context.svelte.ts:53`

**Change**:
```typescript
// Before
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)

// After
const { data } = await supabase
  .from('profiles')
  .select('id, username, email, avatar_url, role, is_seller')
  .eq('id', user.id)
```

### 5. Fix select('*') in Category Queries (25 mins)
**Impact**: 3-5x less data transfer  
**File**: `src/lib/server/category.ts`

**Changes at lines 9, 21, 58, 70**:
```typescript
// Change all instances to:
.select('id, name, slug, description, image_url, parent_id, is_active')
```

### 6. Add Limit to Category Subcategories (10 mins)
**Impact**: Prevent fetching 100s of subcategories  
**File**: `src/lib/server/category.ts:74`

**Change**:
```typescript
// Add limit
.eq('parent_id', category.id)
.eq('is_active', true)
.limit(20)
.order('sort_order')
```

## 🖼️ Image Optimization Quick Wins

### 7. Add Loading="lazy" to Avatars (20 mins)
**Impact**: 500KB-1MB less initial load  
**Files**:
- `src/lib/components/profile/ProfileHeader.svelte:105`
- `src/lib/components/home/TopSellers.svelte:80`

**Change**:
```svelte
<img 
  src={avatar_url} 
  alt={username}
  loading="lazy"
  class="..." 
/>
```

### 8. Add Loading="lazy" to Cover Images (10 mins)
**Impact**: 200KB-1MB less initial load  
**File**: `src/lib/components/profile/ProfileHeader.svelte:77`

**Change**:
```svelte
<img 
  src={profile.cover_url} 
  alt="Cover"
  loading="lazy"
  class="..." 
/>
```

## 🎯 Performance Quick Wins

### 9. Add Simple Response Caching Headers (15 mins)
**Impact**: Reduce server load by 50%  
**File**: `src/lib/server/category.ts`

**Add to category endpoints**:
```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300' // 5 minutes
  }
});
```

### 10. Disable Exact Count on Browse Page (10 mins)
**Impact**: 100-200ms faster page load  
**File**: `src/routes/(app)/browse/+page.server.ts`

**Change**:
```typescript
// Remove { count: 'exact' } or change to 'estimated'
const { data, count } = await supabase
  .from('listings')
  .select('*', { count: 'estimated' })
```

## 🔧 Code Quality Quick Wins

### 11. Add .limit() to Dangerous Queries (20 mins)
**Impact**: Prevent memory issues  
**Files**: Search for `.from(` without `.limit(`

**Add limits to**:
- Message queries: `.limit(50)`
- Order history: `.limit(100)`
- Seller listings: `.limit(20)`

### 12. Fix N+1 in Message Marking (15 mins)
**Impact**: 50x faster message operations  
**File**: `src/routes/api/messages/[id]/+server.ts`

**If marking multiple messages, use**:
```typescript
await supabase
  .from('messages')
  .update({ read: true })
  .in('id', messageIds)
```

## 🛡️ Security Quick Wins

### 13. Add RLS Policy for brand_verification_requests (25 mins)
**Impact**: Prevent unauthorized access  
**SQL**:
```sql
CREATE POLICY "Users can view own requests"
ON brand_verification_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests"
ON brand_verification_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 14. Remove Sensitive Fields from Public Queries (20 mins)
**Impact**: Prevent data leaks  
**Search for**: Queries returning payment info, email addresses

**Remove fields like**:
- `stripe_customer_id`
- `stripe_account_id`
- `email` (unless necessary)
- `phone_number`

## 🎨 UX Quick Wins

### 15. Add Skeleton Loaders for Images (25 mins)
**Impact**: Better perceived performance  
**Add to**: `TopSellers`, `ProfileHeader`, `ListingCard`

**Simple skeleton**:
```svelte
{#if !imageLoaded}
  <div class="animate-pulse bg-gray-200 rounded" />
{/if}
```

## Implementation Order

### Day 1 Morning (2 hours)
1. ✅ Add foreign key indexes (#1) - 20 mins
2. ✅ Drop unused indexes (#3) - 10 mins  
3. ✅ Fix auth context select(*) (#4) - 20 mins
4. ✅ Fix category select(*) (#5) - 25 mins
5. ✅ Add category limits (#6) - 10 mins

### Day 1 Afternoon (2 hours)
6. ✅ Switch to estimated counts (#2) - 15 mins
7. ✅ Add lazy loading to images (#7, #8) - 30 mins
8. ✅ Add caching headers (#9) - 15 mins
9. ✅ Add query limits (#11) - 20 mins
10. ✅ Fix N+1 queries (#12) - 15 mins

### Day 2 (If Time Permits)
11. ✅ Add RLS policies (#13) - 25 mins
12. ✅ Remove sensitive fields (#14) - 20 mins
13. ✅ Add skeleton loaders (#15) - 25 mins
14. ✅ Test all changes
15. ✅ Deploy to staging

## Expected Results

### Immediate (After Day 1)
- 50-70% reduction in database query time
- 30-50% reduction in initial page load size
- 10x faster JOIN operations

### After Full Implementation
- 80% faster page loads
- 90% less database load
- Better security posture
- Improved user experience

## Monitoring

After implementing each change:
1. Check Supabase dashboard for query performance
2. Monitor error logs for any issues
3. Use browser DevTools to verify payload sizes
4. Test with throttled connection

## Rollback Plan

Each change is isolated and can be reverted:
- Database changes: Keep migration rollback scripts
- Code changes: Use git revert for specific commits
- Test each change in staging first