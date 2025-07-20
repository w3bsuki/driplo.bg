# Driplo Production Fixes Implementation Plan

## Executive Summary
This document outlines a comprehensive 10-phase implementation plan to address critical issues identified in the Driplo production deployment. Each phase includes detailed fixes, testing requirements, and rollback procedures to ensure zero downtime and maintain platform stability.

### Completion Status (as of 2025-07-20)
- ✅ **Phase 1**: Email Confirmation Fix - COMPLETED
- ✅ **Phase 2**: Bulgarian Translation Fix - COMPLETED  
- ✅ **Phase 3**: Mobile UI/UX Improvements - COMPLETED
- ✅ **Phase 4**: Product Page Improvements - COMPLETED
- ✅ **Phase 5**: Browse Page Enhancement - COMPLETED
- ✅ **Phase 6**: Bottom Navigation Visibility Fix - COMPLETED
- ✅ **Phase 7**: Standardize Filter Placement - COMPLETED
- ⏳ **Phase 8**: Fix Filter Functionality - PENDING
- ✅ **Phase 9**: GDPR Cookie Consent - COMPLETED
- ⏳ **Phase 10**: User Onboarding & Notifications - PENDING

**Total Progress: 8/10 phases completed (80%)**

## Issues Overview

### Critical Issues (High Priority)
1. **Email Confirmation Failure** - Users not receiving confirmation emails
2. **Bulgarian Translation** - Translation not working in production
3. **Filter Functionality** - Filters not working with badges, condition, size, color
4. **GDPR Compliance** - Missing cookie consent implementation

### UI/UX Issues (Medium Priority)
5. **Mobile UI/UX** - Wishlist/orders layout issues on mobile
6. **Product Page** - Duplicate badges and unstyled elements
7. **Browse Page** - Needs layout improvements and top sellers
8. **Bottom Navsheet** - Incorrect visibility on certain pages
9. **Filter Duplication** - Both top and bottom filters present
10. **User Onboarding** - Missing notification popup and onboarding flow

---

## Phase 1: Fix Email Confirmation (Critical) ✅ COMPLETED
**Duration**: 2-3 hours  
**Risk Level**: High  
**Rollback Time**: 5 minutes  
**Status**: ✅ Completed on 2025-07-20

### Issue
Confirmation emails failing with "failed to send confirmation email" when using Resend with Gmail.

### Root Cause
Supabase auth emails are separate from custom Resend implementation. Supabase is trying to send emails through its default service, not through the configured Resend API.

### Solution Implemented
Created custom email confirmation handler that bypasses Supabase's email system and uses Resend directly.

### What Was Implemented

1. **Created Custom Email Confirmation Handler**
   - ✅ Created `/api/auth/send-confirmation/+server.ts` endpoint
   - ✅ Uses Resend API to send professional branded emails
   - ✅ Generates Supabase confirmation links programmatically

2. **Modified Auth Context**
   - ✅ Updated `auth-context.svelte.ts` to intercept signups
   - ✅ Automatically sends confirmation email via Resend when needed
   - ✅ Falls back gracefully if Resend fails

3. **Created Supabase Admin Client**
   - ✅ Added `supabase-admin.ts` for server-side operations
   - ✅ Uses service role key for generating confirmation links

4. **Professional Email Template**
   - ✅ Branded HTML email with Driplo styling
   - ✅ Clear call-to-action button
   - ✅ Mobile-responsive design

### Configuration Used
- Supabase: "Confirm email" enabled, Custom SMTP disabled
- Emails sent from: Resend API (appears as "Driplo <noreply@driplo.com>")
- No business email required

### Files Created/Modified
1. `/src/routes/api/auth/send-confirmation/+server.ts` - NEW
2. `/src/lib/server/supabase-admin.ts` - NEW
3. `/src/lib/stores/auth-context.svelte.ts` - MODIFIED (lines 93-111)
4. `/src/lib/server/email.ts` - MODIFIED (made send method public)
5. `SUPABASE_EMAIL_FIX.md` - NEW (documentation)

### Deployment Requirements
- Ensure `RESEND_API_KEY` is set in production environment
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in production
- No changes needed to Supabase dashboard settings

---

## Phase 2: Fix Bulgarian Translation (Critical) ✅ COMPLETED
**Duration**: 1-2 hours  
**Risk Level**: Medium  
**Rollback Time**: Immediate  
**Status**: ✅ Completed on 2025-07-20

### Issue
Bulgarian translation works locally but not in production.

### Root Cause
Build process not including Bulgarian translations or Paraglide not properly initialized in production.

### Solution Implemented
Fixed Paraglide configuration and added proper server-side language detection with cookie persistence.

### What Was Implemented

1. **Fixed Server-Side Language Detection**
   - ✅ Updated `hooks.server.ts` with proper i18n middleware
   - ✅ Added cookie-based locale persistence
   - ✅ Added Accept-Language header fallback
   - ✅ Fixed runtime function imports (getLocale, setLocale, isLocale)

2. **Added Debug Logging**
   - ✅ Added production logging in hooks.server.ts
   - ✅ Added logging in LanguageSwitcher component
   - ✅ Added logging in +layout.svelte

3. **Fixed Type Definitions**
   - ✅ Updated app.d.ts with locale types
   - ✅ Added locale to App.Locals and PageData

4. **Verified Build Process**
   - ✅ Confirmed Paraglide plugin properly configured
   - ✅ Verified translation files are included in build
   - ✅ Build succeeds with all translations

### Implementation Steps

1. **Check Build Configuration**
```typescript
// vite.config.ts - Ensure paraglide is included
import { paraglide } from '@inlang/paraglide-js-adapter-vite';

export default defineConfig({
    plugins: [
        sveltekit(),
        paraglide({
            project: './project.inlang',
            outdir: './src/lib/paraglide'
        })
    ]
});
```

2. **Verify Translation Files Are Deployed**
```bash
# Check if translation files exist in production build
ls -la .svelte-kit/output/server/chunks/paraglide/
```

3. **Update Language Detection**
```typescript
// src/hooks.server.ts
import { i18n } from '$lib/i18n';
import { sequence } from '@sveltejs/kit/hooks';

const handleI18n = i18n.handle();

export const handle = sequence(
    async ({ event, resolve }) => {
        // Ensure locale is properly detected
        const locale = event.cookies.get('locale') || 
                      event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
                      'en';
        
        event.locals.locale = locale;
        
        return handleI18n({ event, resolve });
    }
);
```

4. **Add Debug Logging**
```typescript
// src/routes/(app)/+layout.svelte
<script>
    import { languageTag } from '$lib/paraglide/runtime';
    import { onMount } from 'svelte';
    
    onMount(() => {
        console.log('Current language:', languageTag());
        console.log('Available messages:', import.meta.glob('/src/lib/paraglide/messages/*.js'));
    });
</script>
```

### Files Created/Modified
1. `/src/hooks.server.ts` - MODIFIED (added i18n middleware)
2. `/src/routes/+layout.svelte` - MODIFIED (fixed imports, added logging)
3. `/src/lib/components/layout/LanguageSwitcher.svelte` - MODIFIED (added cookie handling)
4. `/src/app.d.ts` - MODIFIED (added locale types)

### Testing Requirements
1. Test language switching in production
2. Verify all pages translate correctly
3. Check URL routing with language prefix
4. Test cookie persistence
5. Verify SEO tags in different languages

### Deployment Requirements
- No additional environment variables needed
- Ensure build includes Paraglide compilation
- Monitor console logs for debug information

---

## Phase 3: Mobile UI/UX Improvements ✅ COMPLETED
**Duration**: 3-4 hours  
**Risk Level**: Low  
**Rollback Time**: Immediate
**Status**: ✅ Completed on 2025-07-20

### Issue
Wishlist/orders pages have poor mobile UX with text wrapping and button layout issues.

### Solution
Implement mobile-first responsive design improvements.

### Implementation Steps

1. **Fix Wishlist Mobile Layout**
```svelte
<!-- src/routes/(app)/wishlist/+page.svelte -->
<style>
    /* Mobile-first approach */
    .wishlist-item {
        @apply flex flex-col gap-3 p-4 border-b sm:flex-row sm:gap-4;
    }
    
    .action-buttons {
        @apply flex gap-2 w-full sm:w-auto;
    }
    
    .action-button {
        @apply flex-1 px-3 py-2 text-sm font-medium sm:flex-initial sm:px-4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    @media (max-width: 640px) {
        .action-button span {
            display: none;
        }
        
        .action-button::after {
            content: attr(data-mobile-text);
        }
    }
</style>

<div class="wishlist-item">
    <img src={item.image} alt={item.title} class="w-20 h-20 object-cover rounded" />
    
    <div class="flex-1">
        <h3 class="font-medium text-sm line-clamp-2">{item.title}</h3>
        <p class="text-sm text-muted-foreground">${item.price}</p>
    </div>
    
    <div class="action-buttons">
        <Button 
            class="action-button" 
            data-mobile-text="Buy"
            variant="default"
            size="sm"
        >
            <ShoppingCart class="w-4 h-4 sm:hidden" />
            <span>Add to Cart</span>
        </Button>
        
        <Button 
            class="action-button" 
            data-mobile-text="Remove"
            variant="outline"
            size="sm"
        >
            <Trash2 class="w-4 h-4 sm:hidden" />
            <span>Remove</span>
        </Button>
    </div>
</div>
```

2. **Fix Orders Page Mobile Layout**
```svelte
<!-- src/routes/(app)/orders/+page.svelte -->
<div class="order-card">
    <div class="flex flex-col gap-3">
        <!-- Order Header -->
        <div class="flex justify-between items-start">
            <div>
                <p class="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                <p class="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <Badge variant={getStatusVariant(order.status)} class="text-xs">
                {order.status}
            </Badge>
        </div>
        
        <!-- Order Items -->
        <div class="space-y-2">
            {#each order.items as item}
                <div class="flex items-center gap-3">
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        class="w-12 h-12 object-cover rounded"
                    />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">{item.title}</p>
                        <p class="text-xs text-muted-foreground">${item.price}</p>
                    </div>
                </div>
            {/each}
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 mt-2">
            <Button size="sm" variant="outline" class="flex-1 text-xs">
                View Details
            </Button>
            <Button size="sm" variant="outline" class="flex-1 text-xs">
                Track Order
            </Button>
        </div>
    </div>
</div>
```

### Testing Requirements
1. Test on multiple mobile devices (iPhone SE, iPhone 14, Android)
2. Verify touch targets are at least 44x44px
3. Check text readability and contrast
4. Test landscape orientation
5. Verify smooth scrolling

---

## Phase 4: Product Page Improvements ✅ COMPLETED
**Duration**: 2-3 hours  
**Risk Level**: Low  
**Rollback Time**: Immediate
**Status**: ✅ Completed on 2025-07-20

### Issue
- Duplicate condition badges (in image and above title)
- Color/size displayed as plain text instead of badges
- Unstyled tabs below seller section

### Solution
Consolidate badges and implement consistent styling.

### Implementation Steps

1. **Fix Badge Duplication**
```svelte
<!-- src/routes/(app)/listings/[id]/+page.svelte -->
<script>
    // Remove badge from image overlay
    let showBadgeInImage = false; // Set to true only for sold items
</script>

<!-- Product Header Section -->
<div class="product-header">
    <!-- Badges above title -->
    <div class="flex gap-2 mb-3">
        <Badge variant="secondary" class="text-xs">
            {listing.condition}
        </Badge>
        {#if listing.brand}
            <Badge variant="outline" class="text-xs">
                {listing.brand}
            </Badge>
        {/if}
        {#if listing.is_sold}
            <Badge variant="destructive" class="text-xs">
                Sold
            </Badge>
        {/if}
    </div>
    
    <h1 class="text-xl font-semibold mb-2">{listing.title}</h1>
</div>

<!-- Product Attributes as Badges -->
<div class="product-attributes">
    <div class="flex flex-wrap gap-2 mb-4">
        {#if listing.size}
            <Badge variant="outline" class="text-xs">
                <Ruler class="w-3 h-3 mr-1" />
                Size: {listing.size}
            </Badge>
        {/if}
        {#if listing.color}
            <Badge variant="outline" class="text-xs">
                <Palette class="w-3 h-3 mr-1" />
                {listing.color}
            </Badge>
        {/if}
        {#if listing.collection}
            <Badge variant="outline" class="text-xs">
                <Tag class="w-3 h-3 mr-1" />
                {listing.collection}
            </Badge>
        {/if}
    </div>
</div>
```

2. **Style Product Tabs**
```svelte
<!-- Product Information Tabs -->
<Tabs defaultValue="description" class="mt-6">
    <TabsList class="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="description" class="text-sm">
            <FileText class="w-4 h-4 mr-2" />
            Description
        </TabsTrigger>
        <TabsTrigger value="details" class="text-sm">
            <Info class="w-4 h-4 mr-2" />
            Details
        </TabsTrigger>
        <TabsTrigger value="shipping" class="text-sm">
            <Package class="w-4 h-4 mr-2" />
            Shipping
        </TabsTrigger>
    </TabsList>
    
    <TabsContent value="description" class="mt-4">
        <div class="prose prose-sm max-w-none">
            <p>{listing.description}</p>
        </div>
    </TabsContent>
    
    <TabsContent value="details" class="mt-4">
        <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
                <dt class="text-muted-foreground">Brand</dt>
                <dd class="font-medium">{listing.brand || 'No brand'}</dd>
            </div>
            <div class="flex justify-between">
                <dt class="text-muted-foreground">Condition</dt>
                <dd class="font-medium">{formatCondition(listing.condition)}</dd>
            </div>
            <div class="flex justify-between">
                <dt class="text-muted-foreground">Listed</dt>
                <dd class="font-medium">{formatDate(listing.created_at)}</dd>
            </div>
        </dl>
    </TabsContent>
    
    <TabsContent value="shipping" class="mt-4">
        <div class="space-y-3 text-sm">
            <div class="flex items-center gap-2">
                <Truck class="w-4 h-4 text-muted-foreground" />
                <span>Standard shipping: 3-5 business days</span>
            </div>
            <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-muted-foreground" />
                <span>Ships from: {listing.location || 'Seller location'}</span>
            </div>
        </div>
    </TabsContent>
</Tabs>
```

### Testing Requirements
1. Verify no duplicate badges appear
2. Check badge styling consistency
3. Test tab functionality on mobile
4. Verify all product attributes display correctly
5. Check visual hierarchy is maintained

---

## Phase 5: Browse Page Enhancement ✅ COMPLETED
**Duration**: 4-5 hours  
**Risk Level**: Medium  
**Rollback Time**: 30 minutes
**Status**: ✅ Completed on 2025-07-20

### Issue
Browse page needs to match the design of category pages (/men, /women) with emoji search and top sellers section.

### Solution
Implement unified browse page design with enhanced features.

### Implementation Steps

1. **Add Emoji Search Bar**
```svelte
<!-- src/routes/(app)/browse/+page.svelte -->
<div class="search-section">
    <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Search for items... 👗 👔 👟 💍"
            bind:value={searchQuery}
            on:input={debounce(handleSearch, 300)}
            class="pl-10 pr-4 h-12 text-base"
        />
    </div>
    
    <!-- Quick Search Suggestions -->
    <div class="flex gap-2 mt-3 flex-wrap">
        <Button 
            variant="outline" 
            size="sm"
            on:click={() => quickSearch('vintage')}
        >
            🕰️ Vintage
        </Button>
        <Button 
            variant="outline" 
            size="sm"
            on:click={() => quickSearch('designer')}
        >
            💎 Designer
        </Button>
        <Button 
            variant="outline" 
            size="sm"
            on:click={() => quickSearch('streetwear')}
        >
            🛹 Streetwear
        </Button>
        <Button 
            variant="outline" 
            size="sm"
            on:click={() => quickSearch('sustainable')}
        >
            🌱 Sustainable
        </Button>
    </div>
</div>
```

2. **Add Top Sellers Section**
```svelte
<!-- Top Sellers Component -->
<script lang="ts">
    import { createQuery } from '@tanstack/svelte-query';
    
    const topSellersQuery = createQuery({
        queryKey: ['topSellers'],
        queryFn: async () => {
            const response = await fetch('/api/sellers/top');
            return response.json();
        }
    });
</script>

<section class="top-sellers-section mb-8">
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Trophy class="w-5 h-5 text-yellow-500" />
        Top Sellers This Month
    </h2>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {#if $topSellersQuery.data}
            {#each $topSellersQuery.data as seller}
                <a 
                    href="/sellers/{seller.username}" 
                    class="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                    <Avatar class="w-16 h-16">
                        <AvatarImage src={seller.avatar_url} alt={seller.username} />
                        <AvatarFallback>{seller.username[0]}</AvatarFallback>
                    </Avatar>
                    <div class="text-center">
                        <p class="font-medium text-sm">{seller.username}</p>
                        <p class="text-xs text-muted-foreground">{seller.items_sold} sold</p>
                        <div class="flex items-center gap-1 mt-1">
                            <Star class="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span class="text-xs">{seller.rating}</span>
                        </div>
                    </div>
                </a>
            {/each}
        {/if}
    </div>
</section>
```

3. **Create Top Sellers API Endpoint**
```typescript
// src/routes/api/sellers/top/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
    const { data: topSellers, error } = await supabase
        .rpc('get_top_sellers', {
            time_period: 'month',
            limit: 12
        });
    
    if (error) {
        return json({ error: error.message }, { status: 500 });
    }
    
    return json(topSellers);
}
```

4. **Add Database Function for Top Sellers**
```sql
-- Create function to get top sellers
CREATE OR REPLACE FUNCTION get_top_sellers(
    time_period TEXT DEFAULT 'month',
    limit_count INT DEFAULT 12
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    items_sold INT,
    rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.username,
        p.avatar_url,
        COUNT(DISTINCT o.id)::INT as items_sold,
        COALESCE(AVG(r.rating), 5.0) as rating
    FROM profiles p
    JOIN listings l ON l.seller_id = p.id
    JOIN orders o ON o.listing_id = l.id
    LEFT JOIN reviews r ON r.seller_id = p.id
    WHERE 
        o.status = 'completed'
        AND o.created_at >= 
            CASE 
                WHEN time_period = 'week' THEN NOW() - INTERVAL '1 week'
                WHEN time_period = 'month' THEN NOW() - INTERVAL '1 month'
                ELSE NOW() - INTERVAL '1 year'
            END
    GROUP BY p.id, p.username, p.avatar_url
    ORDER BY items_sold DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### Testing Requirements
1. Test emoji search functionality
2. Verify top sellers data loads correctly
3. Check responsive layout on all devices
4. Test search performance with large datasets
5. Verify navigation to seller profiles

---

## Phase 6: Bottom Navsheet Visibility Fix ✅ COMPLETED
**Duration**: 1-2 hours  
**Risk Level**: Low  
**Rollback Time**: Immediate
**Status**: ✅ Completed on 2025-07-20

### Issue
Bottom navigation sheet showing on pages where it shouldn't (orders, wishlist) and missing borders.

### Solution
Implement conditional visibility and improve styling.

### Implementation Steps

1. **Update Bottom Nav Component**
```svelte
<!-- src/lib/components/layout/BottomNav.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    
    // Define pages where bottom nav should be hidden
    const hiddenPaths = [
        '/orders',
        '/wishlist',
        '/checkout',
        '/messages',
        '/settings',
        '/profile/edit'
    ];
    
    $: isVisible = !hiddenPaths.some(path => $page.url.pathname.startsWith(path));
</script>

{#if isVisible}
    <nav class="bottom-nav">
        <!-- Nav content -->
    </nav>
{/if}

<style>
    .bottom-nav {
        @apply fixed bottom-0 left-0 right-0 bg-background;
        @apply border-t border-b border-border;
        @apply px-4 py-2 z-40;
        @apply md:hidden; /* Only show on mobile */
        box-shadow: 0 -1px 3px 0 rgb(0 0 0 / 0.05);
    }
</style>
```

2. **Update Layout to Account for Bottom Nav**
```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script>
    import BottomNav from '$lib/components/layout/BottomNav.svelte';
    import { page } from '$app/stores';
    
    const hiddenPaths = ['/orders', '/wishlist', '/checkout', '/messages', '/settings', '/profile/edit'];
    $: hasBottomNav = !hiddenPaths.some(path => $page.url.pathname.startsWith(path));
</script>

<div class="app-layout" class:has-bottom-nav={hasBottomNav}>
    <slot />
    <BottomNav />
</div>

<style>
    .app-layout {
        min-height: 100vh;
        padding-bottom: 0;
    }
    
    .app-layout.has-bottom-nav {
        padding-bottom: 60px; /* Height of bottom nav */
    }
    
    @media (min-width: 768px) {
        .app-layout.has-bottom-nav {
            padding-bottom: 0; /* Reset on desktop */
        }
    }
</style>
```

### Testing Requirements
1. Verify bottom nav hidden on specified pages
2. Check border styling is consistent
3. Test page transitions
4. Verify content doesn't get cut off
5. Check z-index doesn't conflict with other elements

---

## Phase 7: Standardize Filter Placement ✅ COMPLETED
**Duration**: 2-3 hours  
**Risk Level**: Medium  
**Rollback Time**: 30 minutes
**Status**: ✅ Completed on 2025-07-20

### Issue
Duplicate filters in sticky header and bottom navigation sheet creating poor UX.

### Solution
Enhanced sticky search bar with quick filter dropdown while keeping comprehensive bottom sheet filters.

### What Was Implemented

1. **Created SearchBarWithFilters Component**
   - ✅ Created new component with integrated quick filter dropdown
   - ✅ Supports condition, size, and price range filters
   - ✅ Shows active filter count badge
   - ✅ Smooth dropdown animations
   - ✅ Click outside to close functionality

2. **Enhanced Browse Page Mobile Search**
   - ✅ Integrated SearchBarWithFilters into sticky mobile search section
   - ✅ Connected quick filters to existing filter state
   - ✅ Maintained URL-based filter persistence
   - ✅ Added handler to convert quick filter format to URL params

3. **Preserved Existing Functionality**
   - ✅ Bottom navsheet filters remain completely untouched
   - ✅ Desktop sidebar filters continue to work
   - ✅ Category pages maintain their filter implementation
   - ✅ All existing filter logic preserved

### Key Design Decisions
- **Two-tier filtering**: Quick access via search bar, comprehensive via bottom nav
- **Mobile-first**: Quick filters only show on mobile for easy thumb access
- **Non-disruptive**: Enhanced existing UI without breaking changes
- **Consistent UX**: Same filter options available in both locations

### Files Created/Modified
1. `/src/lib/components/search/SearchBarWithFilters.svelte` - NEW
2. `/src/routes/(app)/browse/+page.svelte` - MODIFIED (integrated new component)

### Testing Requirements
1. **Quick Filter Dropdown**
   - Verify dropdown opens/closes smoothly
   - Test click outside to close functionality
   - Check filter selections persist when dropdown reopens
   - Verify active filter count updates correctly

2. **Filter Integration**
   - Test quick filters apply to search results
   - Verify URL updates with filter parameters
   - Check filters work with search queries
   - Test clearing individual filter types

3. **Mobile Experience**
   - Verify quick filters only show on mobile
   - Test interaction between quick filters and bottom nav filters
   - Check that both filter systems update the same state
   - Verify no UI conflicts or overlaps

4. **Performance**
   - Test filter application speed
   - Verify no duplicate API calls
   - Check smooth transitions between filter states

5. **Cross-Page Consistency**
   - Navigate between pages and verify filter persistence
   - Test back button maintains filter state
   - Verify filters work on browse, category, and search pages

---

## Phase 8: Fix Filter Functionality
**Duration**: 3-4 hours  
**Risk Level**: High  
**Rollback Time**: 30 minutes

### Issue
Filters not working properly with badges, condition, size, and color attributes.

### Solution
Implement comprehensive filter system with proper database queries.

### Implementation Steps

1. **Update Filter Store**
```typescript
// src/lib/stores/filters.ts
import { writable, derived } from 'svelte/store';

interface FilterState {
    categories: string[];
    search: string;
    minPrice: number | null;
    maxPrice: number | null;
    sizes: string[];
    colors: string[];
    brands: string[];
    conditions: string[];
    collections: string[];
    sort: 'recent' | 'price_low' | 'price_high' | 'popular';
}

const defaultFilters: FilterState = {
    categories: [],
    search: '',
    minPrice: null,
    maxPrice: null,
    sizes: [],
    colors: [],
    brands: [],
    conditions: [],
    collections: [],
    sort: 'recent'
};

export const filters = writable<FilterState>(defaultFilters);

export const activeFilterCount = derived(filters, ($filters) => {
    let count = 0;
    if ($filters.categories.length) count += $filters.categories.length;
    if ($filters.search) count++;
    if ($filters.minPrice !== null || $filters.maxPrice !== null) count++;
    if ($filters.sizes.length) count += $filters.sizes.length;
    if ($filters.colors.length) count += $filters.colors.length;
    if ($filters.brands.length) count += $filters.brands.length;
    if ($filters.conditions.length) count += $filters.conditions.length;
    if ($filters.collections.length) count += $filters.collections.length;
    return count;
});

export const filterQuery = derived(filters, ($filters) => {
    const params = new URLSearchParams();
    
    if ($filters.categories.length) {
        params.set('categories', $filters.categories.join(','));
    }
    if ($filters.search) {
        params.set('q', $filters.search);
    }
    if ($filters.minPrice !== null) {
        params.set('min_price', $filters.minPrice.toString());
    }
    if ($filters.maxPrice !== null) {
        params.set('max_price', $filters.maxPrice.toString());
    }
    if ($filters.sizes.length) {
        params.set('sizes', $filters.sizes.join(','));
    }
    if ($filters.colors.length) {
        params.set('colors', $filters.colors.join(','));
    }
    if ($filters.brands.length) {
        params.set('brands', $filters.brands.join(','));
    }
    if ($filters.conditions.length) {
        params.set('conditions', $filters.conditions.join(','));
    }
    if ($filters.collections.length) {
        params.set('collections', $filters.collections.join(','));
    }
    params.set('sort', $filters.sort);
    
    return params.toString();
});
```

2. **Update Server-Side Filter Logic**
```typescript
// src/routes/(app)/browse/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
    const categories = url.searchParams.get('categories')?.split(',') || [];
    const search = url.searchParams.get('q') || '';
    const minPrice = Number(url.searchParams.get('min_price')) || null;
    const maxPrice = Number(url.searchParams.get('max_price')) || null;
    const sizes = url.searchParams.get('sizes')?.split(',') || [];
    const colors = url.searchParams.get('colors')?.split(',') || [];
    const brands = url.searchParams.get('brands')?.split(',') || [];
    const conditions = url.searchParams.get('conditions')?.split(',') || [];
    const collections = url.searchParams.get('collections')?.split(',') || [];
    const sort = url.searchParams.get('sort') || 'recent';
    
    let query = supabase
        .from('listings')
        .select(`
            *,
            seller:profiles!seller_id(username, avatar_url),
            images:listing_images(url),
            _count:likes(count)
        `)
        .eq('status', 'active')
        .eq('is_sold', false);
    
    // Apply filters
    if (categories.length) {
        query = query.in('category_id', categories);
    }
    
    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (minPrice !== null) {
        query = query.gte('price', minPrice);
    }
    
    if (maxPrice !== null) {
        query = query.lte('price', maxPrice);
    }
    
    if (sizes.length) {
        query = query.in('size', sizes);
    }
    
    if (colors.length) {
        query = query.in('color', colors);
    }
    
    if (brands.length) {
        query = query.in('brand', brands);
    }
    
    if (conditions.length) {
        query = query.in('condition', conditions);
    }
    
    if (collections.length) {
        query = query.in('collection', collections);
    }
    
    // Apply sorting
    switch (sort) {
        case 'price_low':
            query = query.order('price', { ascending: true });
            break;
        case 'price_high':
            query = query.order('price', { ascending: false });
            break;
        case 'popular':
            query = query.order('_count', { ascending: false });
            break;
        default:
            query = query.order('created_at', { ascending: false });
    }
    
    const { data: listings, error } = await query.limit(20);
    
    if (error) {
        console.error('Error fetching listings:', error);
        return { listings: [] };
    }
    
    return {
        listings,
        filters: {
            categories,
            search,
            minPrice,
            maxPrice,
            sizes,
            colors,
            brands,
            conditions,
            collections,
            sort
        }
    };
};
```

3. **Add Indexes for Performance**
```sql
-- Add indexes for better filter performance
CREATE INDEX idx_listings_category_status ON listings(category_id, status, is_sold);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_size ON listings(size);
CREATE INDEX idx_listings_color ON listings(color);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_condition ON listings(condition);
CREATE INDEX idx_listings_collection ON listings(collection);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Add GIN index for text search
CREATE INDEX idx_listings_search ON listings USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

### Testing Requirements
1. Test each filter type individually
2. Test multiple filter combinations
3. Verify filter persistence on navigation
4. Check performance with large datasets
5. Test edge cases (empty results, invalid values)

---

## Phase 9: Implement GDPR Cookie Consent ✅ COMPLETED
**Duration**: 3-4 hours  
**Risk Level**: Medium  
**Rollback Time**: Immediate
**Status**: ✅ Completed on 2025-07-20

### Issue
Missing GDPR-compliant cookie consent banner.

### Solution
Implement comprehensive cookie consent system.

### Implementation Steps

1. **Create Cookie Consent Component**
```svelte
<!-- src/lib/components/CookieConsent.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    let showBanner = false;
    let showDetails = false;
    
    interface CookiePreferences {
        necessary: boolean;
        analytics: boolean;
        marketing: boolean;
        preferences: boolean;
    }
    
    let preferences: CookiePreferences = {
        necessary: true, // Always true
        analytics: false,
        marketing: false,
        preferences: false
    };
    
    onMount(() => {
        if (browser) {
            const consent = localStorage.getItem('cookie-consent');
            if (!consent) {
                showBanner = true;
            } else {
                preferences = JSON.parse(consent);
                applyCookiePreferences();
            }
        }
    });
    
    function acceptAll() {
        preferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        savePreferences();
    }
    
    function acceptSelected() {
        savePreferences();
    }
    
    function rejectAll() {
        preferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        savePreferences();
    }
    
    function savePreferences() {
        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        applyCookiePreferences();
        showBanner = false;
        showDetails = false;
    }
    
    function applyCookiePreferences() {
        // Apply preferences to third-party scripts
        if (browser) {
            window.cookieConsent = preferences;
            
            // Enable/disable Google Analytics
            if (preferences.analytics && window.gtag) {
                window.gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            } else if (window.gtag) {
                window.gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
            
            // Dispatch event for other scripts
            window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
                detail: preferences
            }));
        }
    }
</script>

{#if showBanner}
    <div class="cookie-banner">
        <div class="cookie-content">
            {#if !showDetails}
                <!-- Simple Banner -->
                <div class="simple-banner">
                    <div class="text-section">
                        <h3 class="font-semibold mb-2">We value your privacy 🍪</h3>
                        <p class="text-sm text-muted-foreground">
                            We use cookies to enhance your browsing experience, personalize content, 
                            and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>
                    </div>
                    
                    <div class="button-section">
                        <Button
                            variant="ghost"
                            size="sm"
                            on:click={() => showDetails = true}
                        >
                            Manage Preferences
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            on:click={rejectAll}
                        >
                            Reject All
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            on:click={acceptAll}
                        >
                            Accept All
                        </Button>
                    </div>
                </div>
            {:else}
                <!-- Detailed Preferences -->
                <div class="detailed-preferences">
                    <h3 class="font-semibold mb-4">Cookie Preferences</h3>
                    
                    <div class="preference-list">
                        <!-- Necessary Cookies -->
                        <div class="preference-item">
                            <div class="preference-header">
                                <div>
                                    <h4 class="font-medium">Necessary Cookies</h4>
                                    <p class="text-sm text-muted-foreground">
                                        Essential for the website to function properly
                                    </p>
                                </div>
                                <Switch checked disabled />
                            </div>
                        </div>
                        
                        <!-- Analytics Cookies -->
                        <div class="preference-item">
                            <div class="preference-header">
                                <div>
                                    <h4 class="font-medium">Analytics Cookies</h4>
                                    <p class="text-sm text-muted-foreground">
                                        Help us understand how visitors interact with our website
                                    </p>
                                </div>
                                <Switch bind:checked={preferences.analytics} />
                            </div>
                        </div>
                        
                        <!-- Marketing Cookies -->
                        <div class="preference-item">
                            <div class="preference-header">
                                <div>
                                    <h4 class="font-medium">Marketing Cookies</h4>
                                    <p class="text-sm text-muted-foreground">
                                        Used to deliver personalized advertisements
                                    </p>
                                </div>
                                <Switch bind:checked={preferences.marketing} />
                            </div>
                        </div>
                        
                        <!-- Preference Cookies -->
                        <div class="preference-item">
                            <div class="preference-header">
                                <div>
                                    <h4 class="font-medium">Preference Cookies</h4>
                                    <p class="text-sm text-muted-foreground">
                                        Remember your preferences and settings
                                    </p>
                                </div>
                                <Switch bind:checked={preferences.preferences} />
                            </div>
                        </div>
                    </div>
                    
                    <div class="button-section mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            on:click={() => showDetails = false}
                        >
                            Back
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            on:click={rejectAll}
                        >
                            Reject All
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            on:click={acceptSelected}
                        >
                            Save Preferences
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .cookie-banner {
        @apply fixed bottom-0 left-0 right-0 z-50;
        @apply bg-background border-t shadow-lg;
        @apply p-4 md:p-6;
        animation: slideUp 0.3s ease-out;
    }
    
    .cookie-content {
        @apply container mx-auto max-w-6xl;
    }
    
    .simple-banner {
        @apply flex flex-col md:flex-row gap-4 items-start md:items-center;
    }
    
    .text-section {
        @apply flex-1;
    }
    
    .button-section {
        @apply flex flex-wrap gap-2;
    }
    
    .preference-list {
        @apply space-y-4 max-h-60 overflow-y-auto;
    }
    
    .preference-item {
        @apply border rounded-lg p-4;
    }
    
    .preference-header {
        @apply flex items-start justify-between gap-4;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
    
    @media (max-width: 640px) {
        .button-section {
            @apply w-full;
        }
        
        .button-section > :global(button) {
            @apply flex-1;
        }
    }
</style>
```

2. **Add to Root Layout**
```svelte
<!-- src/routes/+layout.svelte -->
<script>
    import CookieConsent from '$lib/components/CookieConsent.svelte';
</script>

<slot />
<CookieConsent />
```

3. **Create Privacy Policy Page**
```svelte
<!-- src/routes/(app)/privacy/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    let cookiePreferences: any = null;
    
    onMount(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (consent) {
            cookiePreferences = JSON.parse(consent);
        }
    });
    
    function openCookieSettings() {
        // Trigger cookie banner to show
        localStorage.removeItem('cookie-consent');
        window.location.reload();
    }
</script>

<div class="container max-w-4xl py-8">
    <h1 class="text-3xl font-bold mb-6">Privacy Policy</h1>
    
    <section class="prose prose-sm max-w-none">
        <h2>Cookie Policy</h2>
        <p>
            We use cookies to improve your experience on our platform. 
            You can manage your cookie preferences at any time.
        </p>
        
        <Button variant="outline" on:click={openCookieSettings}>
            Manage Cookie Preferences
        </Button>
        
        {#if cookiePreferences}
            <div class="mt-4 p-4 bg-muted rounded-lg">
                <h3 class="font-semibold mb-2">Your Current Preferences:</h3>
                <ul class="space-y-1 text-sm">
                    <li>Necessary: ✓ Always enabled</li>
                    <li>Analytics: {cookiePreferences.analytics ? '✓' : '✗'}</li>
                    <li>Marketing: {cookiePreferences.marketing ? '✓' : '✗'}</li>
                    <li>Preferences: {cookiePreferences.preferences ? '✓' : '✗'}</li>
                </ul>
            </div>
        {/if}
        
        <!-- Rest of privacy policy content -->
    </section>
</div>
```

### Testing Requirements
1. Test banner appears on first visit
2. Verify preferences are saved correctly
3. Check banner doesn't reappear after consent
4. Test preference changes apply immediately
5. Verify GDPR compliance (consent before cookies)

---

## Phase 10: User Onboarding & Notifications
**Duration**: 4-5 hours  
**Risk Level**: Low  
**Rollback Time**: Immediate

### Issue
New users need guidance and notification system for platform updates.

### Solution
Implement onboarding flow and notification popup system.

### Implementation Steps

1. **Create Onboarding Store**
```typescript
// src/lib/stores/onboarding.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

interface OnboardingState {
    hasSeenWelcome: boolean;
    hasCreatedFirstListing: boolean;
    hasMadeFirstPurchase: boolean;
    hasCompletedProfile: boolean;
    currentStep: number;
}

const defaultState: OnboardingState = {
    hasSeenWelcome: false,
    hasCreatedFirstListing: false,
    hasMadeFirstPurchase: false,
    hasCompletedProfile: false,
    currentStep: 0
};

function createOnboardingStore() {
    const { subscribe, set, update } = writable<OnboardingState>(defaultState);
    
    return {
        subscribe,
        initialize: (userId: string) => {
            if (browser) {
                const saved = localStorage.getItem(`onboarding-${userId}`);
                if (saved) {
                    set(JSON.parse(saved));
                } else {
                    set(defaultState);
                }
            }
        },
        completeStep: (step: keyof OnboardingState) => {
            update(state => {
                const newState = { ...state, [step]: true };
                if (browser) {
                    const userId = localStorage.getItem('userId');
                    if (userId) {
                        localStorage.setItem(`onboarding-${userId}`, JSON.stringify(newState));
                    }
                }
                return newState;
            });
        },
        reset: () => set(defaultState)
    };
}

export const onboarding = createOnboardingStore();

export const onboardingProgress = derived(onboarding, ($onboarding) => {
    const steps = [
        $onboarding.hasSeenWelcome,
        $onboarding.hasCompletedProfile,
        $onboarding.hasCreatedFirstListing,
        $onboarding.hasMadeFirstPurchase
    ];
    const completed = steps.filter(Boolean).length;
    return {
        completed,
        total: steps.length,
        percentage: (completed / steps.length) * 100
    };
});
```

2. **Create Welcome Modal**
```svelte
<!-- src/lib/components/onboarding/WelcomeModal.svelte -->
<script lang="ts">
    import { onboarding } from '$lib/stores/onboarding';
    import { goto } from '$app/navigation';
    
    export let user: User;
    
    let currentSlide = 0;
    let showModal = false;
    
    const slides = [
        {
            title: "Welcome to Driplo! 👋",
            description: "Your sustainable fashion marketplace",
            image: "/images/onboarding/welcome.svg",
            emoji: "🎉"
        },
        {
            title: "Buy & Sell with Confidence",
            description: "Secure payments, buyer protection, and verified sellers",
            image: "/images/onboarding/secure.svg",
            emoji: "🔒"
        },
        {
            title: "Join Our Community",
            description: "Connect with fashion lovers and build your sustainable wardrobe",
            image: "/images/onboarding/community.svg",
            emoji: "💚"
        }
    ];
    
    onMount(() => {
        if (!$onboarding.hasSeenWelcome) {
            showModal = true;
        }
    });
    
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
        } else {
            completeOnboarding();
        }
    }
    
    function completeOnboarding() {
        onboarding.completeStep('hasSeenWelcome');
        showModal = false;
        
        // Check if profile is complete
        if (!user.full_name || !user.bio) {
            goto('/profile/edit?onboarding=true');
        }
    }
    
    function skip() {
        onboarding.completeStep('hasSeenWelcome');
        showModal = false;
    }
</script>

<Dialog bind:open={showModal}>
    <DialogContent class="max-w-md">
        <div class="text-center">
            <!-- Progress Dots -->
            <div class="flex justify-center gap-2 mb-6">
                {#each slides as _, index}
                    <div 
                        class="w-2 h-2 rounded-full transition-colors"
                        class:bg-primary={index === currentSlide}
                        class:bg-muted={index !== currentSlide}
                    />
                {/each}
            </div>
            
            <!-- Slide Content -->
            <div class="mb-6">
                <div class="text-6xl mb-4">{slides[currentSlide].emoji}</div>
                <h2 class="text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
                <p class="text-muted-foreground">{slides[currentSlide].description}</p>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2">
                {#if currentSlide === 0}
                    <Button variant="ghost" class="flex-1" on:click={skip}>
                        Skip
                    </Button>
                {/if}
                <Button 
                    class="flex-1" 
                    on:click={nextSlide}
                >
                    {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </Button>
            </div>
        </div>
    </DialogContent>
</Dialog>
```

3. **Create Notification System**
```svelte
<!-- src/lib/components/NotificationPopup.svelte -->
<script lang="ts">
    import { notifications } from '$lib/stores/notifications';
    import { fly, fade } from 'svelte/transition';
    
    export let position: 'top-right' | 'top-center' | 'bottom-right' = 'top-right';
    
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-20 right-4'
    };
</script>

<div class="fixed {positionClasses[position]} z-50 pointer-events-none">
    <div class="flex flex-col gap-2 pointer-events-auto">
        {#each $notifications as notification (notification.id)}
            <div
                transition:fly={{ y: -20, duration: 300 }}
                class="notification"
                class:success={notification.type === 'success'}
                class:error={notification.type === 'error'}
                class:info={notification.type === 'info'}
            >
                <div class="flex items-start gap-3">
                    <div class="notification-icon">
                        {#if notification.type === 'success'}
                            <CheckCircle class="w-5 h-5" />
                        {:else if notification.type === 'error'}
                            <XCircle class="w-5 h-5" />
                        {:else}
                            <Info class="w-5 h-5" />
                        {/if}
                    </div>
                    
                    <div class="flex-1">
                        <h4 class="font-medium text-sm">{notification.title}</h4>
                        {#if notification.description}
                            <p class="text-sm text-muted-foreground mt-1">
                                {notification.description}
                            </p>
                        {/if}
                    </div>
                    
                    <button
                        on:click={() => notifications.dismiss(notification.id)}
                        class="text-muted-foreground hover:text-foreground"
                    >
                        <X class="w-4 h-4" />
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .notification {
        @apply bg-background border rounded-lg shadow-lg p-4;
        @apply min-w-[300px] max-w-[400px];
    }
    
    .notification.success {
        @apply border-green-500/20 bg-green-50 dark:bg-green-950/20;
    }
    
    .notification.success .notification-icon {
        @apply text-green-600 dark:text-green-400;
    }
    
    .notification.error {
        @apply border-red-500/20 bg-red-50 dark:bg-red-950/20;
    }
    
    .notification.error .notification-icon {
        @apply text-red-600 dark:text-red-400;
    }
    
    .notification.info {
        @apply border-blue-500/20 bg-blue-50 dark:bg-blue-950/20;
    }
    
    .notification.info .notification-icon {
        @apply text-blue-600 dark:text-blue-400;
    }
</style>
```

4. **Create Notification Store**
```typescript
// src/lib/stores/notifications.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
    duration?: number;
    action?: {
        label: string;
        callback: () => void;
    };
}

function createNotificationStore() {
    const { subscribe, update } = writable<Notification[]>([]);
    
    let timeouts = new Map<string, NodeJS.Timeout>();
    
    return {
        subscribe,
        
        show: (notification: Omit<Notification, 'id'>) => {
            const id = crypto.randomUUID();
            const duration = notification.duration ?? 5000;
            
            update(notifications => [...notifications, { ...notification, id }]);
            
            if (duration > 0) {
                const timeout = setTimeout(() => {
                    update(notifications => 
                        notifications.filter(n => n.id !== id)
                    );
                    timeouts.delete(id);
                }, duration);
                
                timeouts.set(id, timeout);
            }
            
            return id;
        },
        
        dismiss: (id: string) => {
            update(notifications => 
                notifications.filter(n => n.id !== id)
            );
            
            const timeout = timeouts.get(id);
            if (timeout) {
                clearTimeout(timeout);
                timeouts.delete(id);
            }
        },
        
        clear: () => {
            update(() => []);
            timeouts.forEach(timeout => clearTimeout(timeout));
            timeouts.clear();
        }
    };
}

export const notifications = createNotificationStore();

// Helper functions
export const showSuccess = (title: string, description?: string) => 
    notifications.show({ type: 'success', title, description });

export const showError = (title: string, description?: string) => 
    notifications.show({ type: 'error', title, description });

export const showInfo = (title: string, description?: string) => 
    notifications.show({ type: 'info', title, description });
```

5. **Add Progress Indicator for Onboarding**
```svelte
<!-- src/lib/components/onboarding/ProgressIndicator.svelte -->
<script lang="ts">
    import { onboarding, onboardingProgress } from '$lib/stores/onboarding';
    
    let showProgress = false;
    
    $: if ($onboardingProgress.completed > 0 && $onboardingProgress.completed < $onboardingProgress.total) {
        showProgress = true;
    }
</script>

{#if showProgress}
    <div class="onboarding-progress">
        <div class="progress-header">
            <span class="text-sm font-medium">Getting Started</span>
            <span class="text-sm text-muted-foreground">
                {$onboardingProgress.completed}/{$onboardingProgress.total} completed
            </span>
        </div>
        
        <div class="progress-bar">
            <div 
                class="progress-fill" 
                style="width: {$onboardingProgress.percentage}%"
            />
        </div>
        
        <div class="progress-steps">
            <button 
                class="step-item"
                class:completed={$onboarding.hasCompletedProfile}
                on:click={() => goto('/profile/edit')}
            >
                <UserCircle class="w-4 h-4" />
                Complete Profile
            </button>
            
            <button 
                class="step-item"
                class:completed={$onboarding.hasCreatedFirstListing}
                on:click={() => goto('/sell')}
            >
                <Plus class="w-4 h-4" />
                Create Listing
            </button>
            
            <button 
                class="step-item"
                class:completed={$onboarding.hasMadeFirstPurchase}
                on:click={() => goto('/browse')}
            >
                <ShoppingBag class="w-4 h-4" />
                Make Purchase
            </button>
        </div>
    </div>
{/if}

<style>
    .onboarding-progress {
        @apply bg-muted/50 border rounded-lg p-4 mb-4;
    }
    
    .progress-header {
        @apply flex justify-between items-center mb-3;
    }
    
    .progress-bar {
        @apply h-2 bg-muted rounded-full overflow-hidden mb-4;
    }
    
    .progress-fill {
        @apply h-full bg-primary transition-all duration-500;
    }
    
    .progress-steps {
        @apply flex flex-col gap-2;
    }
    
    .step-item {
        @apply flex items-center gap-2 text-sm p-2 rounded;
        @apply hover:bg-muted transition-colors text-left;
    }
    
    .step-item.completed {
        @apply text-muted-foreground line-through;
    }
</style>
```

### Testing Requirements
1. Test onboarding flow for new users
2. Verify progress tracking works correctly
3. Test notification display and dismissal
4. Check persistence across sessions
5. Verify mobile responsiveness

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Run full test suite
- [ ] Test all fixes on staging environment
- [ ] Backup production database
- [ ] Update environment variables
- [ ] Review and merge all code changes
- [ ] Update documentation

### Deployment Steps
1. **Phase 1-2 (Critical)**: Deploy email and translation fixes immediately
2. **Phase 3-5 (UI/UX)**: Deploy in next release (can be batched)
3. **Phase 6-8 (Functionality)**: Deploy after thorough testing
4. **Phase 9-10 (Features)**: Deploy as feature release

### Post-Deployment
- [ ] Verify email delivery (send test emails)
- [ ] Check Bulgarian translation on production
- [ ] Test all filters functionality
- [ ] Monitor error logs for 24 hours
- [ ] Gather user feedback
- [ ] Update status page

### Rollback Procedures
Each phase includes specific rollback instructions. General procedure:
1. Revert deployment to previous version
2. Clear CDN cache
3. Restore database if schema changed
4. Notify team of rollback
5. Investigate and fix issues

---

## Monitoring & Success Metrics

### Key Metrics to Track
1. **Email Delivery Rate**: Should be >95%
2. **Translation Coverage**: 100% of UI elements
3. **Mobile Bounce Rate**: Should decrease by 20%
4. **Filter Usage**: Track which filters are most used
5. **Cookie Consent Rate**: Measure acceptance vs rejection
6. **Onboarding Completion**: Target 60% completion rate

### Error Monitoring
- Set up alerts for failed email sends
- Monitor 404s for translation files
- Track JavaScript errors on mobile
- Monitor filter query performance
- Log cookie consent choices

### User Feedback Channels
1. In-app feedback widget
2. Support email monitoring
3. Social media mentions
4. App store reviews
5. User surveys after onboarding

---

## Conclusion

This comprehensive plan addresses all 10 identified issues with detailed implementation steps, testing requirements, and rollback procedures. The phased approach ensures minimal risk to production while delivering improvements systematically.

**Total Estimated Time**: 25-35 hours
**Recommended Timeline**: 2-3 weeks with parallel work streams

Each phase has been designed to be independent, allowing for flexible deployment schedules and easy rollback if issues arise. The plan prioritizes critical issues (email, translation) while ensuring UI/UX improvements enhance the user experience without breaking existing functionality.