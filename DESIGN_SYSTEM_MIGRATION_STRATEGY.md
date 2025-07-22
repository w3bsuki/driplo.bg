# Driplo Design System Migration Strategy

## Overview
This document outlines a safe, incremental migration path from the current component system to the new design system without breaking existing functionality.

## Migration Principles

1. **Zero Breaking Changes**: Existing components continue to work exactly as before
2. **Opt-in Enhancement**: New features are opt-in until fully tested
3. **Gradual Adoption**: Teams can migrate at their own pace
4. **Backwards Compatible**: Old and new systems can coexist indefinitely
5. **Automated Where Possible**: Provide tools to automate migration

## Phase 1: Foundation Layer (Week 1-2)
**Goal**: Establish design system infrastructure without touching existing code

### 1.1 Create Design System Structure
```bash
src/lib/design-system/
├── tokens/
├── themes/
├── foundations/
├── primitives/
├── components/
├── patterns/
├── utilities/
├── hooks/
└── index.ts
```

### 1.2 Token System Implementation
```typescript
// src/lib/design-system/tokens/colors.ts
export const colors = {
  // New token structure
  primary: {
    50: 'hsl(197, 71%, 95%)',
    100: 'hsl(197, 71%, 90%)',
    // ...
    500: 'hsl(197, 71%, 73%)', // Maps to existing --primary
    DEFAULT: 'hsl(197, 71%, 73%)',
    foreground: 'hsl(0, 0%, 0%)',
  },
  // Maintain compatibility
  get babyBlue() { return this.primary; }, // Alias for migration
};

// CSS variable mapping
export function mapTokensToCSS(tokens) {
  return {
    '--ds-color-primary-500': tokens.primary[500],
    '--primary': tokens.primary[500], // Keep existing variable
  };
}
```

### 1.3 Theme Provider with Backwards Compatibility
```svelte
<!-- src/lib/design-system/foundations/ThemeProvider.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { injectThemeVariables } from '../utilities/theme';
  
  export let theme = 'default';
  export let enableNewSystem = false;
  
  onMount(() => {
    if (enableNewSystem) {
      // Inject new design system variables
      injectThemeVariables(theme);
    }
    // Existing theme system continues to work
  });
</script>

<div class="ds-theme-provider" data-theme={theme}>
  <slot />
</div>

<style>
  /* New variables scoped to ds-theme-provider */
  .ds-theme-provider {
    /* New design system variables */
  }
  
  /* Global scope maintains existing variables */
  :global(:root) {
    /* Existing variables unchanged */
  }
</style>
```

## Phase 2: Component Enhancement (Week 3-4)
**Goal**: Create enhanced versions of components using the design system

### 2.1 Wrapper Pattern for Existing Components
```typescript
// src/lib/design-system/components/Button/Button.svelte
<script lang="ts">
  import { Button as LegacyButton } from '$lib/components/ui/button.svelte';
  import { buttonStyles } from './Button.styles';
  import { useDesignSystem } from '../../hooks/use-design-system';
  
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let legacy = false;
  
  const { isEnabled } = useDesignSystem();
  
  // Use legacy component if design system not enabled or legacy flag set
  $: useLegacy = legacy || !$isEnabled;
</script>

{#if useLegacy}
  <LegacyButton {...$$props}>
    <slot />
  </LegacyButton>
{:else}
  <button
    class={buttonStyles({ variant, size })}
    {...$$restProps}
  >
    <slot />
  </button>
{/if}
```

### 2.2 Adapter Pattern for Complex Components
```typescript
// src/lib/design-system/adapters/CardAdapter.ts
import * as LegacyCard from '$lib/components/ui/card';
import * as DSCard from '../components/Card';

export function createCardAdapter(useDesignSystem: boolean) {
  if (!useDesignSystem) {
    return LegacyCard;
  }
  
  // Map new API to legacy API
  return {
    Card: DSCard.Root,
    CardHeader: DSCard.Header,
    CardTitle: DSCard.Title,
    CardDescription: DSCard.Description,
    CardContent: DSCard.Content,
    CardFooter: DSCard.Footer,
  };
}
```

### 2.3 Progressive Enhancement Example
```svelte
<!-- Before: Existing ListingCard -->
<script>
  import { Card } from '$lib/components/ui/card';
</script>

<Card>
  <img src={listing.image} alt={listing.title} />
  <h3>{listing.title}</h3>
  <p>{listing.price}</p>
</Card>

<!-- After: Enhanced with design system -->
<script>
  import { Card } from '$lib/design-system/components';
  import { Image } from '$lib/design-system/primitives';
</script>

<Card.Root>
  <Card.Media>
    <Image 
      src={listing.image} 
      alt={listing.title}
      loading="lazy"
      aspectRatio="4:3"
    />
  </Card.Media>
  <Card.Content>
    <Card.Title>{listing.title}</Card.Title>
    <Card.Price>{listing.price}</Card.Price>
  </Card.Content>
</Card.Root>
```

## Phase 3: Migration Tools (Week 5-6)
**Goal**: Provide automated tools and guides for migration

### 3.1 Component Migration Map
```typescript
// src/lib/design-system/migration/component-map.ts
export const componentMigrationMap = {
  'button.svelte': {
    to: '@design-system/components/Button',
    transforms: [
      { from: 'type="button"', to: 'variant="primary"' },
      { from: 'type="submit"', to: 'variant="primary" type="submit"' },
      { from: 'disabled', to: 'disabled' }, // No change
    ],
  },
  'Input.svelte': {
    to: '@design-system/components/Input',
    transforms: [
      { from: 'error', to: 'state="error"' },
      { from: 'placeholder', to: 'placeholder' }, // No change
    ],
  },
};
```

### 3.2 Codemod for Automated Migration
```javascript
// scripts/migrate-to-design-system.js
const { transform } = require('@sveltejs/kit');

function migrateComponent(source, componentName) {
  const migration = componentMigrationMap[componentName];
  if (!migration) return source;
  
  let transformed = source;
  
  // Update imports
  transformed = transformed.replace(
    `from '$lib/components/ui/${componentName}'`,
    `from '${migration.to}'`
  );
  
  // Apply prop transforms
  migration.transforms.forEach(({ from, to }) => {
    transformed = transformed.replace(
      new RegExp(from, 'g'),
      to
    );
  });
  
  return transformed;
}
```

### 3.3 Migration Checklist Component
```markdown
# Component Migration Checklist

## Button Component
- [ ] Update import from `$lib/components/ui/button.svelte` to `$lib/design-system/components/Button`
- [ ] Change `type="button"` to `variant="primary"`
- [ ] Change `type="secondary"` to `variant="secondary"`
- [ ] Add size prop: `size="md"` (default)
- [ ] Test all interactive states
- [ ] Verify accessibility

## Card Component
- [ ] Update to compound component pattern
- [ ] Change `<Card>` to `<Card.Root>`
- [ ] Wrap header content in `<Card.Header>`
- [ ] Move title to `<Card.Title>`
- [ ] Test responsive behavior
```

## Phase 4: Feature Migration (Week 7-8)
**Goal**: Migrate feature components to use the design system

### 4.1 Migration Priority
1. **High Traffic Pages**: Home, Browse, Product Detail
2. **High Impact Components**: ListingCard, Header, Navigation
3. **New Features**: Use design system from the start
4. **Low Priority**: Admin pages, rarely used features

### 4.2 Feature Flag Strategy
```typescript
// src/lib/design-system/config/feature-flags.ts
export const designSystemFlags = {
  // Global flag
  enableDesignSystem: false,
  
  // Component-level flags
  components: {
    button: true,
    card: false,
    input: false,
    select: false,
  },
  
  // Page-level flags
  pages: {
    home: false,
    browse: false,
    profile: false,
  },
};
```

### 4.3 A/B Testing Support
```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import { ThemeProvider } from '$lib/design-system/foundations';
  import { getExperimentVariant } from '$lib/utils/experiments';
  
  $: enableDS = getExperimentVariant('design-system-rollout', $page.data.user);
</script>

<ThemeProvider enableNewSystem={enableDS === 'enabled'}>
  <slot />
</ThemeProvider>
```

## Migration Timeline

### Month 1: Foundation
- Week 1-2: Set up design system structure and tokens
- Week 3-4: Create enhanced components with backwards compatibility

### Month 2: Tools & Testing
- Week 5-6: Build migration tools and documentation
- Week 7-8: Migrate high-priority features with feature flags

### Month 3: Rollout
- Week 9-10: Gradual rollout with A/B testing
- Week 11-12: Complete migration of remaining components

### Month 4: Cleanup
- Remove feature flags for stable components
- Deprecate legacy components
- Update documentation

## Risk Mitigation

### 1. Performance Risks
- **Risk**: Increased bundle size during migration
- **Mitigation**: 
  - Lazy load design system components
  - Tree-shake unused legacy components
  - Monitor bundle size metrics

### 2. Visual Regression
- **Risk**: Unintended visual changes
- **Mitigation**:
  - Visual regression testing with Percy/Chromatic
  - Side-by-side component comparison tool
  - Gradual rollout with monitoring

### 3. Developer Confusion
- **Risk**: Two systems causing confusion
- **Mitigation**:
  - Clear documentation on which to use
  - ESLint rules to enforce consistency
  - Regular team training sessions

## Success Metrics

### Technical Metrics
- Bundle size impact < 10%
- Performance scores maintained or improved
- Zero breaking changes reported
- 100% component test coverage

### Adoption Metrics
- 50% of components migrated in 2 months
- 90% of new features use design system
- Developer satisfaction score > 4/5
- Reduced time to implement new features

## Rollback Strategy

### Component Level
```typescript
// Quick rollback by changing feature flag
designSystemFlags.components.button = false;
```

### Page Level
```typescript
// Rollback entire pages
designSystemFlags.pages.home = false;
```

### Global Level
```typescript
// Emergency rollback
designSystemFlags.enableDesignSystem = false;
```

## Communication Plan

### 1. Team Training
- Initial design system workshop
- Weekly migration office hours
- Component-specific deep dives
- Best practices documentation

### 2. Progress Tracking
- Weekly migration status updates
- Component migration dashboard
- Blocker identification and resolution
- Success story sharing

### 3. Feedback Loop
- Developer survey after each phase
- Component usability testing
- Performance monitoring
- Regular retrospectives

This migration strategy ensures a smooth transition to the modern design system while maintaining stability and developer confidence throughout the process.