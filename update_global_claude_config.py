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

# Add the Supabase MCP server to global mcpServers
supabase_config = {
    "supabase": {
        "type": "stdio",
        "command": "npx",
        "args": [
            "@supabase/mcp-server-supabase@latest"
        ],
        "env": {}
    }
}

# Update the global mcpServers
if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers'].update(supabase_config)

# Remove the project-specific configuration if it exists
project_key = "/home/w3bsuki/driplo1/driplo"
if project_key in config.get('projects', {}) and 'mcpServers' in config['projects'][project_key]:
    if 'supabase' in config['projects'][project_key]['mcpServers']:
        del config['projects'][project_key]['mcpServers']['supabase']
        print("🧹 Removed project-specific Supabase MCP configuration")

# Write the updated configuration
try:
    with open('/home/w3bsuki/.claude.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("✅ Successfully added Supabase MCP server to global Claude configuration")
    print("🔄 Please restart Claude Code for the changes to take effect")
    print("\n📝 To use it, you'll need to provide:")
    print("   - Project Reference: Use --project-ref=<your-project-ref>")
    print("   - Access Token: Set SUPABASE_ACCESS_TOKEN environment variable")
except Exception as e:
    print(f"Error writing config: {e}")
    sys.exit(1)