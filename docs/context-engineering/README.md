# Driplo Context Engineering Documentation

This directory contains comprehensive documentation about patterns, anti-patterns, and best practices for the Driplo project.

## Contents

### 📚 [Component Patterns](./component-patterns.md)
Best practices and recommended patterns for building components in Driplo:
- Component structure templates
- Data loading patterns (SSR vs CSR)
- Form handling with validation
- Image optimization patterns
- List and pagination patterns
- Modal/dialog accessibility
- Store factory patterns
- Error handling strategies
- Performance optimizations

### 🚫 [Anti-Patterns](./anti-patterns.md)
Common mistakes to avoid in the Driplo codebase:
- Duplicate component implementations
- Import path inconsistencies
- Client-side data fetching in SSR
- Prop drilling issues
- Missing RLS policies
- N+1 query problems
- Security vulnerabilities
- Performance bottlenecks

## Quick Reference

### Component Creation Checklist
When creating a new component:
- [ ] Use TypeScript for props
- [ ] Handle loading and error states
- [ ] Ensure mobile responsiveness
- [ ] Add accessibility attributes
- [ ] Support keyboard navigation
- [ ] Implement proper cleanup
- [ ] Follow naming conventions
- [ ] Add documentation
- [ ] Write tests

### Common Imports
```typescript
// Always use $lib imports
import { Component } from '$lib/components/ui/Component.svelte'
import type { User } from '$lib/types'
import { formatPrice } from '$lib/utils/format'
import { supabase } from '$lib/supabase-client'
```

### Database Conventions
- Use `snake_case` for column names
- Always enable RLS on tables
- Add proper indexes for queries
- Test migrations on branch database
- Verify rollback capability

### Performance Tips
1. Use server-side data loading when possible
2. Implement lazy loading for images
3. Virtualize long lists
4. Debounce search inputs
5. Optimize bundle size

## Integration with Claude Commands

Use these Claude commands to enforce patterns:

- `/analyze` - Check if code follows patterns
- `/verify` - Ensure changes work correctly
- `/duplicate-check` - Find redundant code

## Examples from Driplo

### ✅ Good Pattern: Server-Side Loading
```typescript
// src/routes/(app)/listings/+page.server.ts
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: listings } = await supabase
    .from('listings')
    .select('*, user:users(*), images:listing_images(*)')
    .order('created_at', { ascending: false })
    
  return { listings }
}
```

### ❌ Anti-Pattern: Multiple Image Components
```
// Found in codebase - needs consolidation
- src/lib/components/common/OptimizedImage.svelte
- src/lib/components/ui/ResponsiveImage.svelte
- src/lib/components/ui/Image.svelte
```

### ✅ Good Pattern: Unified Image Component
```svelte
<!-- Single Image component with all features -->
<Image 
  src={imageUrl}
  alt={description}
  width={400}
  height={300}
  loading="lazy"
  responsive={true}
/>
```

## Contributing

When you discover new patterns or anti-patterns:

1. Document them in the appropriate file
2. Include real examples from the codebase
3. Provide clear solutions
4. Update relevant Claude commands
5. Share with the team

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/best-practices)
- [Tailwind CSS Guidelines](https://tailwindcss.com/docs)
- [Web Accessibility Standards](https://www.w3.org/WAI/WCAG21/quickref/)