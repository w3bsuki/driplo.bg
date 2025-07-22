# UI/UX Design System Refactoring Plan

## Executive Analysis

After analyzing your codebase, I've identified why certain components like the **orders page** and **category dropdown** have excellent UI/UX while others like the **product page** struggle. The key differences lie in **design consistency**, **component architecture**, and **styling patterns**.

## ✅ What Works Well (Success Patterns)

### 1. **Orders Page Excellence**

**File: `src/routes/(app)/orders/+page.svelte`**

**Why it works:**

```svelte
<!-- Consistent spacing and visual hierarchy -->
<div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <!-- Clear information architecture -->
  <div class="flex items-center justify-between mb-4">
    <div class="p-2 bg-[#87CEEB]/10 rounded-lg">
      <Package class="w-6 h-6 text-[#87CEEB]" />
    </div>
    <span class="text-xs text-gray-500">All Time</span>
  </div>
</div>

<!-- Semantic color system for status badges -->
{ value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
{ value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
{ value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' }
```

**Success Factors:**

- **Consistent spacing**: `p-6`, `mb-4`, `gap-4` used systematically
- **Semantic colors**: Status-specific color coding
- **Visual hierarchy**: Clear information grouping
- **Interactive feedback**: `hover:shadow-md transition-shadow`
- **Icon consistency**: Lucide icons with consistent sizing (`w-6 h-6`)

### 2. **Category Dropdown Excellence**

**File: `src/lib/components/home/HeroSearch.svelte`**

**Why it works:**

```svelte
<!-- Clean, focused design -->
<div class="flex-1 py-4 pr-3 text-base placeholder:text-gray-400 focus:outline-none bg-transparent">
<!-- Proper touch targets -->
<button class="p-3 mr-2 hover:scale-110 transition-transform focus:outline-none">
```

**Success Factors:**

- **Proper touch targets**: Minimum 44px touch areas
- **Smooth animations**: `hover:scale-110 transition-transform`
- **Clean typography**: Consistent text sizing and spacing
- **Accessibility**: Proper focus states and ARIA labels

## ❌ Problem Areas (Anti-Patterns)

### 1. **Product Page Issues**

**File: `src/routes/(app)/listings/[id]/+page.svelte`**

**Problems identified:**

```svelte
<!-- ❌ Inconsistent spacing -->
<div class="p-4"> <!-- Sometimes p-4, sometimes p-6, sometimes p-3 -->

<!-- ❌ Duplicate badge logic -->
{#if listing.is_sold}
  <Badge variant="destructive">Sold</Badge> <!-- In multiple places -->
{/if}

<!-- ❌ Inconsistent button styling -->
<button class="bg-orange-500 text-white px-6 py-3"> <!-- Hardcoded colors -->
<Button variant="default"> <!-- Mixed with design system -->
```

### 2. **Wishlist Page Mobile Issues**

**File: `src/routes/(app)/wishlist/+page.svelte`**

**Problems:**

```svelte
<!-- ❌ Poor mobile layout -->
<div class="flex flex-col gap-4 sm:flex-row"> <!-- Breaks on small screens -->

<!-- ❌ Inconsistent action buttons -->
<button class="flex-1 px-3 py-2 text-sm"> <!-- No design system variants -->
```

### 3. **Inconsistent Design Tokens**

**Current Issues:**

- **Mixed color systems**: Both `#87CEEB` hardcoded AND `hsl(var(--primary))`
- **Inconsistent spacing**: `p-3`, `p-4`, `p-6` used randomly
- **Typography chaos**: `text-sm`, `text-base`, `text-lg` without hierarchy
- **Button variants**: Custom buttons mixed with design system

## 🎯 Comprehensive Refactoring Strategy

### Phase 1: Design System Foundation (Week 1)

#### 1.1 Unified Color Palette

**Create: `src/lib/design-system/tokens.ts`**

```typescript
export const designTokens = {
	colors: {
		// Primary brand colors
		primary: {
			50: '#f0f9ff',
			100: '#e0f2fe',
			200: '#bae6fd',
			300: '#7dd3fc',
			400: '#38bdf8',
			500: '#87CEEB', // Main brand color
			600: '#6BB6D8',
			700: '#4F9FC5',
			800: '#0369a1',
			900: '#0c4a6e'
		},

		// Semantic colors
		semantic: {
			success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
			warning: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
			error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
			info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' }
		},

		// Status colors (for orders, listings, etc.)
		status: {
			pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
			confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
			processing: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
			shipped: { bg: 'bg-purple-100', text: 'text-purple-800' },
			delivered: { bg: 'bg-green-100', text: 'text-green-800' },
			cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
			refunded: { bg: 'bg-gray-100', text: 'text-gray-800' }
		}
	},

	spacing: {
		// Consistent spacing scale
		xs: '0.5rem', // 8px
		sm: '0.75rem', // 12px
		md: '1rem', // 16px
		lg: '1.5rem', // 24px
		xl: '2rem', // 32px
		'2xl': '3rem', // 48px
		'3xl': '4rem' // 64px
	},

	typography: {
		// Consistent text hierarchy
		display: 'text-4xl font-bold tracking-tight sm:text-6xl',
		h1: 'text-3xl font-bold tracking-tight sm:text-4xl',
		h2: 'text-2xl font-semibold tracking-tight sm:text-3xl',
		h3: 'text-xl font-semibold tracking-tight sm:text-2xl',
		h4: 'text-lg font-semibold tracking-tight',
		body: 'text-base leading-relaxed',
		small: 'text-sm leading-relaxed',
		caption: 'text-xs leading-relaxed'
	},

	components: {
		// Consistent component patterns
		card: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
		button: {
			primary:
				'bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors',
			secondary:
				'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors',
			ghost: 'hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors'
		},
		input:
			'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
	}
};
```

#### 1.2 Component Variant System

**Enhance: `src/lib/components/ui/button.svelte`**

```typescript
const buttonVariants = cva(
	// Base styles
	'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
				secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
				outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
				ghost: 'hover:bg-gray-100 text-gray-700',
				destructive: 'bg-red-500 hover:bg-red-600 text-white',
				success: 'bg-green-500 hover:bg-green-600 text-white'
			},
			size: {
				xs: 'h-8 px-3 text-xs',
				sm: 'h-9 px-4 text-sm',
				md: 'h-10 px-6 text-sm',
				lg: 'h-12 px-8 text-base',
				xl: 'h-14 px-10 text-lg',
				icon: 'h-10 w-10'
			},
			fullWidth: {
				true: 'w-full',
				false: 'w-auto'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
			fullWidth: false
		}
	}
);
```

#### 1.3 Status Badge System

**Create: `src/lib/components/ui/StatusBadge.svelte`**

```svelte
<script lang="ts">
	import { designTokens } from '$lib/design-system/tokens';
	import { cn } from '$lib/utils';

	interface Props {
		status: keyof typeof designTokens.colors.status;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { status, size = 'md', class: className }: Props = $props();

	const statusConfig = designTokens.colors.status[status];
	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base'
	};
</script>

<span
	class={cn(
		'inline-flex items-center font-medium rounded-full',
		statusConfig.bg,
		statusConfig.text,
		sizeClasses[size],
		className
	)}
>
	<slot />
</span>
```

### Phase 2: Component Standardization (Week 2)

#### 2.1 Product Page Redesign

**Target: `src/routes/(app)/listings/[id]/+page.svelte`**

**Problems to fix:**

1. **Duplicate badges** - Consolidate into single badge area
2. **Inconsistent spacing** - Use design system tokens
3. **Poor mobile layout** - Implement mobile-first design
4. **Mixed styling approaches** - Use only design system components

**Solution Pattern:**

```svelte
<!-- ✅ GOOD: Consistent product page layout -->
<div class="container mx-auto px-4 py-6 max-w-6xl">
	<!-- Product Header -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Image Gallery -->
		<div class="space-y-4">
			<ProductImageGallery {images} />
		</div>

		<!-- Product Info -->
		<div class="space-y-6">
			<!-- Badges Section -->
			<div class="flex flex-wrap gap-2">
				<StatusBadge status="available" size="sm">Available</StatusBadge>
				{#if listing.brand}
					<Badge variant="outline" size="sm">{listing.brand}</Badge>
				{/if}
				<Badge variant="secondary" size="sm">{listing.condition}</Badge>
			</div>

			<!-- Title & Price -->
			<div class="space-y-2">
				<h1 class={designTokens.typography.h1}>{listing.title}</h1>
				<p class="text-3xl font-bold text-primary-600">{formatPrice(listing.price)}</p>
			</div>

			<!-- Action Buttons -->
			<div class="space-y-3">
				<Button variant="primary" size="lg" fullWidth>
					<ShoppingBag class="w-5 h-5 mr-2" />
					Buy Now
				</Button>
				<Button variant="outline" size="lg" fullWidth>
					<MessageCircle class="w-5 h-5 mr-2" />
					Message Seller
				</Button>
			</div>
		</div>
	</div>
</div>
```

#### 2.2 Wishlist Mobile Optimization

**Target: `src/routes/(app)/wishlist/+page.svelte`**

**Current Issues:**

- Poor mobile layout with cramped buttons
- Inconsistent spacing and typography
- No proper touch targets

**Solution:**

```svelte
<!-- ✅ GOOD: Mobile-optimized wishlist item -->
<div class={designTokens.components.card}>
	<div class="p-4 space-y-4">
		<!-- Mobile: Stack vertically, Desktop: Side by side -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-4">
			<!-- Checkbox & Image -->
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					class="mt-1 w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
					bind:checked={isSelected}
				/>
				<img
					src={item.image}
					alt={item.title}
					class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
				/>
			</div>

			<!-- Item Details -->
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
				<p class="text-sm text-gray-600 mt-1">{item.seller.username}</p>
				<p class="text-lg font-bold text-primary-600 mt-2">{formatPrice(item.price)}</p>
			</div>

			<!-- Actions - Mobile: Full width, Desktop: Auto width -->
			<div class="flex gap-2 sm:flex-col sm:w-auto">
				<Button variant="primary" size="sm" class="flex-1 sm:flex-none sm:w-32">
					<ShoppingCart class="w-4 h-4 sm:mr-2" />
					<span class="hidden sm:inline">Add to Cart</span>
				</Button>
				<Button variant="outline" size="sm" class="flex-1 sm:flex-none sm:w-32">
					<Trash2 class="w-4 h-4 sm:mr-2" />
					<span class="hidden sm:inline">Remove</span>
				</Button>
			</div>
		</div>
	</div>
</div>
```

### Phase 3: Layout System Optimization (Week 3)

#### 3.1 Responsive Grid System

**Create: `src/lib/components/layout/ResponsiveGrid.svelte`**

```svelte
<script lang="ts">
	interface Props {
		variant?: 'products' | 'cards' | 'compact';
		gap?: 'sm' | 'md' | 'lg';
		minItemWidth?: string;
		class?: string;
	}

	let {
		variant = 'products',
		gap = 'md',
		minItemWidth = '280px',
		class: className
	}: Props = $props();

	const gridVariants = {
		products: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
		cards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
		compact: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
	};

	const gapClasses = {
		sm: 'gap-3',
		md: 'gap-4',
		lg: 'gap-6'
	};
</script>

<div
	class={cn('grid', gridVariants[variant], gapClasses[gap], className)}
	style="grid-template-columns: repeat(auto-fill, minmax({minItemWidth}, 1fr));"
>
	<slot />
</div>
```

#### 3.2 Mobile Navigation Enhancement

**Target: `src/lib/components/layout/MobileNav.svelte`**

**Current Issues:**

- Inconsistent spacing and sizing
- Poor touch targets
- No visual feedback

**Solution:**

```svelte
<!-- ✅ GOOD: Enhanced mobile navigation -->
<nav
	class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg md:hidden"
>
	<div class="grid grid-cols-5 h-16 px-2" style="padding-bottom: env(safe-area-inset-bottom)">
		{#each navItems as item (item.id)}
			<a
				href={item.href}
				class={cn(
					'flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200',
					'min-h-[44px] min-w-[44px]', // Proper touch targets
					isActive(item.href)
						? 'text-primary-600 bg-primary-50'
						: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
				)}
			>
				<svelte:component this={item.icon} class="w-6 h-6 mb-1" />
				<span class="text-xs font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
```

### Phase 4: Advanced UI Patterns (Week 4)

#### 4.1 Loading States System

**Create: `src/lib/components/ui/LoadingStates.svelte`**

```svelte
<!-- Skeleton loading for product cards -->
<div class="animate-pulse">
	<div class="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
	<div class="space-y-2">
		<div class="h-4 bg-gray-200 rounded w-3/4"></div>
		<div class="h-4 bg-gray-200 rounded w-1/2"></div>
	</div>
</div>

<!-- Loading spinner for buttons -->
<Button disabled>
	<LoadingSpinner class="w-4 h-4 mr-2" />
	Processing...
</Button>
```

#### 4.2 Error States System

**Create: `src/lib/components/ui/ErrorStates.svelte`**

```svelte
<!-- Empty state for no results -->
<div class="text-center py-12">
	<div class="text-6xl mb-4">🛍️</div>
	<h3 class={designTokens.typography.h3}>No items found</h3>
	<p class="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
	<Button variant="primary" onclick={clearFilters}>Clear Filters</Button>
</div>

<!-- Error state for failed requests -->
<div class="text-center py-12">
	<div class="text-6xl mb-4">⚠️</div>
	<h3 class={designTokens.typography.h3}>Something went wrong</h3>
	<p class="text-gray-600 mb-6">We couldn't load your items. Please try again.</p>
	<Button variant="outline" onclick={retry}>Try Again</Button>
</div>
```

## 🎯 Implementation Prompt for Claude Code

### **COMPREHENSIVE UI/UX DESIGN SYSTEM REFACTORING**

**Context:** You are refactoring the Driplo SvelteKit application to create a cohesive, professional design system. The current codebase has excellent UI/UX in some areas (orders page, category dropdown) but poor consistency in others (product page, wishlist mobile layout).

**Objective:** Transform the entire application to match the quality of the best components while establishing a scalable design system.

---

### **PHASE 1: Design System Foundation (Priority: CRITICAL)**

#### **Task 1.1: Create Design Tokens**

**File: `src/lib/design-system/tokens.ts`**

Create a comprehensive design token system that consolidates all the scattered styling approaches:

```typescript
export const designTokens = {
	// Color system - consolidate the mixed #87CEEB and hsl(var(--primary)) usage
	colors: {
		primary: {
			50: '#f0f9ff',
			100: '#e0f2fe',
			200: '#bae6fd',
			300: '#7dd3fc',
			400: '#38bdf8',
			500: '#87CEEB',
			600: '#6BB6D8',
			700: '#4F9FC5'
		},
		status: {
			pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
			confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
			delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
			cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
		}
	},

	// Spacing system - replace random p-3, p-4, p-6 usage
	spacing: {
		xs: '0.5rem',
		sm: '0.75rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
		'2xl': '3rem',
		'3xl': '4rem'
	},

	// Typography hierarchy - standardize text sizing
	typography: {
		display: 'text-4xl font-bold tracking-tight sm:text-6xl',
		h1: 'text-3xl font-bold tracking-tight sm:text-4xl',
		h2: 'text-2xl font-semibold tracking-tight sm:text-3xl',
		h3: 'text-xl font-semibold tracking-tight sm:text-2xl',
		body: 'text-base leading-relaxed',
		small: 'text-sm leading-relaxed'
	},

	// Component patterns - standardize card, button, input styles
	components: {
		card: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
		cardPadding: 'p-6', // Consistent padding
		button: {
			primary:
				'bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors',
			secondary:
				'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors'
		}
	}
};
```

#### **Task 1.2: Enhanced Button Component**

**File: `src/lib/components/ui/button.svelte`**

Enhance the existing button component to match the quality of the orders page buttons:

```typescript
const buttonVariants = cva(
	'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
				secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
				outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
				ghost: 'hover:bg-gray-100 text-gray-700',
				destructive: 'bg-red-500 hover:bg-red-600 text-white',
				success: 'bg-green-500 hover:bg-green-600 text-white'
			},
			size: {
				xs: 'h-8 px-3 text-xs min-w-[32px]',
				sm: 'h-9 px-4 text-sm min-w-[36px]',
				md: 'h-10 px-6 text-sm min-w-[40px]',
				lg: 'h-12 px-8 text-base min-w-[48px]',
				xl: 'h-14 px-10 text-lg min-w-[56px]',
				icon: 'h-10 w-10'
			},
			fullWidth: { true: 'w-full', false: 'w-auto' }
		}
	}
);
```

#### **Task 1.3: Status Badge System**

**File: `src/lib/components/ui/StatusBadge.svelte`**

Create a unified status badge system like the excellent one in the orders page:

```svelte
<script lang="ts">
	import { designTokens } from '$lib/design-system/tokens';

	interface Props {
		status:
			| 'pending'
			| 'confirmed'
			| 'processing'
			| 'shipped'
			| 'delivered'
			| 'cancelled'
			| 'refunded';
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, size = 'md' }: Props = $props();

	const statusConfig = designTokens.colors.status[status];
	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base'
	};
</script>

<span
	class={cn(
		'inline-flex items-center font-medium rounded-full',
		statusConfig.bg,
		statusConfig.text,
		sizeClasses[size]
	)}
>
	<slot />
</span>
```

---

### **PHASE 2: Fix Problem Components (Priority: HIGH)**

#### **Task 2.1: Product Page Complete Redesign**

**File: `src/routes/(app)/listings/[id]/+page.svelte`**

**Current Issues to Fix:**

1. **Duplicate badges** appearing in multiple places
2. **Inconsistent spacing** (mix of p-3, p-4, p-6)
3. **Poor mobile layout** with cramped elements
4. **Mixed styling** (hardcoded colors + design system)

**Implementation Requirements:**

```svelte
<!-- ✅ NEW: Clean, consistent product page layout -->
<div class="container mx-auto px-4 py-6 max-w-6xl">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Image Gallery Section -->
		<div class="space-y-4">
			<ProductImageGallery {images} />
		</div>

		<!-- Product Info Section -->
		<div class="space-y-6">
			<!-- Single Badge Area (eliminate duplicates) -->
			<div class="flex flex-wrap gap-2">
				{#if listing.is_sold}
					<StatusBadge status="sold" size="sm">Sold</StatusBadge>
				{:else}
					<StatusBadge status="available" size="sm">Available</StatusBadge>
				{/if}
				{#if listing.brand}
					<Badge variant="outline" size="sm">{listing.brand}</Badge>
				{/if}
				<Badge variant="secondary" size="sm">{listing.condition}</Badge>
			</div>

			<!-- Title & Price with proper hierarchy -->
			<div class="space-y-2">
				<h1 class={designTokens.typography.h1}>{listing.title}</h1>
				<p class="text-3xl font-bold text-primary-600">{formatPrice(listing.price)}</p>
			</div>

			<!-- Seller Info -->
			<div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
				<img src={listing.seller.avatar_url} class="w-12 h-12 rounded-full" />
				<div>
					<p class="font-semibold">{listing.seller.username}</p>
					<p class="text-sm text-gray-600">{listing.seller.followers_count} followers</p>
				</div>
			</div>

			<!-- Action Buttons with proper spacing -->
			<div class="space-y-3">
				<Button variant="primary" size="lg" fullWidth>
					<ShoppingBag class="w-5 h-5 mr-2" />
					Buy Now - {formatPrice(listing.price)}
				</Button>
				<div class="grid grid-cols-2 gap-3">
					<Button variant="outline" size="lg">
						<Heart class="w-5 h-5 mr-2" />
						Save
					</Button>
					<Button variant="outline" size="lg">
						<MessageCircle class="w-5 h-5 mr-2" />
						Message
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
```

#### **Task 2.2: Wishlist Mobile Layout Fix**

**File: `src/routes/(app)/wishlist/+page.svelte`**

**Current Issues:**

- Poor mobile layout with cramped action buttons
- Inconsistent spacing and touch targets
- No proper responsive design

**Implementation:**

```svelte
<!-- ✅ NEW: Mobile-optimized wishlist layout -->
{#each favorites as favorite (favorite.id)}
	<div class={designTokens.components.card}>
		<div class={cn(designTokens.components.cardPadding, 'space-y-4')}>
			<!-- Responsive layout: stack on mobile, side-by-side on desktop -->
			<div class="flex flex-col sm:flex-row sm:items-center gap-4">
				<!-- Checkbox & Image -->
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						class="mt-1 w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
						bind:checked={selectedItems.has(favorite.id}
					/>
					<img
						src={favorite.listings.images[0]}
						alt={favorite.listings.title}
						class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
					/>
				</div>

				<!-- Item Details -->
				<div class="flex-1 min-w-0">
					<h3 class="font-semibold text-gray-900 line-clamp-2">{favorite.listings.title}</h3>
					<p class="text-sm text-gray-600 mt-1">{favorite.listings.seller.username}</p>
					<p class="text-lg font-bold text-primary-600 mt-2">
						{formatPrice(favorite.listings.price)}
					</p>
				</div>

				<!-- Action Buttons - Responsive -->
				<div class="flex gap-2 sm:flex-col sm:w-auto">
					<Button variant="primary" size="sm" class="flex-1 sm:flex-none sm:w-32">
						<ShoppingCart class="w-4 h-4 sm:mr-2" />
						<span class="hidden sm:inline">Add to Cart</span>
					</Button>
					<Button variant="outline" size="sm" class="flex-1 sm:flex-none sm:w-32">
						<Trash2 class="w-4 h-4 sm:mr-2" />
						<span class="hidden sm:inline">Remove</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
{/each}
```

---

### **PHASE 3: Systematic Component Updates (Priority: MEDIUM)**

#### **Task 3.1: Update All Card Components**

**Target Files:**

- `src/lib/components/listings/ListingCard.svelte`
- `src/routes/(app)/orders/+page.svelte` (maintain excellence)
- `src/routes/(app)/sellers/+page.svelte`

**Requirements:**

1. Replace all hardcoded card styling with `designTokens.components.card`
2. Use consistent padding: `designTokens.components.cardPadding`
3. Ensure all cards have proper hover states: `hover:shadow-md transition-shadow`

#### **Task 3.2: Standardize All Buttons**

**Target:** All components using custom button styling

**Find and Replace:**

```svelte
<!-- ❌ BEFORE: Custom button styling -->
<button class="bg-orange-500 text-white px-6 py-3 rounded-lg">

<!-- ✅ AFTER: Design system button -->
<Button variant="primary" size="lg">
```

#### **Task 3.3: Typography Consistency**

**Target:** All text elements

**Requirements:**

1. Replace all heading tags with design system classes:
   - `<h1>` → `<h1 class={designTokens.typography.h1}>`
   - `<h2>` → `<h2 class={designTokens.typography.h2}>`
   - etc.

2. Standardize body text:
   - `<p>` → `<p class={designTokens.typography.body}>`

---

### **PHASE 4: Mobile Optimization (Priority: HIGH)**

#### **Task 4.1: Touch Target Optimization**

**Requirements:**

- All interactive elements must be minimum 44px × 44px
- Add proper touch feedback with `active:scale-95` transitions
- Ensure proper spacing between touch targets (minimum 8px)

#### **Task 4.2: Mobile Navigation Enhancement**

**File: `src/lib/components/layout/MobileNav.svelte`**

**Current Issues:**

- Inconsistent icon sizing
- Poor touch targets
- No visual feedback

**Implementation:**

```svelte
<nav
	class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg md:hidden"
>
	<div class="grid grid-cols-5 h-16 px-2" style="padding-bottom: env(safe-area-inset-bottom)">
		{#each navItems as item (item.id)}
			<a
				href={item.href}
				class={cn(
					'flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200',
					'min-h-[44px] min-w-[44px]', // Proper touch targets
					'active:scale-95', // Touch feedback
					isActive(item.href)
						? 'text-primary-600 bg-primary-50'
						: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
				)}
			>
				<svelte:component this={item.icon} class="w-6 h-6 mb-1" />
				<span class="text-xs font-medium truncate">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
```

---

### **SUCCESS CRITERIA**

**Visual Consistency:**

- [ ] All components use design system tokens
- [ ] No hardcoded colors (except in design tokens)
- [ ] Consistent spacing throughout application
- [ ] Unified typography hierarchy

**Mobile Experience:**

- [ ] All touch targets minimum 44px × 44px
- [ ] Proper responsive layouts on all pages
- [ ] Smooth touch interactions with feedback
- [ ] No horizontal scrolling on mobile

**Component Quality:**

- [ ] Product page matches orders page quality
- [ ] Wishlist mobile layout is fully functional
- [ ] All cards have consistent styling
- [ ] Status badges work uniformly across app

**Performance:**

- [ ] No layout shifts during loading
- [ ] Smooth animations and transitions
- [ ] Proper loading and error states

---

### **IMPLEMENTATION ORDER**

1. **Week 1:** Create design tokens and enhanced UI components
2. **Week 2:** Fix product page and wishlist mobile issues
3. **Week 3:** Update all existing components to use design system
4. **Week 4:** Mobile optimization and final polish

**Note:** Maintain the excellent quality of the orders page and category dropdown as the gold standard. Every component should match their level of polish and attention to detail.
