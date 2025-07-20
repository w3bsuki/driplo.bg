# PROMPT FOR CLAUDE CODE

Copy and paste this ENTIRE message to Claude Code:

---

Execute the Supabase migration guide located at: `SUPABASE_MIGRATION_GUIDE_CLAUDE_CODE.md`

## SUPABASE CREDENTIALS:

```
Project URL: https://cadczfmshtseuejkfpiz.supabase.co
Project Ref: cadczfmshtseuejkfpiz
Database Password: 941015tyJa7!
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGN6Zm1zaHRzZXVlamtmcGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzM0ODUsImV4cCI6MjA2ODYwOTQ4NX0.-TsjE-W9aAygN7cNWm96B0d9xthXPaMUp7zNgKzTSrM
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGN6Zm1zaHRzZXVlamtmcGl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAzMzQ4NSwiZXhwIjoyMDY4NjA5NDg1fQ.wK01AG9gD1MizgBo3uq8MIy9kGdfEggtiyUZnq2wmo8
MCP Access Token: sbp_e4e00c804f70f8bf4f08225ec68d5b83fb8309ec
```

## VERIFY MCP CONFIGURATION:

1. Check `.mcp.json` has correct project-ref: `cadczfmshtseuejkfpiz`
2. Ensure NO `--read-only` flag is present
3. Confirm access token matches above

## YOUR INSTRUCTIONS:

1. **READ** the entire migration guide first
2. **CREATE** a TodoWrite list with all 17 phases to track your progress
3. **EXECUTE** each phase in order using `mcp__supabase__apply_migration`
4. **VERIFY** each phase using the verification SQL queries provided
5. **STOP** immediately if any error occurs and report it

## EXECUTION REQUIREMENTS:

- Use Supabase MCP tools (NOT manual SQL files)
- Execute phases 1-17 in EXACT order
- Run ALL verification queries after each phase
- Mark todos complete as you progress
- Report any errors with full details

## TOOLS TO USE:

```
mcp__supabase__apply_migration - For running migrations
mcp__supabase__execute_sql - For verification queries
mcp__supabase__get_advisors - For final security check
```

## EXPECTED OUTCOME:

Complete all 17 phases:
1. Extensions and Base Setup
2. Custom Types (Enums)
3. Core User Tables
4. Onboarding and Brand Tables
5. Product and Listing Tables
6. Shopping and Order Tables
7. Payment Tables
8. Communication Tables
9. Shipping and Returns Tables
10. Marketing Tables
11. Monitoring Tables
12. Database Functions
13. Triggers
14. Row Level Security Policies
15. Storage Buckets
16. Initial Data
17. Security Advisors Check

## FINAL REPORT FORMAT:

```
MIGRATION COMPLETE
- Total Phases: 17/17 ✓
- Tables Created: [count]
- Functions Created: [count]
- Policies Created: [count]
- Errors: [none/list]
- Security Status: [PASS/FAIL]
```

Start NOW with Phase 1 from the migration guide.