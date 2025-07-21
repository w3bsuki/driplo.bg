# Supabase Connection Pooling Configuration

## Overview
This document outlines the connection pooling configuration for the Driplo project using Supavisor.

## Connection Strings

### 1. Transaction Mode (Recommended for Serverless)
- **Port**: 6543
- **Use Case**: Edge functions, Vercel, serverless environments
- **Connection String Format**:
```
postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 2. Session Mode
- **Port**: 5432
- **Use Case**: Long-running connections, prepared statements
- **Connection String Format**:
```
postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### 3. Direct Connection (IPv6 Only)
- **Port**: 5432
- **Use Case**: Persistent servers with IPv6 support
- **Connection String Format**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## Environment Configuration

### For SvelteKit (Serverless/Edge)
Update your `.env` file:
```bash
# Use transaction mode for serverless
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

### Connection Pool Settings
- **Recommended Pool Size**: 15-20 connections
- **Max Connections**: Keep ≤40% of total database connections
- **Idle Timeout**: 900 seconds (15 minutes)

## Implementation in Code

### Server-Side Client
```javascript
// src/lib/server/db.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        'x-connection-mode': 'transaction'
      }
    }
  }
)
```

### Monitoring Connections
Use this query to monitor active connections:
```sql
SELECT 
  usename as role,
  application_name,
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY usename, application_name, state
ORDER BY connection_count DESC;
```

## Best Practices

1. **Use Transaction Mode** for all serverless deployments
2. **Close Connections** properly in server-side code
3. **Monitor Pool Usage** regularly using the query above
4. **Set Appropriate Timeouts** to prevent connection leaks
5. **Use Connection Pooling** for all production workloads

## Troubleshooting

### High Connection Count
If you see high connection counts:
1. Check for connection leaks in your code
2. Ensure proper connection cleanup
3. Consider increasing pool size (max 40% of total)

### Connection Timeouts
If experiencing timeouts:
1. Check network latency
2. Verify correct connection string
3. Ensure proper pool configuration

### Performance Issues
1. Monitor query performance with pg_stat_statements
2. Check index usage
3. Verify RLS policies are optimized