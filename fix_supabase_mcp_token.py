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

# Update the Supabase MCP server configuration with the access token
config['mcpServers']['supabase'] = {
    "type": "stdio",
    "command": "npx",
    "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=guqjihzgnnzdsyxntnvd"
    ],
    "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_0baf9973f3bd5ce040ca895d90c7d88ff94ebd5c"
    }
}

# Write the updated configuration
try:
    with open('/home/w3bsuki/.claude.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("✅ Updated Supabase MCP server with your access token")
    print("🔄 Please restart Claude Code for the changes to take effect")
    print("\n🚀 Once restarted, I'll have direct access to your Supabase database!")
except Exception as e:
    print(f"Error writing config: {e}")
    sys.exit(1)