# URGENT: Run These Migrations in Supabase SQL Editor

The MCP tool doesn't have table owner permissions. You must run these migrations manually in your Supabase dashboard.

## Quick Steps:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste each migration below** (in order)
3. **Click Run** for each one

## Migration 1: Profile Setup & Brand Verification
```sql
-- Copy EVERYTHING from this file:
-- K:\driplo-blue-main\supabase\migrations\20250121_profile_setup_and_brand_verification.sql
```

## Migration 2: Admin Roles
```sql
-- Copy EVERYTHING from this file:
-- K:\driplo-blue-main\supabase\migrations\20250121_setup_admin_roles.sql
```

## Migration 3: Make w3bsuki Admin
```sql
-- Copy EVERYTHING from this file:
-- K:\driplo-blue-main\scripts\make-w3bsuki-admin.sql
```

## After Running:

1. Generate types: `npx supabase gen types typescript --project-id [your-id] > src/lib/types/supabase.ts`
2. Test at `/onboarding` and `/dashboard`

**DO THIS NOW** - The entire brand auth system depends on these tables!