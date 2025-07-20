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

# Find the driplo project
project_key = "/home/w3bsuki/driplo1/driplo"
if project_key not in config['projects']:
    print(f"Project {project_key} not found in configuration")
    sys.exit(1)

# Add the Supabase MCP server
supabase_config = {
    "supabase": {
        "type": "stdio",
        "command": "npx",
        "args": [
            "@supabase/mcp-server-supabase@latest",
            "--project-ref=guqjihzgnnzdsyxntnvd"
        ],
        "env": {
            "SUPABASE_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWppaHpnbm56ZHN5eG50bnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ0MDQzMSwiZXhwIjoyMDY4MDE2NDMxfQ.AkkerUY1tU4sv3hmKpvEtCY0rwrq8vnX-G61hzXKd-8"
        }
    }
}

# Update the mcpServers for the project
if 'mcpServers' not in config['projects'][project_key]:
    config['projects'][project_key]['mcpServers'] = {}

config['projects'][project_key]['mcpServers'].update(supabase_config)

# Write the updated configuration
try:
    with open('/home/w3bsuki/.claude.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("✅ Successfully added Supabase MCP server to Claude configuration")
    print("🔄 Please restart Claude Code for the changes to take effect")
except Exception as e:
    print(f"Error writing config: {e}")
    sys.exit(1)