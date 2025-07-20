#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import sys
from pathlib import Path

# Set UTF-8 encoding for Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def get_claude_config_path():
    """Get the Claude configuration file path based on the OS"""
    if sys.platform == "win32":
        # Windows path
        config_path = Path(os.environ['USERPROFILE']) / '.claude' / 'claude_desktop_config.json'
    else:
        # Unix-like systems
        config_path = Path.home() / '.claude' / 'claude_desktop_config.json'
    
    return config_path

def main():
    config_path = get_claude_config_path()
    
    print(f"📁 Looking for Claude config at: {config_path}")
    
    # Ensure the directory exists
    config_path.parent.mkdir(exist_ok=True)
    
    # Read existing config or create new one
    if config_path.exists():
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            print("✅ Found existing Claude configuration")
        except Exception as e:
            print(f"❌ Error reading config: {e}")
            config = {}
    else:
        print("📝 Creating new Claude configuration")
        config = {}
    
    # Ensure mcpServers section exists
    if 'mcpServers' not in config:
        config['mcpServers'] = {}
    
    # Add Supabase MCP server configuration
    supabase_mcp_config = {
        "type": "stdio",
        "command": "npx",
        "args": [
            "-y",
            "@supabase/mcp-server-supabase@latest",
            "--project-ref=guqjihzgnnzdsyxntnvd"
        ],
        "env": {
            # IMPORTANT: You need to replace this with your actual Supabase Access Token
            # Get it from: https://supabase.com/dashboard/account/tokens
            "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
        }
    }
    
    # Update the configuration
    config['mcpServers']['supabase'] = supabase_mcp_config
    
    # Write the updated configuration
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        print("✅ Successfully updated Claude configuration with Supabase MCP")
        print("\n⚠️  IMPORTANT NEXT STEPS:")
        print("1. Go to https://supabase.com/dashboard/account/tokens")
        print("2. Generate a new access token")
        print("3. Replace 'YOUR_SUPABASE_ACCESS_TOKEN_HERE' in the config file with your actual token")
        print(f"4. Config file location: {config_path}")
        print("5. Restart Claude Code for changes to take effect")
        print("\n📋 Your Supabase Project Details:")
        print(f"   - Project Ref: guqjihzgnnzdsyxntnvd")
        print(f"   - Project URL: https://guqjihzgnnzdsyxntnvd.supabase.co")
    except Exception as e:
        print(f"❌ Error writing config: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()