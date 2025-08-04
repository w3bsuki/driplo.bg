# Onboarding Flow Documentation

## Current Flow (When `needs_username_setup = true`):

### Step 1: Username
- User enters username
- Validates availability
- Updates profile with username and sets `needs_username_setup = false`

### Step 2: Account Type  
- User selects Personal or Brand account
- Updates `account_type` field

### Step 3: Profile
- User enters full name, bio, location
- Optional: Upload avatar
- Updates profile fields

### Step 4: Payment (Optional)
- User can add payment methods (Revolut, PayPal, etc.)
- This step is OPTIONAL - users can skip
- Updates `payment_methods`, `revolut_tag`, `paypal_tag`

### Step 5: Complete
- Shows success screen
- Updates `onboarding_completed = true` and `setup_completed = true`
- Redirects to homepage

## Issues Fixed:

1. **406 Errors**: Removed `.single()` from queries that could return 0 or multiple rows
2. **Username Skip**: Made `needsUsernameSetup` reactive to properly detect missing username
3. **Next Button Disabled**: Made payment step optional (was requiring payment methods)
4. **No Redirect**: Added fallback redirect with timeout + force reload if needed
5. **Missing Columns**: Added payment_methods, revolut_tag, paypal_tag to profiles table
6. **Auto-completion Trigger**: Removed auto-completion from database trigger

## Testing:

To reset onboarding for testing:
```sql
UPDATE profiles 
SET 
    onboarding_completed = false,
    setup_completed = false,
    username = null,
    full_name = '',
    onboarding_step = 0,
    needs_username_setup = true,
    updated_at = NOW()
WHERE id = 'YOUR_USER_ID';
```

## Key Files:
- `/src/routes/(app)/onboarding/+page.svelte` - Main onboarding page
- `/src/lib/components/onboarding/ProfileSetupWizard.svelte` - Step wizard component
- `/src/hooks.server.ts` - Routing guard that redirects to onboarding if not completed