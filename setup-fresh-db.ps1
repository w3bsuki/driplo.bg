# PowerShell script to set up fresh Supabase database
Write-Host "Setting up fresh Supabase database..." -ForegroundColor Green

# Clean old connection
Write-Host "Cleaning old connection..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .supabase -ErrorAction SilentlyContinue

# Initialize Supabase
Write-Host "Initializing Supabase..." -ForegroundColor Yellow
supabase init

# Link to new project
Write-Host "Linking to new project..." -ForegroundColor Yellow
supabase link --project-ref gtjehycjflerogenwrcw --password "941015tyJa7!"

# Push the migration
Write-Host "Pushing optimized migration..." -ForegroundColor Yellow
supabase db push

Write-Host "Done! Your fresh database is ready." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update Vercel environment variables"
Write-Host "2. Test with: pnpm run dev"