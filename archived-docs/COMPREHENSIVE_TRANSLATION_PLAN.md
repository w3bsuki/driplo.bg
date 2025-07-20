# Comprehensive Translation Plan for Driplo Website

## Overview

This document outlines a complete internationalization (i18n) plan for translating the entire Driplo website from English to Bulgarian using Paraglide JS. The analysis covers all user-facing text across the application.

## Current Status

✅ **Completed**: Basic header navigation and foundational translations  
✅ **Completed**: Core infrastructure with Paraglide JS setup  
✅ **Completed**: Phase 1.1 - Authentication & Registration (45 keys)  
✅ **Completed**: Phase 1.2 - Product Browsing & Search (38 keys)  
✅ **Completed**: Phase 1.3 - Listing Creation (78 keys)  
🔄 **In Progress**: Phase 2 - User Management  
❌ **Pending**: Navigation, SEO

## Translation Strategy

### Phase 1: Core User Flows (Week 1-2)
**Priority: Critical** - These directly impact user experience

#### 1.1 Authentication & Registration ✅ COMPLETED
- [x] Login form (`auth_*` keys)
- [x] Registration form  
- [x] OAuth flows (Google, GitHub)
- [x] Error handling and validation messages
- [x] Toast notifications

**Files Updated:**
- ✅ `src/routes/(auth)/login/+page.svelte`
- ✅ `src/routes/(auth)/register/+page.svelte` 
- ⚠️ `src/routes/(auth)/auth-error/+page.svelte` (needs verification)

**Translation Keys Added:** 45 keys (auth_*)

#### 1.2 Product Browsing & Search ✅ COMPLETED
- [x] Browse page filters and sorting
- [x] Search functionality
- [x] Product cards and listings
- [x] Category navigation
- [x] Mobile filters drawer
- [x] Hero search component

**Files Updated:**
- ✅ `src/routes/(app)/browse/+page.svelte`
- ✅ `src/lib/components/home/HeroSearch.svelte`
- ⚠️ `src/lib/components/listings/ListingCard.svelte` (needs verification)
- ⚠️ `src/lib/components/layout/MobileFiltersDrawer.svelte` (needs verification)

**Translation Keys Added:** 38 keys (browse_*, sort_*, condition_*, search_*, category_*, filter_*)

#### 1.3 Listing Creation (Selling) ✅ COMPLETED
- [x] Multi-step form (4 steps)
- [x] Image upload interface
- [x] Form validation messages
- [x] Category selection
- [x] Price and shipping options

**Files Updated:**
- ✅ `src/routes/(app)/sell/+page.svelte`
- ✅ `src/lib/components/listings/CreateListingForm.svelte`
- ✅ `src/lib/components/upload/ImageUpload.svelte`

**Translation Keys Added:** 78 keys (listing_*, upload_*, sell_*)

### Phase 2: User Management (Week 3)
**Priority: High** - User profiles and settings

#### 2.1 Profile Pages
- [ ] User profile display
- [ ] Follow/unfollow functionality
- [ ] Profile statistics
- [ ] User listings view

**Files to Update:**
- `src/routes/(app)/profile/[username]/+page.svelte`
- `src/lib/components/profile/ProfileHeader.svelte`

**Translation Keys Needed:** ~25 keys

#### 2.2 Profile Settings
- [ ] Settings form
- [ ] Image upload (avatar, cover)
- [ ] Account information
- [ ] Validation messages

**Files to Update:**
- `src/routes/(app)/profile/settings/+page.svelte`

**Translation Keys Needed:** ~20 keys

### Phase 3: Navigation & Layout (Week 4)
**Priority: Medium** - Supporting UI elements

#### 3.1 Mobile Navigation
- [ ] Bottom navigation bar
- [ ] Mobile menu descriptions
- [ ] Accessibility labels

**Files to Update:**
- `src/lib/components/layout/MobileNav.svelte`

**Translation Keys Needed:** ~15 keys

#### 3.2 Home Page Content
- [ ] Hero section
- [ ] Category showcase
- [ ] Trending searches
- [ ] Featured content sections

**Files to Update:**
- `src/routes/(app)/+page.svelte`
- `src/lib/components/home/HeroSearch.svelte`

**Translation Keys Needed:** ~30 keys

### Phase 4: SEO & Meta Content (Week 5)
**Priority: Low** - Search engine optimization

#### 4.1 Page Titles & Meta Descriptions
- [ ] Dynamic page titles
- [ ] Meta descriptions
- [ ] Open Graph tags
- [ ] Schema.org structured data

**Files to Update:**
- `src/app.html`
- Various `+page.svelte` files
- `src/lib/utils/seo.js` (if exists)

**Translation Keys Needed:** ~20 keys

#### 4.2 Error Pages & States
- [ ] 404 page
- [ ] 500 page  
- [ ] Loading states
- [ ] Empty states

**Files to Update:**
- `src/routes/+error.svelte`
- Various loading components

**Translation Keys Needed:** ~15 keys

## Implementation Roadmap

### Week 1: Authentication & Core Flows
```bash
# Day 1-2: Authentication
- Add auth_* translation keys to messages/en.json and messages/bg.json
- Update login/register forms to use translation functions
- Test language switching on auth pages

# Day 3-4: Product Browsing  
- Add browse_*, sort_*, filter_* keys
- Update browse page and listing cards
- Test search and filtering in both languages

# Day 5: Listing Creation (Start)
- Add listing_* keys for basic form
- Update first 2 steps of listing creation form
```

### Week 2: Complete Listing Creation
```bash
# Day 1-3: Finish Listing Form
- Complete all 4 steps of listing creation
- Add validation message translations
- Test full listing creation flow

# Day 4-5: Polish & Testing
- Fix any translation issues
- Test edge cases and error states
- Verify mobile responsiveness
```

### Week 3: User Profiles
```bash
# Day 1-3: Profile Pages
- Add profile_* translation keys
- Update profile display components
- Test follow/unfollow functionality

# Day 4-5: Profile Settings
- Add settings_* keys
- Update settings forms
- Test profile editing flow
```

### Week 4: Navigation & Home
```bash
# Day 1-2: Mobile Navigation
- Update mobile nav component
- Add accessibility translations
- Test mobile navigation flow

# Day 3-5: Home Page
- Add home page content translations
- Update hero section and categories
- Test trending searches and content
```

### Week 5: SEO & Polish
```bash
# Day 1-3: SEO Content
- Add page titles and meta descriptions
- Update structured data
- Test SEO in both languages

# Day 4-5: Final Polish
- Add error pages and loading states
- Comprehensive testing
- Performance optimization
```

## Translation Key Categories

### 1. Authentication (`auth_*`)
```javascript
// Login
"auth_welcome_back": "Welcome back",
"auth_email_address": "Email address", 
"auth_password": "Password",
"auth_sign_in": "Sign in",
"auth_forgot_password": "Forgot password?",

// Register  
"auth_create_account": "Create account",
"auth_full_name": "Full name",
"auth_username": "Username",
"auth_confirm_password": "Confirm password",
"auth_agree_terms": "I agree to the Terms of Service",

// Validation
"auth_email_required": "Email is required",
"auth_password_min": "Password must be at least 8 characters",
"auth_passwords_match": "Passwords must match"
```

### 2. Browse & Search (`browse_*`, `sort_*`, `filter_*`)
```javascript
// Browse
"browse_all_items": "All Items",
"browse_filters": "Filters", 
"browse_items_count": "{count} items",
"browse_clear_filters": "Clear all filters",

// Sorting
"sort_recent": "Most recent",
"sort_price_low": "Price: Low to High",
"sort_price_high": "Price: High to Low",

// Filters
"filter_price_range": "Price Range",
"filter_condition": "Condition",
"filter_size": "Size",
"filter_brand": "Brand"
```

### 3. Listings (`listing_*`)
```javascript
// Creation
"listing_title": "Title",
"listing_description": "Description",
"listing_category": "Category",
"listing_price": "Price",
"listing_condition": "Condition",
"listing_upload_photos": "Upload Photos",

// Display
"listing_likes": "{count} likes",
"listing_size_label": "Size {size}",
"listing_condition_new": "New",
"listing_condition_good": "Good"
```

### 4. Profile (`profile_*`, `settings_*`)
```javascript
// Profile
"profile_follow": "Follow",
"profile_followers": "Followers", 
"profile_listings": "Listings",
"profile_member_since": "Member since {date}",

// Settings
"settings_profile_info": "Profile Information",
"settings_full_name": "Full Name",
"settings_bio": "Bio",
"settings_save_changes": "Save Changes"
```

### 5. Navigation (`nav_*`, `mobile_*`)
```javascript
// Mobile Nav
"nav_browse": "Browse",
"nav_sell": "Sell",
"nav_messages": "Messages",
"nav_profile": "Profile",

// Mobile specific
"mobile_filters_title": "Filters",
"mobile_sort_by": "Sort by",
"mobile_show_results": "Show {count} results"
```

### 6. SEO (`seo_*`, `meta_*`)
```javascript
// Page titles
"seo_home_title": "Driplo - Sustainable Fashion Marketplace",
"seo_browse_title": "Browse Fashion - Driplo",
"seo_profile_title": "{username}'s Profile - Driplo",

// Descriptions
"meta_home_description": "Shop and sell pre-loved designer fashion",
"meta_browse_description": "Discover thousands of fashion items"
```

## Bulgarian Translation Guidelines

### 1. Tone & Style
- **Formal vs Informal**: Use informal "ти" form for better user engagement
- **Technical Terms**: Keep some English terms where commonly used (e.g., "email")
- **Action Words**: Use clear, direct imperatives for buttons and CTAs

### 2. Cultural Adaptations
- **Currency**: BGN (лв.) instead of USD/GBP
- **Measurements**: European sizes for clothing/shoes
- **Regions**: Focus on Bulgarian cities and regions
- **Payment**: Local payment methods if applicable

### 3. UI Considerations
- **Text Length**: Bulgarian text is typically 20-30% longer than English
- **Line Breaks**: Plan for longer button labels and form fields
- **Typography**: Ensure Cyrillic characters render properly

## Testing Strategy

### 1. Functional Testing
- [ ] All forms work in both languages
- [ ] Language switching preserves state
- [ ] Search functionality works with Cyrillic input
- [ ] Currency formatting displays correctly

### 2. Visual Testing
- [ ] No layout breaks with longer text
- [ ] Mobile responsiveness maintained
- [ ] Typography renders correctly
- [ ] Icons and images have proper alt text

### 3. SEO Testing
- [ ] Page titles translate correctly
- [ ] Meta descriptions are appropriate length
- [ ] URL structure supports language routing
- [ ] Hreflang tags implemented properly

## Tools & Resources

### Development Tools
- **Paraglide JS** - Already configured for compile-time translations
- **VS Code Sherlock Extension** - For inline translation management
- **Browser DevTools** - For testing different locales

### Translation Resources
- **Google Translate** - For initial drafts (human review required)
- **Native Speaker Review** - Recommended for final polish
- **Bulgarian Style Guides** - For consistent terminology

### Performance Monitoring
- **Bundle Size Analysis** - Verify tree-shaking works properly
- **Lighthouse Scores** - Ensure SEO and performance maintained
- **Core Web Vitals** - Monitor impact on loading performance

## Success Metrics

### Completion Criteria
- [ ] 100% of user-facing text translated
- [ ] Language switching works on all pages
- [ ] No layout breaks in either language
- [ ] SEO optimization for Bulgarian market
- [ ] Performance impact < 5KB per route

### Quality Metrics
- [ ] Translation accuracy reviewed by native speaker
- [ ] Consistent terminology across application
- [ ] Cultural appropriateness verified
- [ ] User testing with Bulgarian speakers

## Maintenance Plan

### Ongoing Translation Process
1. **New Features**: Add translation keys during development
2. **Translation Updates**: Regular review of translation quality
3. **Content Management**: Process for updating marketing copy
4. **Community Contributions**: Framework for user-submitted improvements

### Documentation
- [ ] Translation key naming conventions
- [ ] Component translation patterns
- [ ] Testing procedures for new translations
- [ ] Deployment checklist for i18n updates

---

**Estimated Timeline**: 5 weeks  
**Translation Keys**: ~260 total keys  
**Files Modified**: ~25 component/page files  
**Testing Time**: 1 week additional for comprehensive testing

This plan provides a systematic approach to translating the entire Driplo website while maintaining code quality and user experience in both languages.