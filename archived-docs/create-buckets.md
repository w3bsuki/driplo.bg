# Storage Buckets Setup

You need to create these storage buckets in your Supabase Dashboard:

## Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `Threadly`
3. Go to **Storage** in the sidebar

## Step 2: Create Buckets
Create these 3 buckets:

### 1. `listings` bucket
- Name: `listings`
- Public: ✅ Yes
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`

### 2. `avatars` bucket  
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`

### 3. `covers` bucket
- Name: `covers` 
- Public: ✅ Yes
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`

## Step 3: Set Policies
For each bucket, add these policies:

### Upload Policy (for all buckets)
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### View Policy (for all buckets)
```sql
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (true);
```

Once you create these buckets, the image upload will work properly!