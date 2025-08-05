# 🚨 Production Quick Start Guide

## Immediate Actions Required (Do These First!)

### 1️⃣ Fix the Likes/Favorites Persistence Issue

The most critical issue is that likes don't persist after refresh. Here's the quick fix:

**File: `src/routes/(app)/browse/+page.server.ts`**
```typescript
// Add this to your existing load function
export const load: PageServerLoad = async ({ locals, url }) => {
	// ... existing code to load listings ...
	
	// Get user favorites if authenticated
	let userFavorites: string[] = []
	if (locals.user) {
		const { data: favorites } = await locals.supabase
			.from('favorites')
			.select('listing_id')
			.eq('user_id', locals.user.id)
		
		userFavorites = favorites?.map(f => f.listing_id) || []
	}
	
	// Add isLiked to each listing
	const listingsWithFavorites = listings.map(listing => ({
		...listing,
		isLiked: userFavorites.includes(listing.id)
	}))
	
	return {
		listings: listingsWithFavorites,
		// ... rest of your data
	}
}
```

### 2️⃣ Run Database Migrations

1. **First, backup your database:**
   ```bash
   pg_dump -h [your-supabase-host] -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run migrations in order:**
   ```bash
   # In Supabase SQL Editor, run each file in order:
   # 1. Enable RLS (CRITICAL for security)
   supabase/migrations/production/001_enable_rls.sql
   
   # 2. Add performance indexes
   supabase/migrations/production/002_performance_indexes.sql
   
   # 3. Add missing columns and functions
   supabase/migrations/production/003_missing_columns_and_functions.sql
   ```

### 3️⃣ Create Admin Account

1. **Register through the app:**
   - Go to `/register`
   - Use email: `w3bsuki@gmail.com`
   - Use password: `12345678`
   - Complete email verification

2. **Run admin setup:**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/migrations/production/005_setup_admin_account.sql
   ```

### 4️⃣ Remove Client Auth Stores

**Delete these files immediately:**
```bash
rm src/lib/stores/auth.ts
rm src/lib/stores/auth-compat.ts
```

**Update `+layout.svelte`:**
```svelte
<script>
	// Remove these imports:
	// import { initializeAuth, setupAuthListener } from '$lib/stores/auth';
	
	// Remove this entire block:
	// initializeAuth(data.user, data.session, data.profile);
	// const unsubscribeAuth = setupAuthListener(data.supabase);
</script>
```

### 5️⃣ Test Critical Flows

Run these tests manually:

1. **Test Registration:**
   - Register new account
   - Verify email
   - Check profile created

2. **Test Likes Persistence:**
   - Login
   - Like a product
   - Refresh page
   - ✅ Like should still be there

3. **Test Product Listing:**
   - Create a listing
   - Check it appears in browse
   - Check you can edit it

## 🔥 Emergency Fixes

### If likes still don't persist:

Check that the `favorites` table has proper RLS:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'favorites';

-- If not enabled:
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
```

### If authentication breaks:

1. Check cookies are being set:
   ```typescript
   // In hooks.server.ts, ensure httpOnly is false for client access
   httpOnly: false, // This must be false for client to read
   ```

2. Clear all auth data and re-login:
   ```javascript
   // In browser console
   localStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   })
   ```

### If RLS blocks everything:

Temporarily check with this query:
```sql
-- See what policies exist
SELECT * FROM pg_policies WHERE tablename = 'listings';

-- Test as a specific user
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-here"}';
SELECT * FROM listings LIMIT 1;
```

## 📱 Production Checklist

Before going live:

- [ ] All migrations run successfully
- [ ] Admin account created and verified
- [ ] Likes persist after refresh
- [ ] Product creation works
- [ ] Search/browse works
- [ ] No console errors in browser
- [ ] RLS enabled on all tables
- [ ] Environment variables set in production

## 🆘 Get Help

If something breaks:
1. Check Supabase logs: Dashboard → Logs → API
2. Check browser console for errors
3. Check Network tab for failed requests
4. Run `pnpm run check` to catch TypeScript errors

Remember: **Server-side data is the source of truth!**