# PowerShell script to set up Supabase MCP globally for Claude Code

$configPath = "$env:USERPROFILE\.claude\claude_desktop_config.json"
$configDir = "$env:USERPROFILE\.claude"

Write-Host "📁 Setting up Supabase MCP for Claude Code..." -ForegroundColor Cyan

# Create directory if it doesn't exist
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "✅ Created Claude config directory" -ForegroundColor Green
}

# Read existing config or create new one
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath | ConvertFrom-Json
        Write-Host "✅ Found existing Claude configuration" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error reading config: $_" -ForegroundColor Red
        $config = @{}
    }
} else {
    Write-Host "📝 Creating new Claude configuration" -ForegroundColor Yellow
    $config = @{}
}

# Ensure mcpServers property exists
if (-not $config.PSObject.Properties['mcpServers']) {
    $config | Add-Member -MemberType NoteProperty -Name 'mcpServers' -Value @{} -Force
}

# Create Supabase MCP configuration
$supabaseMcp = @{
    type = "stdio"
    command = "npx"
    args = @(
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=guqjihzgnnzdsyxntnvd"
    )
    env = @{
        SUPABASE_ACCESS_TOKEN = "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
    }
}

# Add Supabase to mcpServers
$config.mcpServers | Add-Member -MemberType NoteProperty -Name 'supabase' -Value $supabaseMcp -Force

# Save the configuration
try {
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
    Write-Host "✅ Successfully updated Claude configuration with Supabase MCP" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Go to https://supabase.com/dashboard/account/tokens" -ForegroundColor White
    Write-Host "2. Generate a new access token" -ForegroundColor White
    Write-Host "3. Replace 'YOUR_SUPABASE_ACCESS_TOKEN_HERE' in the config file with your actual token" -ForegroundColor White
    Write-Host "4. Config file location: $configPath" -ForegroundColor White
    Write-Host "5. Restart Claude Code for changes to take effect" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Your Supabase Project Details:" -ForegroundColor Cyan
    Write-Host "   - Project Ref: guqjihzgnnzdsyxntnvd" -ForegroundColor White
    Write-Host "   - Project URL: https://guqjihzgnnzdsyxntnvd.supabase.co" -ForegroundColor White
} catch {
    Write-Host "❌ Error writing config: $_" -ForegroundColor Red
    exit 1
}