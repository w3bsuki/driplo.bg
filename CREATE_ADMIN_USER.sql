-- Run this in Supabase SQL Editor to create admin user
-- This uses Supabase's built-in functions properly

-- First, create the user using auth.users
SELECT auth.uid() as current_user_id;

-- Create admin user with proper password hashing
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Insert into auth.users with proper password encryption
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'w3bsuki@gmail.com',
        crypt('12345678', gen_salt('bf')),
        now(),
        '{"username": "w3bsuki", "full_name": "Admin User"}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO new_user_id;
    
    -- Update the profile to admin
    UPDATE profiles 
    SET 
        role = 'admin',
        is_admin = true,
        setup_completed = true,
        updated_at = now()
    WHERE id = new_user_id;
    
    RAISE NOTICE 'Admin user created with ID: %', new_user_id;
END $$;

-- Verify the user was created
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.role,
    p.is_admin,
    p.username
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'w3bsuki@gmail.com';