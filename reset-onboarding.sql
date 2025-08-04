-- Reset onboarding for testing
-- Run this SQL in Supabase SQL Editor to reset a user's onboarding status

-- Replace with your actual user ID
SELECT reset_user_onboarding('d9a3f71a-cd4b-4fe2-ac52-406105454908');

-- Or manually reset with:
/*
UPDATE profiles 
SET 
    onboarding_completed = false,
    setup_completed = false,
    onboarding_step = 0,
    needs_username_setup = true,
    updated_at = NOW()
WHERE id = 'd9a3f71a-cd4b-4fe2-ac52-406105454908';
*/

-- Check the result:
SELECT 
    id,
    username,
    onboarding_completed,
    setup_completed,
    onboarding_step,
    needs_username_setup,
    full_name,
    account_type,
    payment_methods
FROM profiles 
WHERE id = 'd9a3f71a-cd4b-4fe2-ac52-406105454908';