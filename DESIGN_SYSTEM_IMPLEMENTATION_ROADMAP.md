# Driplo Design System Implementation Roadmap

## Executive Summary
This roadmap provides concrete, actionable steps to implement the modern design system with actual code examples and file structures.

## Week 1: Foundation Setup

### Day 1-2: Create Directory Structure
```bash
# Create design system directories
mkdir -p src/lib/design-system/{tokens,themes,foundations,primitives,components,patterns,utilities,hooks,docs}
```

### Day 3-4: Implement Token System

#### Color Tokens
```typescript
// src/lib/design-system/tokens/colors.ts
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
  DEFAULT: string;
  foreground: string;
}

// Map existing colors to new token structure
export const colors = {
  primary: {
    50: 'hsl(197, 71%, 95%)',
    100: 'hsl(197, 71%, 90%)',
    200: 'hsl(197, 71%, 85%)',
    300: 'hsl(197, 71%, 80%)',
    400: 'hsl(197, 71%, 76%)',
    500: 'hsl(197, 71%, 73%)', // Current primary (#87CEEB)
    600: 'hsl(197, 71%, 65%)', // Current dark mode primary
    700: 'hsl(197, 71%, 58%)',
    800: 'hsl(197, 71%, 48%)',
    900: 'hsl(197, 71%, 38%)',
    950: 'hsl(197, 71%, 23%)',
    DEFAULT: 'hsl(197, 71%, 73%)',
    foreground: 'hsl(0, 0%, 0%)',
  },
  secondary: {
    50: 'hsl(22, 22%, 95%)',
    100: 'hsl(22, 22%, 90%)',
    200: 'hsl(22, 22%, 80%)',
    300: 'hsl(22, 22%, 70%)',
    400: 'hsl(22, 22%, 60%)',
    500: 'hsl(22, 22%, 55%)', // Current secondary (#A47764)
    600: 'hsl(22, 22%, 45%)',
    700: 'hsl(22, 18%, 40%)', // Current dark mode secondary
    800: 'hsl(22, 18%, 30%)',
    900: 'hsl(22, 18%, 20%)',
    950: 'hsl(22, 18%, 10%)',
    DEFAULT: 'hsl(22, 22%, 55%)',
    foreground: 'hsl(0, 0%, 100%)',
  },
  // ... other color scales
} as const;

// Maintain backwards compatibility
export const legacyColorMap = {
  '--primary': colors.primary[500],
  '--primary-foreground': colors.primary.foreground,
  '--secondary': colors.secondary[500],
  '--secondary-foreground': colors.secondary.foreground,
  // ... map all existing variables
};
```

#### Typography Tokens
```typescript
// src/lib/design-system/tokens/typography.ts
export const typography = {
  fonts: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    display: 'system-ui, -apple-system, sans-serif',
  },
  
  sizes: {
    xs: { size: '0.75rem', lineHeight: '1rem', tracking: '0.025em' },
    sm: { size: '0.875rem', lineHeight: '1.25rem', tracking: '0.015em' },
    base: { size: '1rem', lineHeight: '1.5rem', tracking: '0' },
    lg: { size: '1.125rem', lineHeight: '1.75rem', tracking: '-0.015em' },
    xl: { size: '1.25rem', lineHeight: '1.75rem', tracking: '-0.02em' },
    '2xl': { size: '1.5rem', lineHeight: '2rem', tracking: '-0.025em' },
    '3xl': { size: '1.875rem', lineHeight: '2.25rem', tracking: '-0.03em' },
    '4xl': { size: '2.25rem', lineHeight: '2.5rem', tracking: '-0.035em' },
    '5xl': { size: '3rem', lineHeight: '1', tracking: '-0.04em' },
    '6xl': { size: '3.75rem', lineHeight: '1', tracking: '-0.045em' },
  },
  
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;
```

#### Spacing Tokens
```typescript
// src/lib/design-system/tokens/spacing.ts
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;
```

### Day 5: Create Theme Provider

```svelte
<!-- src/lib/design-system/foundations/ThemeProvider.svelte -->
<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { browser } from '$app/environment';
  import type { Theme, ThemeMode } from '../themes/theme.types';
  import { lightTheme, darkTheme } from '../themes';
  import { injectThemeVariables, cleanupThemeVariables } from '../utilities/theme';
  
  export let theme: Theme | undefined = undefined;
  export let mode: ThemeMode = 'system';
  export let enableLegacySupport = true;
  
  // Theme store
  const themeMode = writable<ThemeMode>(mode);
  const customTheme = writable<Theme | undefined>(theme);
  
  // Resolved theme based on mode
  const resolvedTheme = derived(
    [themeMode, customTheme],
    ([$mode, $custom]) => {
      if ($custom) return $custom;
      
      if ($mode === 'system' && browser) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? darkTheme : lightTheme;
      }
      
      return $mode === 'dark' ? darkTheme : lightTheme;
    }
  );
  
  // Context for child components
  setContext('design-system', {
    theme: resolvedTheme,
    mode: themeMode,
    setMode: (newMode: ThemeMode) => themeMode.set(newMode),
    setTheme: (newTheme: Theme) => customTheme.set(newTheme),
  });
  
  // Apply theme variables
  $: if (browser && $resolvedTheme) {
    injectThemeVariables($resolvedTheme, enableLegacySupport);
  }
  
  // Cleanup on unmount
  onMount(() => {
    return () => {
      if (browser) {
        cleanupThemeVariables();
      }
    };
  });
  
  // Watch for system theme changes
  onMount(() => {
    if (!browser || mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => themeMode.set('system');
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  });
</script>

<div 
  class="ds-root" 
  data-theme={$resolvedTheme.name}
  data-mode={$themeMode}
>
  <slot />
</div>

<style>
  .ds-root {
    /* Ensure full height */
    min-height: 100vh;
    
    /* Smooth theme transitions */
    transition: background-color 200ms ease-in-out,
                color 200ms ease-in-out;
  }
  
  /* Scoped design system variables */
  .ds-root {
    /* Colors */
    color: var(--ds-color-foreground);
    background-color: var(--ds-color-background);
  }
</style>
```

## Week 2: Core Utilities and Hooks

### Day 1-2: Theme Utilities

```typescript
// src/lib/design-system/utilities/theme.ts
import type { Theme } from '../themes/theme.types';
import { legacyColorMap } from '../tokens/colors';

export function injectThemeVariables(theme: Theme, enableLegacy = true) {
  const root = document.documentElement;
  
  // Clear existing design system variables
  clearDesignSystemVariables();
  
  // Inject color tokens
  Object.entries(theme.colors).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === 'object' && 'DEFAULT' in colorScale) {
      // Color scale (primary, secondary, etc.)
      Object.entries(colorScale).forEach(([shade, value]) => {
        if (shade !== 'foreground') {
          root.style.setProperty(`--ds-color-${colorName}-${shade}`, value);
        }
      });
      root.style.setProperty(`--ds-color-${colorName}`, colorScale.DEFAULT);
      root.style.setProperty(`--ds-color-${colorName}-foreground`, colorScale.foreground);
    } else if (typeof colorScale === 'object') {
      // Nested color objects (background, surface, etc.)
      Object.entries(colorScale).forEach(([key, value]) => {
        root.style.setProperty(`--ds-color-${colorName}-${key}`, value);
      });
    } else {
      // Single color value
      root.style.setProperty(`--ds-color-${colorName}`, colorScale);
    }
  });
  
  // Inject typography tokens
  Object.entries(theme.typography.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--ds-font-${key}`, value);
  });
  
  Object.entries(theme.typography.sizes).forEach(([key, config]) => {
    root.style.setProperty(`--ds-text-${key}`, config.size);
    root.style.setProperty(`--ds-leading-${key}`, config.lineHeight);
    if (config.tracking) {
      root.style.setProperty(`--ds-tracking-${key}`, config.tracking);
    }
  });
  
  // Inject spacing tokens
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--ds-spacing-${key}`, value);
  });
  
  // Inject motion tokens
  Object.entries(theme.motion.duration).forEach(([key, value]) => {
    root.style.setProperty(`--ds-duration-${key}`, value);
  });
  
  Object.entries(theme.motion.easing).forEach(([key, value]) => {
    root.style.setProperty(`--ds-ease-${key}`, value);
  });
  
  // Legacy support: Map to existing CSS variables
  if (enableLegacy) {
    Object.entries(legacyColorMap).forEach(([oldVar, newValue]) => {
      root.style.setProperty(oldVar, newValue);
    });
  }
}

function clearDesignSystemVariables() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  
  // Remove all --ds-* variables
  Array.from(styles).forEach(prop => {
    if (prop.startsWith('--ds-')) {
      root.style.removeProperty(prop);
    }
  });
}

export function cleanupThemeVariables() {
  clearDesignSystemVariables();
}
```

### Day 3-4: Design System Hooks

```typescript
// src/lib/design-system/hooks/use-theme.ts
import { getContext } from 'svelte';
import type { Readable, Writable } from 'svelte/store';
import type { Theme, ThemeMode } from '../themes/theme.types';

interface ThemeContext {
  theme: Readable<Theme>;
  mode: Writable<ThemeMode>;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: Theme) => void;
}

export function useTheme() {
  const context = getContext<ThemeContext>('design-system');
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// src/lib/design-system/hooks/use-design-token.ts
import { derived } from 'svelte/store';
import { useTheme } from './use-theme';

export function useDesignToken<T = any>(tokenPath: string) {
  const { theme } = useTheme();
  
  return derived(theme, $theme => {
    const path = tokenPath.split('.');
    let value: any = $theme;
    
    for (const key of path) {
      value = value?.[key];
    }
    
    return value as T;
  });
}

// src/lib/design-system/hooks/use-media-query.ts
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export function useMediaQuery(query: string) {
  return readable(false, (set) => {
    if (!browser) return;
    
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => set(e.matches);
    
    set(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  });
}
```

## Week 3: Component Implementation

### Day 1-2: Button Component with Backwards Compatibility

```svelte
<!-- src/lib/design-system/components/Button/Button.svelte -->
<script lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '$lib/utils/cn';
  import { Button as LegacyButton } from '$lib/components/ui/button.svelte';
  
  // Design system button styles
  const buttonVariants = cva(
    'ds-button inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      variants: {
        variant: {
          primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
          outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          ghost: 'hover:bg-accent hover:text-accent-foreground',
          link: 'text-primary underline-offset-4 hover:underline',
          danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        },
        size: {
          sm: 'h-8 px-3 text-xs',
          md: 'h-10 px-4 py-2',
          lg: 'h-12 px-8 text-base',
          icon: 'h-10 w-10',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
      },
    }
  );
  
  type $$Props = VariantProps<typeof buttonVariants> & {
    class?: string;
    legacy?: boolean;
    loading?: boolean;
    href?: string;
    [key: string]: any;
  };
  
  export let variant: $$Props['variant'] = 'primary';
  export let size: $$Props['size'] = 'md';
  export let legacy = false;
  export let loading = false;
  export let href: string | undefined = undefined;
  
  let className: string = '';
  export { className as class };
  
  $: computedClass = cn(buttonVariants({ variant, size }), className);
</script>

{#if legacy}
  <!-- Use legacy button for backwards compatibility -->
  <LegacyButton {...$$restProps} class={className}>
    <slot />
  </LegacyButton>
{:else if href}
  <!-- Link button -->
  <a 
    {href}
    class={computedClass}
    {...$$restProps}
  >
    {#if loading}
      <span class="ds-button-loader" />
    {/if}
    <slot />
  </a>
{:else}
  <!-- Regular button -->
  <button
    class={computedClass}
    disabled={loading || $$restProps.disabled}
    {...$$restProps}
  >
    {#if loading}
      <span class="ds-button-loader" />
    {/if}
    <slot />
  </button>
{/if}

<style>
  .ds-button-loader {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 0.5em;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: ds-spin 0.6s linear infinite;
  }
  
  @keyframes ds-spin {
    to { transform: rotate(360deg); }
  }
  
  /* Design system specific styles */
  :global(.ds-button) {
    /* Use design system tokens */
    font-family: var(--ds-font-sans);
    border-radius: var(--ds-radius-md);
  }
</style>
```

### Day 3-4: Card Compound Component

```svelte
<!-- src/lib/design-system/components/Card/Card.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { cn } from '$lib/utils/cn';
  
  export let variant: 'default' | 'outline' | 'ghost' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let interactive = false;
  
  let className = '';
  export { className as class };
  
  const variantClasses = {
    default: 'bg-card text-card-foreground shadow-sm',
    outline: 'border border-border',
    ghost: 'bg-transparent',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  $: computedClass = cn(
    'ds-card rounded-lg transition-shadow',
    variantClasses[variant],
    paddingClasses[padding],
    interactive && 'hover:shadow-md cursor-pointer',
    className
  );
  
  // Context for child components
  setContext('ds-card', {
    variant: writable(variant),
    padding: writable(padding),
  });
</script>

<article
  class={computedClass}
  role={interactive ? 'button' : undefined}
  tabindex={interactive ? 0 : undefined}
  on:click
  on:keydown
  {...$$restProps}
>
  <slot />
</article>

<!-- src/lib/design-system/components/Card/CardHeader.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  
  let className = '';
  export { className as class };
  
  const context = getContext('ds-card');
  const padding = context?.padding || 'md';
  
  const paddingClasses = {
    none: '',
    sm: 'pb-4',
    md: 'pb-6',
    lg: 'pb-8',
  };
</script>

<header class={cn('ds-card-header', paddingClasses[$padding], className)}>
  <slot />
</header>

<!-- src/lib/design-system/components/Card/index.ts -->
export { default as Root } from './Card.svelte';
export { default as Header } from './CardHeader.svelte';
export { default as Title } from './CardTitle.svelte';
export { default as Description } from './CardDescription.svelte';
export { default as Content } from './CardContent.svelte';
export { default as Footer } from './CardFooter.svelte';
export { default as Media } from './CardMedia.svelte';
```

## Week 4: Migration Examples

### Example 1: Migrating ListingCard

```svelte
<!-- Before: src/lib/components/listings/ListingCard.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import type { Listing } from '$lib/types/listing';
  
  export let listing: Listing;
</script>

<Card>
  <img src={listing.image_url} alt={listing.title} />
  <div class="p-4">
    <h3 class="font-semibold">{listing.title}</h3>
    <p class="text-muted-foreground">{listing.price}</p>
  </div>
</Card>

<!-- After: Using Design System -->
<script lang="ts">
  import * as Card from '$lib/design-system/components/Card';
  import { Image } from '$lib/design-system/primitives';
  import { Text } from '$lib/design-system/primitives';
  import { formatCurrency } from '$lib/utils/currency';
  import type { Listing } from '$lib/types/listing';
  
  export let listing: Listing;
  export let variant: 'default' | 'compact' = 'default';
</script>

<Card.Root interactive variant="outline" padding="none">
  <Card.Media aspectRatio={variant === 'compact' ? '1:1' : '4:3'}>
    <Image
      src={listing.image_url}
      alt={listing.title}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      loading="lazy"
    />
  </Card.Media>
  
  <Card.Content>
    <Card.Title size={variant === 'compact' ? 'sm' : 'md'}>
      {listing.title}
    </Card.Title>
    
    {#if listing.brand}
      <Text variant="muted" size="sm">
        {listing.brand.name}
      </Text>
    {/if}
    
    <Card.Price>
      {formatCurrency(listing.price)}
    </Card.Price>
  </Card.Content>
  
  {#if variant === 'default' && listing.tags?.length}
    <Card.Footer>
      <div class="flex gap-2">
        {#each listing.tags as tag}
          <span class="ds-tag">{tag}</span>
        {/each}
      </div>
    </Card.Footer>
  {/if}
</Card.Root>

<style>
  .ds-tag {
    padding: var(--ds-spacing-1) var(--ds-spacing-2);
    background-color: var(--ds-color-muted);
    color: var(--ds-color-muted-foreground);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-text-xs);
  }
</style>
```

### Example 2: Feature Flag Implementation

```typescript
// src/lib/design-system/config/feature-flags.ts
interface FeatureFlags {
  enabled: boolean;
  components: Record<string, boolean>;
  routes: Record<string, boolean>;
}

export const designSystemFlags: FeatureFlags = {
  enabled: import.meta.env.VITE_ENABLE_DESIGN_SYSTEM === 'true',
  components: {
    button: true,
    card: true,
    input: false,
    select: false,
    // Add more as they're ready
  },
  routes: {
    '/': false,
    '/browse': true,
    '/listings/[id]': true,
    // Add more as they're tested
  },
};

// Helper to check if design system is enabled for current context
export function isDesignSystemEnabled(
  component?: string,
  route?: string
): boolean {
  if (!designSystemFlags.enabled) return false;
  
  if (component && !designSystemFlags.components[component]) {
    return false;
  }
  
  if (route && !designSystemFlags.routes[route]) {
    return false;
  }
  
  return true;
}
```

## Success Metrics and Monitoring

### Performance Monitoring
```typescript
// src/lib/design-system/utilities/performance.ts
export function measureComponentPerformance(componentName: string) {
  if (!browser) return;
  
  const startMark = `ds-${componentName}-start`;
  const endMark = `ds-${componentName}-end`;
  const measureName = `ds-${componentName}-render`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.debug(`[DS] ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);
  };
}
```

### Bundle Size Tracking
```javascript
// vite.config.js addition
export default defineConfig({
  plugins: [
    {
      name: 'design-system-bundle-analyzer',
      generateBundle(options, bundle) {
        const dsModules = Object.keys(bundle).filter(key => 
          key.includes('design-system')
        );
        
        const totalSize = dsModules.reduce((acc, key) => {
          return acc + (bundle[key].code?.length || 0);
        }, 0);
        
        console.log(`Design System Bundle Size: ${(totalSize / 1024).toFixed(2)}KB`);
      }
    }
  ]
});
```

## Next Steps

1. **Week 5-6**: Implement remaining core components
2. **Week 7-8**: Create documentation site and examples
3. **Month 2**: Begin gradual migration of feature components
4. **Month 3**: A/B test and monitor performance
5. **Month 4**: Complete migration and remove legacy code

This implementation roadmap provides concrete, actionable steps with real code examples that can be immediately implemented without breaking the existing system.