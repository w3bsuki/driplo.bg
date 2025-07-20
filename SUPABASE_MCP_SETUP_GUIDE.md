# Supabase MCP Global Setup Guide

## Summary

I've successfully set up the Supabase MCP configuration globally for your Claude Code CLI. The configuration file has been created at:
`C:\Users\radev\.claude\claude_desktop_config.json`

## Current Configuration Status

### ✅ What's Been Done:
1. Created the Claude configuration directory at `C:\Users\radev\.claude\`
2. Generated the MCP configuration file with your Supabase project details
3. Configured it with your project reference: `guqjihzgnnzdsyxntnvd`

### ❌ What You Need to Do:
You need to generate a Supabase Access Token (different from your service role key).

## Steps to Complete Setup

### 1. Generate Supabase Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a descriptive name (e.g., "Claude MCP Access")
4. Copy the generated token

### 2. Update the Configuration
1. Open: `C:\Users\radev\.claude\claude_desktop_config.json`
2. Replace `YOUR_SUPABASE_ACCESS_TOKEN_HERE` with your actual token
3. Save the file

### 3. Restart Claude Code
Close and restart Claude Code for the changes to take effect.

## Your Project Details

- **Project Reference**: `guqjihzgnnzdsyxntnvd`
- **Project URL**: `https://guqjihzgnnzdsyxntnvd.supabase.co`
- **Anon Key**: (Found in your .env file)
- **Service Role Key**: (Found in your .env file - DO NOT use this for MCP)

## Alternative Setup Methods

### Using PowerShell (Windows):
```powershell
.\setup_supabase_mcp_global.ps1
```

### Using Python:
```bash
python setup_supabase_mcp_global.py
```

## Verification

After restarting Claude Code, you should be able to use Supabase MCP commands. The MCP server will provide tools for:
- Database operations
- Storage management
- Auth management
- Realtime subscriptions

## Troubleshooting

### If MCP doesn't work after setup:
1. Verify the token is correct (not the service role key)
2. Check that Claude Code was fully restarted
3. Look for errors in Claude Code logs
4. Ensure npx is available in your PATH

### Common Issues:
- **Wrong Token Type**: Make sure you're using an Access Token from the Supabase dashboard, not the service role key from your project
- **Path Issues**: On Windows, ensure Node.js and npm are properly installed and in your PATH

## Important Note

The access token in the MCP configuration is different from your project's service role key. The service role key (which you have in your .env file) is used for server-side operations in your application, while the access token is specifically for the MCP server to interact with Supabase's management API.