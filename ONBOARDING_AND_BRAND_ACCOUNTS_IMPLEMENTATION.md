# Onboarding and Brand Accounts Implementation

## Overview

This document outlines the implementation of:
1. ✅ Image uploads with Supabase Storage
2. ✅ Caching strategy (no Redis needed)
3. 🚧 Profile editing functionality
4. 🚧 Onboarding flow (3-5 steps)
5. 🚧 Brand account system
6. 🚧 Social media verification
7. 🚧 Admin approval system

## Completed Features

### 1. Storage Buckets ✅
Created storage buckets with RLS policies:
- `avatars` - User profile pictures
- `covers` - Profile cover images  
- `listings` - Product images
- `brand-logos` - Brand logo images
- `returns` - Return/dispute evidence
- `disputes` - Dispute evidence

### 2. Image Optimization ✅
- Automatic WebP conversion
- Multiple sizes (thumb, small, medium, large)
- Progressive loading support
- CDN-backed delivery

### 3. Database Schema ✅
Added tables and columns:
- `profiles.account_type` - personal/brand
- `profiles.onboarding_completed` - boolean
- `profiles.onboarding_step` - current step
- `brand_profiles` - Brand account details
- `brand_social_verifications` - Social media verification

## In Progress

### Onboarding Flow (5 Steps)

1. **Account Type Selection**
   - Personal or Brand account
   - Different flows based on selection

2. **Avatar Setup**
   - Upload custom avatar
   - Or choose from avatar styles

3. **Personal Information**
   - Full name
   - Bio
   - Location

4. **Brand Information** (Brand accounts only)
   - Brand name & slug
   - Description
   - Logo upload
   - Social media links

5. **Welcome & Complete**
   - Success celebration
   - Next steps guidance

### Profile Editing
- Edit all profile fields
- Change avatar/cover
- Update brand details
- Manage social links

## Implementation Details

### Routes
- `/onboarding` - Main onboarding flow
- `/profile/edit` - Profile editing
- `/brands/[slug]` - Brand profile pages
- `/admin/brands` - Brand approval dashboard

### Components
- `ProfileSetupWizard.svelte` - Main wizard
- `AccountTypeSelector.svelte` - Step 1
- `AvatarPicker.svelte` - Step 2
- `PersonalInfoForm.svelte` - Step 3
- `BrandInfoForm.svelte` - Step 4
- `SetupComplete.svelte` - Step 5

### API Endpoints
- `/api/upload/image` - Handle all image uploads
- `/api/brands/verify` - Submit brand verification
- `/api/brands/social/verify` - Verify social accounts

## Brand Account Features

### Verification Process
1. User selects "Brand" account type
2. Fills out brand information
3. Links social media accounts
4. Admin reviews and approves
5. Brand gets verified badge

### Brand Benefits
- ✅ Custom brand page (`/brands/[slug]`)
- ✅ Verified badge on listings
- ✅ Brand logo display
- ✅ Social media links
- ✅ Brand description
- 🚧 Analytics dashboard
- 🚧 Bulk listing tools
- 🚧 Promotional features

### Social Verification
- Instagram username verification
- Verification code in bio
- Automatic checking via API
- Manual admin review option

## Security Considerations

1. **Image Uploads**
   - File type validation
   - Size limits (2MB logos, 5MB listings)
   - Virus scanning (future)
   - NSFW detection (future)

2. **Brand Verification**
   - Manual admin approval required
   - Social media verification
   - Business documentation (future)
   - Periodic re-verification

3. **RLS Policies**
   - Users can only edit own profiles
   - Brand profiles public when verified
   - Admins can manage all brands

## Next Steps

1. Complete ProfileSetupWizard integration
2. Create profile editing page
3. Build brand approval dashboard
4. Implement social media verification
5. Add analytics for brands
6. Create brand-specific features