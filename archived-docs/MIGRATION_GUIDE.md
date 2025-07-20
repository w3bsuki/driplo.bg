# Type Migration Guide

After running the fresh database setup, update your code:

## 1. Replace Type Imports

### Old:
```typescript
import type { UserProfile } from '$lib/types/user'
import type { EnhancedUserProfile } from '$lib/types/social'
```

### New:
```typescript
import type { Profile } from '$lib/types/unified'
```

## 2. Fix Profile Field Names

### Old:
```typescript
// From UserProfile (camelCase)
user.displayName
user.sellerRating

// From EnhancedUserProfile
profile.cover_image_url
```

### New:
```typescript
// All snake_case from database
profile.full_name
profile.seller_rating
profile.cover_url  // Note: renamed in database
```

## 3. Fix Transaction Types

### Old:
```typescript
// Two conflicting types existed
transaction.buyerId  // camelCase version
transaction.buyer_id // snake_case version
```

### New:
```typescript
// Only snake_case from database
import type { Transaction } from '$lib/types/unified'
transaction.buyer_id
transaction.seller_id
```

## 4. Update Favorites References

### Old:
```typescript
.from('listing_likes')  // This table doesn't exist!
```

### New:
```typescript
.from('favorites')  // Correct table name
```

## 5. Remove Manual Profile Creation

In `src/lib/stores/auth.ts`, remove:
- Lines 49-78 (loadProfile manual creation)
- Lines 103-121 (signUp manual creation)

The database trigger handles this automatically now.

## 6. Update Component Props

### Old:
```typescript
interface Props {
  user: UserProfile
}
```

### New:
```typescript
import type { Profile } from '$lib/types/unified'

interface Props {
  user: Profile
}
```

## Quick Find & Replace

1. Find: `listing_likes` → Replace: `favorites`
2. Find: `cover_image_url` → Replace: `cover_url`
3. Find: `EnhancedUserProfile` → Replace: `Profile`
4. Find: `UserProfile` → Replace: `Profile`

## Files to Delete

- `src/lib/types/user.ts`
- `src/lib/types/social.ts`
- `src/lib/utils/setup-storage.ts`
- All migration files in `supabase/migrations/`

## Verification

After migration:
- [ ] No TypeScript errors
- [ ] User signup works
- [ ] Profile pages load
- [ ] Favorites functionality works
- [ ] No console errors about missing tables