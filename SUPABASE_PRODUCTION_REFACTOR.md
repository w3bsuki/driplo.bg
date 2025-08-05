# 🚀 Supabase SSR Production Refactor Plan

## 📋 Executive Summary

This document outlines a comprehensive refactor plan to make the Driplo marketplace production-ready with proper Supabase SSR authentication, complete product listing functionality, and all features working server-side.

**Critical Issues to Fix:**
- ❌ Likes/favorites not persisting after refresh
- ❌ Mixed client/server auth causing sync issues  
- ❌ Missing RLS policies for security
- ❌ Demo/mock data in production
- ❌ Missing features (views, reviews)
- ❌ No admin account setup

---

## 🔒 Phase 1: Authentication System Refactor

### 1.1 Current Issues Analysis

**Problem**: You have a hybrid auth system mixing SSR patterns with client-side stores, causing synchronization issues.

**Current Implementation:**
- ✅ Using @supabase/ssr (good!)
- ✅ Proper hooks.server.ts with createServerClient
- ❌ Redundant auth stores (`$lib/stores/auth.ts`)
- ❌ Client-side auth initialization competing with SSR
- ❌ Session refresh issues with `_refreshAuth` parameter

### 1.2 Authentication Refactor Steps

#### Step 1: Remove Client-Side Auth Stores

```typescript
// DELETE these files:
// - src/lib/stores/auth.ts
// - src/lib/stores/auth-compat.ts
// - Any other client-side auth management
```

#### Step 2: Update +layout.svelte to Remove Auth Store Usage

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	// Remove these imports:
	// import { initializeAuth, setupAuthListener } from '$lib/stores/auth';
	
	let { data } = $props();
	
	// Remove all auth store initialization
	// The auth state should come from data.user and data.session
	
	// Remove onMount auth setup - let SSR handle everything
</script>
```

#### Step 3: Create Proper Auth Context (Svelte 5 Runes)

```typescript
// src/lib/contexts/auth.svelte.ts
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database'

interface AuthState {
	user: User | null
	session: Session | null
	profile: Database['public']['Tables']['profiles']['Row'] | null
}

class AuthContext {
	#state = $state<AuthState>({
		user: null,
		session: null,
		profile: null
	})
	
	get user() { return this.#state.user }
	get session() { return this.#state.session }
	get profile() { return this.#state.profile }
	get isAuthenticated() { return !!this.#state.user }
	
	// Only update from server data, never from client
	updateFromServer(data: AuthState) {
		this.#state = data
	}
}

export const authContext = new AuthContext()
```

#### Step 4: Update Root Layout to Use Context

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { authContext } from '$lib/contexts/auth.svelte.ts'
	
	let { data } = $props();
	
	// Update auth context from server data
	$effect(() => {
		authContext.updateFromServer({
			user: data.user,
			session: data.session,
			profile: data.profile
		})
	})
</script>
```

---

## 🛒 Phase 2: Product Listing & Persistence Fixes

### 2.1 Fix Likes/Favorites Persistence

**Problem**: Likes disappear on refresh because they're only stored client-side.

#### Step 1: Update ListingCard to Check Server State

```svelte
<!-- src/lib/components/listings/ListingCard.svelte -->
<script lang="ts">
	// ... existing imports
	
	interface Props {
		// ... existing props
		isLiked?: boolean; // This should come from server
		isFavorited?: boolean; // Add this for wishlist
	}
	
	// Remove client-side only state
	// let liked = $state(isLiked);
	
	// Instead, track server state
	let serverLiked = $state(isLiked);
	let optimisticLiked = $state<boolean | null>(null);
	
	// Compute displayed state
	const liked = $derived(optimisticLiked !== null ? optimisticLiked : serverLiked);
	
	async function handleToggleLike(e: MouseEvent) {
		e.preventDefault();
		if (likeLoading) return;
		
		// Check if user is authenticated
		if (!authContext.isAuthenticated) {
			// Redirect to login
			goto('/login?redirect=' + encodeURIComponent(window.location.pathname))
			return;
		}
		
		likeLoading = true;
		apiError = null;
		
		// Optimistic update
		optimisticLiked = !liked;
		
		try {
			const response = await fetch('/api/wishlist', {
				method: liked ? 'DELETE' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ listing_id: id })
			});

			if (!response.ok) {
				throw new Error('Failed to update favorite');
			}
			
			// Update server state on success
			serverLiked = optimisticLiked;
			optimisticLiked = null;
		} catch (error) {
			// Revert on error
			optimisticLiked = null;
			apiError = 'Failed to update favorite';
		} finally {
			likeLoading = false;
		}
	}
</script>
```

#### Step 2: Load Favorites Server-Side

```typescript
// src/routes/(app)/browse/+page.server.ts
export const load: PageServerLoad = async ({ locals, url }) => {
	// ... existing code
	
	// Get user favorites if authenticated
	let userFavorites: string[] = []
	if (locals.user) {
		const { data: favorites } = await locals.supabase
			.from('favorites')
			.select('listing_id')
			.eq('user_id', locals.user.id)
		
		userFavorites = favorites?.map(f => f.listing_id) || []
	}
	
	// Add to each listing
	const listingsWithFavorites = listings.map(listing => ({
		...listing,
		isLiked: userFavorites.includes(listing.id),
		isFavorited: userFavorites.includes(listing.id)
	}))
	
	return {
		listings: listingsWithFavorites,
		// ... other data
	}
}
```

---

## 🗄️ Phase 3: Database Cleanup & Setup

### 3.1 Clean All Demo Data

```sql
-- BACKUP FIRST!
-- pg_dump your database before running these

-- Delete all existing data (in order due to foreign keys)
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM user_ratings;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM favorites;
DELETE FROM listing_views;
DELETE FROM listings;
DELETE FROM profiles;
DELETE FROM auth.users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS listings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
-- ... repeat for all sequences
```

### 3.2 Create Admin Account

```sql
-- First, create the admin user through Supabase Auth
-- This must be done through the application or Supabase dashboard

-- After user is created, update their profile
UPDATE profiles
SET 
	username = 'admin',
	full_name = 'Admin User',
	account_type = 'personal',
	is_admin = true,
	onboarding_completed = true,
	setup_completed = true,
	email_verified = true
WHERE email = 'w3bsuki@gmail.com';

-- Grant admin privileges
INSERT INTO auth.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'w3bsuki@gmail.com';
```

### 3.3 RLS Policies Setup

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone"
ON listings FOR SELECT
USING (NOT is_draft OR user_id = auth.uid());

CREATE POLICY "Users can create listings"
ON listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
ON listings FOR DELETE
USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
	EXISTS (
		SELECT 1 FROM conversations
		WHERE conversations.id = messages.conversation_id
		AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
	)
);

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
	EXISTS (
		SELECT 1 FROM conversations
		WHERE conversations.id = conversation_id
		AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
	)
);
```

---

## 🔧 Phase 4: Missing Features Implementation

### 4.1 Listing Views Tracking

```typescript
// src/routes/(app)/listings/[id]/+page.server.ts
export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params
	
	// Track view if user is authenticated
	if (locals.user) {
		// Use upsert to avoid duplicate views
		await locals.supabase
			.from('listing_views')
			.upsert({
				listing_id: id,
				user_id: locals.user.id,
				viewed_at: new Date().toISOString()
			}, {
				onConflict: 'listing_id,user_id',
				ignoreDuplicates: true
			})
		
		// Increment view count
		await locals.supabase.rpc('increment_listing_views', {
			listing_id: id
		})
	}
	
	// ... rest of load function
}
```

### 4.2 Reviews System

```typescript
// src/routes/api/reviews/+server.ts
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
	const { listing_id, rating, comment } = await request.json()
	
	// Verify user bought the item
	const { data: order } = await locals.supabase
		.from('orders')
		.select('id')
		.eq('listing_id', listing_id)
		.eq('buyer_id', locals.user.id)
		.eq('status', 'completed')
		.single()
	
	if (!order) {
		return new Response('You can only review items you have purchased', { status: 403 })
	}
	
	// Create review
	const { error } = await locals.supabase
		.from('user_ratings')
		.insert({
			order_id: order.id,
			rating_by: locals.user.id,
			rating_for: data.listing.user_id,
			rating,
			comment,
			listing_id
		})
	
	if (error) {
		return new Response('Failed to create review', { status: 500 })
	}
	
	return new Response('Review created', { status: 201 })
}
```

---

## 🧪 Phase 5: Testing & Deployment

### 5.1 Testing Checklist

```typescript
// tests/auth.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
	test('user can register', async ({ page }) => {
		await page.goto('/register')
		await page.fill('input[name="email"]', 'test@example.com')
		await page.fill('input[name="password"]', 'password123')
		await page.fill('input[name="confirmPassword"]', 'password123')
		await page.click('button[type="submit"]')
		await expect(page).toHaveURL('/register?success=true')
	})
	
	test('user can login', async ({ page }) => {
		await page.goto('/login')
		await page.fill('input[name="email"]', 'w3bsuki@gmail.com')
		await page.fill('input[name="password"]', '12345678')
		await page.click('button[type="submit"]')
		await expect(page).toHaveURL('/')
	})
	
	test('likes persist after refresh', async ({ page }) => {
		// Login first
		await page.goto('/login')
		await page.fill('input[name="email"]', 'w3bsuki@gmail.com')
		await page.fill('input[name="password"]', '12345678')
		await page.click('button[type="submit"]')
		
		// Go to browse
		await page.goto('/browse')
		
		// Like first item
		await page.click('.product-card:first-child button[aria-label="Like"]')
		
		// Refresh page
		await page.reload()
		
		// Check like persisted
		const likeButton = page.locator('.product-card:first-child button[aria-label="Like"]')
		await expect(likeButton).toHaveAttribute('data-liked', 'true')
	})
})
```

### 5.2 Production Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] Environment variables set:
  ```env
  PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx (server-only)
  ```
- [ ] RLS policies enabled and tested
- [ ] Database indexes created for performance
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] SSL certificates valid
- [ ] CDN configured for images
- [ ] Backup strategy in place

---

## 📊 Phase 6: Performance Optimizations

### 6.1 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_is_sold ON listings(is_sold) WHERE NOT is_sold;

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
CREATE UNIQUE INDEX idx_favorites_user_listing ON favorites(user_id, listing_id);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### 6.2 Image Optimization

```typescript
// src/lib/utils/image-upload.ts
export async function uploadListingImage(
	supabase: SupabaseClient,
	file: File,
	userId: string,
	index: number
): Promise<string> {
	// Validate file
	if (!file.type.startsWith('image/')) {
		throw new Error('File must be an image')
	}
	
	if (file.size > 5 * 1024 * 1024) { // 5MB
		throw new Error('Image must be less than 5MB')
	}
	
	// Generate unique filename
	const ext = file.name.split('.').pop()
	const filename = `${userId}/${Date.now()}-${index}.${ext}`
	
	// Upload to Supabase Storage
	const { data, error } = await supabase.storage
		.from('listings')
		.upload(filename, file, {
			cacheControl: '3600',
			upsert: false
		})
	
	if (error) throw error
	
	// Get public URL with transformations
	const { data: { publicUrl } } = supabase.storage
		.from('listings')
		.getPublicUrl(filename, {
			transform: {
				width: 800,
				height: 800,
				resize: 'contain',
				format: 'webp'
			}
		})
	
	return publicUrl
}
```

---

## 🚀 Implementation Order

1. **Day 1**: Authentication refactor
   - Remove client auth stores
   - Fix session persistence
   - Test auth flows

2. **Day 2**: Database cleanup
   - Backup existing data
   - Clear demo data
   - Create admin account
   - Apply RLS policies

3. **Day 3**: Fix core features
   - Fix likes/favorites persistence
   - Implement views tracking
   - Test all CRUD operations

4. **Day 4**: Add missing features
   - Reviews system
   - Advanced search
   - User dashboards

5. **Day 5**: Testing & optimization
   - Run full test suite
   - Performance testing
   - Security audit

6. **Day 6**: Deployment
   - Final checks
   - Deploy to production
   - Monitor for issues

---

## 🎯 Success Criteria

- ✅ All auth flows work without refresh issues
- ✅ Likes/favorites persist across sessions
- ✅ Zero client-side auth state management
- ✅ All features work with RLS enabled
- ✅ Admin account can manage platform
- ✅ < 3s page load times
- ✅ Zero security vulnerabilities
- ✅ 100% TypeScript type safety

---

## 📞 Support Resources

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/sveltekit)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

Remember: **Server-side first, always!** Every feature should work with JavaScript disabled.