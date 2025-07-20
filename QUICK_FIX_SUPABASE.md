# QUICK FIX - Push Migrations to Supabase

## Option 1: Use Supabase CLI (Recommended)
1. Get your database password from: https://supabase.com/dashboard/project/guqjihzgnnzdsyxntnvd/settings/database
2. Run: `npx supabase db push`
3. Enter your password when prompted
4. Done! All 3 migrations will be applied

## Option 2: Use Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/guqjihzgnnzdsyxntnvd/sql/new
2. Copy and run each migration file in order:
   - `supabase/migrations/20250720170310_profile_setup_and_brand_verification.sql`
   - `supabase/migrations/20250720170510_admin_roles_setup.sql`
   - `supabase/migrations/20250720170540_make_w3bsuki_admin.sql`

## Option 3: Set Environment Variable
1. Create `.env.local` file
2. Add: `SUPABASE_DB_PASSWORD=your_password_here`
3. Run: `npx supabase db push`

The migrations are ready in your `supabase/migrations` folder. The MCP tool can't push them because it's in read-only mode - you need to authenticate with your database password.