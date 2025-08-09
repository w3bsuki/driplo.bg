#!/bin/bash
# Bash script to set up fresh Supabase database
echo "Setting up fresh Supabase database..."

# Clean old connection
echo "Cleaning old connection..."
rm -rf .supabase

# Initialize Supabase
echo "Initializing Supabase..."
supabase init

# Link to new project
echo "Linking to new project..."
supabase link --project-ref gtjehycjflerogenwrcw --password "941015tyJa7!"

# Push the migration
echo "Pushing optimized migration..."
supabase db push

echo "Done! Your fresh database is ready."
echo "Next steps:"
echo "1. Update Vercel environment variables"
echo "2. Test with: pnpm run dev"