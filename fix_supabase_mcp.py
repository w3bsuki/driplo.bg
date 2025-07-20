#!/usr/bin/env python3
import json
import sys

# Read the configuration file
try:
    with open('/home/w3bsuki/.claude.json', 'r') as f:
        config = json.load(f)
except Exception as e:
    print(f"Error reading config: {e}")
    sys.exit(1)

# Update the Supabase MCP server configuration with proper details
config['mcpServers']['supabase'] = {
    "type": "stdio",
    "command": "npx",
    "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=guqjihzgnnzdsyxntnvd"
    ],
    "env": {
        "SUPABASE_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWppaHpnbm56ZHN5eG50bnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ0MDQzMSwiZXhwIjoyMDY4MDE2NDMxfQ.AkkerUY1tU4sv3hmKpvEtCY0rwrq8vnX-G61hzXKd-8"
    }
}

# Write the updated configuration
try:
    with open('/home/w3bsuki/.claude.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("✅ Fixed Supabase MCP server configuration with project details")
    print("🔄 Please restart Claude Code for the changes to take effect")
except Exception as e:
    print(f"Error writing config: {e}")
    sys.exit(1)