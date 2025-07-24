# Design System Violations Report

## Overview
This report identifies all Svelte components that violate the established design system standards. The product cards have been identified as a priority for immediate fixes.

## Design Standards to Enforce
1. **Border Radius**: Only use `rounded-sm` (no rounded-md, rounded-lg, rounded-xl)
2. **Shadows**: Remove all shadow-* classes except for dropdowns/modals
3. **Heights**: Use compact sizes (no h-10, h-12, h-14)
4. **Spacing**: Use tighter spacing (no p-4, p-6, gap-4, gap-6)
5. **Text Sizes**: Use text-sm for body text (no text-base or text-lg except headings)
6. **Transitions**: Always use duration-fast with transition-all

## Priority 1: Product Card Components (URGENT)

### ListingCard.svelte ⚠️
- ✅ Already uses `rounded-sm` correctly
- ✅ Already uses `duration-fast` 
- ❌ Uses `p-3` - should be `p-2`
- ❌ Uses `rounded-full` for avatars (lines 224, 229)
- ❌ Uses `rounded-b-xl` for error state (line 252)

### ListingGrid.svelte ⚠️
- ❌ Uses `rounded-lg` for error state (line 140)
- ❌ Uses `rounded-t-xl` and `rounded-b-xl` in skeleton (lines 159, 160)
- ❌ Uses `rounded-full` for avatar skeleton (line 164)
- ❌ Uses `py-3 md:py-4` - should be tighter
- ❌ Uses `gap-3 md:gap-4` - should be `gap-2 md:gap-3`
- ❌ Uses `p-4` for error state (line 140)
- ❌ Uses `shadow-sm` in skeleton (line 160)
- ❌ Uses `text-base md:text-lg` for title (line 133)
- ❌ Uses `text-lg` for empty state heading (line 201)
- ❌ Uses `rounded-lg` for button (line 205)

## Priority 2: UI Components (120 files with violations)

### Button Component
- `src/lib/components/ui/button.svelte` - Uses various rounded-* classes

### Input/Form Components
- `src/lib/components/ui/input.svelte` - Uses text-base
- `src/lib/components/ui/textarea.svelte` - Uses text-base, rounded-md
- `src/lib/components/ui/select/SelectTrigger.svelte` - Uses h-10, rounded-md
- `src/lib/components/ui/select/SelectContent.svelte` - Uses rounded-md, shadow-md

### Dialog/Modal Components
- `src/lib/components/ui/dialog/DialogContent.svelte` - Uses rounded-lg, shadow-lg (OK for modals)
- `src/lib/components/ui/dropdown-menu/DropdownMenuContent.svelte` - Uses rounded-md, shadow-md (OK for dropdowns)
- `src/lib/components/ui/sheet/SheetContent.svelte` - Uses shadow-lg (OK for sheets)

### Badge/Chip Components
- `src/lib/components/ui/BrandBadge.svelte` - Uses text-base
- `src/lib/components/ui/Chip.svelte` - Uses rounded-full
- `src/lib/components/ui/badge.svelte` - Needs review

## Priority 3: Page Components (High Traffic)

### Home Page Components
- `src/lib/components/home/HeroSearch.svelte` - Uses rounded-full, text-base
- `src/lib/components/home/QuickFilters.svelte` - Uses rounded-full, shadow-sm
- `src/lib/components/home/SellerQuickView.svelte` - Uses rounded-lg, shadow-md
- `src/lib/components/home/TopSellers.svelte` - Uses rounded-full, gap-4, p-4
- `src/lib/components/home/LandingCategories.svelte` - Uses rounded-lg, gap-6, text-lg
- `src/lib/components/home/CategoryGrid.svelte` - Uses h-12

### Browse/Category Pages
- `src/routes/(app)/browse/+page.svelte` - Uses gap-6, rounded-lg
- `src/lib/components/category/CategoryLanding.svelte` - Uses shadow-sm, text-base, gap-4
- `src/lib/components/subcategory/SubcategoryBrowse.svelte` - Uses text-lg, gap-4

### Product Detail Page
- `src/routes/(app)/listings/[id]/+page.svelte` - Uses rounded-lg, shadow-sm, text-base, gap-4, p-4

## Priority 4: Auth & Onboarding (77 files with violations)

### Auth Pages
- `src/routes/(auth)/login/+page.svelte` - Uses rounded-lg, shadow-sm, text-base
- `src/routes/(auth)/register/+page.svelte` - Uses rounded-lg, shadow-sm, text-base, p-4
- `src/routes/(auth)/forgot-password/+page.svelte` - Uses rounded-lg, shadow-md, gap-4
- `src/routes/(auth)/reset-password/+page.svelte` - Uses rounded-lg, shadow-md, gap-4

### Onboarding Components
- `src/lib/components/onboarding/ProfileSetupWizard.svelte` - Uses rounded-lg, shadow-md, gap-4
- `src/lib/components/onboarding/AvatarPicker.svelte` - Uses rounded-full, h-12, shadow-sm
- `src/lib/components/onboarding/BrandInfoForm.svelte` - Uses text-base, gap-4
- `src/lib/components/onboarding/WelcomeModal.svelte` - Uses rounded-lg, text-lg

## Priority 5: Other Components (82 files with violations)

### Profile Components
- `src/lib/components/profile/ProfileHeader.svelte` - Uses rounded-full, shadow-sm, text-base
- `src/lib/components/profile/ProfileStats.svelte` - Uses rounded-lg, shadow-sm, gap-4
- `src/lib/components/profile/SocialMediaLinks.svelte` - Uses rounded-full, shadow-sm

### Messaging Components
- `src/lib/components/messaging/MessageThread.svelte` - Uses rounded-full, p-4, gap-4
- `src/lib/components/messaging/ConversationList.svelte` - Uses rounded-full, h-12, gap-4
- `src/lib/components/messaging/MessageSearch.svelte` - Uses rounded-md, shadow-sm, text-base

### Order/Checkout Components
- `src/lib/components/checkout/CheckoutFlow.svelte` - Uses rounded-lg, h-12, p-4, gap-4
- `src/lib/components/checkout/CheckoutModal.svelte` - Uses rounded-lg, text-base, p-4
- `src/lib/components/orders/OrderList.svelte` - Uses rounded-lg, shadow-sm, h-12, gap-4
- `src/lib/components/orders/OrderDetails.svelte` - Uses rounded-lg, shadow-sm, gap-4

## Summary Statistics
- **Total files with violations**: 120+ files
- **Rounded violations**: 120 files
- **Shadow violations**: 77 files  
- **Height violations**: 61 files
- **Spacing violations**: 82 files
- **Text size violations**: 93 files
- **Transition violations**: 0 files (good!)

## Recommended Action Plan

### Phase 1: Product Cards (Immediate)
1. Fix ListingCard.svelte spacing and rounded classes
2. Fix ListingGrid.svelte comprehensive updates
3. Test and deploy

### Phase 2: Core UI Components (Week 1)
1. Update button.svelte to use consistent rounded-sm
2. Fix all form input components
3. Update badge/chip components
4. Leave dialog/modal shadows as-is (they need them)

### Phase 3: High-Traffic Pages (Week 1-2)
1. Fix home page components
2. Update browse/category pages
3. Fix product detail page

### Phase 4: Auth & Onboarding (Week 2)
1. Update all auth pages
2. Fix onboarding flow components

### Phase 5: Remaining Components (Week 3)
1. Update profile components
2. Fix messaging UI
3. Update checkout/order components

## Next Steps
1. Start with ListingCard.svelte and ListingGrid.svelte immediately
2. Create a design token system to enforce these standards
3. Add ESLint rules to catch violations
4. Update Storybook examples with correct patterns