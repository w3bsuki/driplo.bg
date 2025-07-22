# CLAUDE.md - Driplo Development Rules

**Project**: Threadly Marketplace | **Stack**: SvelteKit 2.0, Supabase, Tailwind  
**PM**: pnpm ONLY | **Priority**: Stripe payment integration

## 🧠 CORE WORKFLOW: ANALYZE → PLAN → EXECUTE → VERIFY → ITERATE

### 1. ANALYZE (30% of time) - Read First, Code Never
- **ALWAYS** read existing code before changes
- Check if component exists: `dir src\lib\components -Recurse -Filter "*Name*"`
- Review migrations: `dir supabase\migrations`
- Verify imports exist in package.json before using
- Look for patterns in similar files

### 2. PLAN (20% of time) - Think Before Acting
- Use TodoWrite for complex tasks
- Break into testable steps
- Write approach in comments first
- Consider edge cases and mobile

### 3. EXECUTE (30% of time) - No Hallucination, No Duplication
- **NEVER** invent functions or APIs
- **ALWAYS** verify imports exist
- **CHECK** if component already exists (85+ components!)
- **USE** $lib imports only
- **TEST** code actually runs

### 4. VERIFY (15% of time) - Real Testing Only
```powershell
pnpm run check     # TypeScript must pass
pnpm run lint      # No errors allowed
pnpm test          # Real tests, no mocks
```
- Test on mobile viewport
- Verify error states work
- Check loading states display
- Ensure RLS policies apply

### 5. ITERATE (5% of time) - Clean Up
- Remove unused imports
- Delete commented code
- Update types in app.d.ts
- Consider performance

## ❌ CRITICAL ANTI-PATTERNS (AI Mistakes You WILL Make)

### 🚫 Hallucination Prevention
| You'll Try To... | Reality Check |
|-----------------|---------------|
| Import non-existent packages | Check package.json FIRST |
| Use OptimizedImage component | It's deleted. Use Image.svelte |
| Create new base components | 85+ exist in /components/ui/ |
| Assume API exists | Verify in /routes/api/ |
| Claim "it works" without testing | Run the code or admit you didn't |

### 🚫 No Mock Testing
```typescript
// ❌ WRONG - Mock testing
const mockSupabase = jest.fn()

// ✅ CORRECT - Real testing
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

### 🚫 No Lying About Verification
- If you didn't run `pnpm test` → Say "Tests need to be run"
- If you didn't check mobile → Say "Mobile needs testing"
- If TypeScript has errors → Show the actual errors
- If unsure it works → Say "This needs verification"

## 📁 PROJECT TRUTH (Not What You Think, What Actually Exists)
```
K:\driplo-blue-main\
├── src\
│   ├── lib\
│   │   ├── components\     # CHECK HERE FIRST
│   │   │   ├── ui\         # Image, Button, Card (USE THESE)
│   │   │   ├── listings\   # ListingCard, ListingGrid
│   │   │   └── layout\     # Header, Footer
│   │   └── utils\          # formatCurrency, debounce (REUSE)
│   └── routes\
│       ├── (app)\          # +page.server.ts pattern
│       └── (auth)\         # login, register
└── supabase\
    └── migrations\         # 20+ migrations (READ FIRST)
```

## ✅ COPY-PASTE PATTERNS (Stop Inventing)

### Data Loading (ALWAYS Server-Side)
```typescript
// +page.server.ts
export const load = async ({ locals: { supabase } }) => {
  const { data, error } = await supabase.from('listings').select()
  if (error) throw error
  return { listings: data ?? [] }
}
```

### Component Structure (ALWAYS All States)
```svelte
<script lang="ts">
  let { data }: { data: PageData } = $props()
</script>

{#if loading}
  <div class="animate-pulse">Loading...</div>
{:else if error}
  <Alert variant="destructive">{error.message}</Alert>
{:else if !data?.length}
  <Empty message="No items found" />
{:else}
  <!-- content -->
{/if}
```

### Imports (ALWAYS $lib)
```typescript
✅ import Image from '$lib/components/ui/Image.svelte'
✅ import { formatCurrency } from '$lib/utils/format'
❌ import Image from '../../../components/ui/Image.svelte'
❌ import Image from './Image.svelte'
```

## 🛑 BEFORE YOU CLAIM "DONE"
1. **TypeScript passes?** `pnpm run check`
2. **Actually tested?** Show the command you ran
3. **Mobile checked?** Describe what you tested
4. **Errors handled?** Point to the error handling code
5. **Loading states?** Show where they are

## 💀 WHEN YOU'RE ABOUT TO LIE
- "It should work" → Run it and prove it
- "I've added error handling" → Show the exact lines
- "It's responsive" → Test at 375px width
- "The component is optimized" → Show performance metrics
- "Tests are passing" → Show the test output

*If you're about to create something new, you're wrong. It already exists.*  
*If you think it works, you haven't tested it.*  
*If you're confident, you're about to hallucinate.*