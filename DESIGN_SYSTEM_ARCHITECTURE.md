# Driplo Modern Design System Architecture

## Overview
A comprehensive, token-based design system that builds upon the existing shadcn-ui foundation while introducing modern patterns for scalability, consistency, and developer experience.

## Core Principles
1. **Non-Breaking**: All changes must be backwards compatible
2. **Progressive Enhancement**: New features layer on top of existing ones
3. **Token-First**: All design decisions stem from tokens
4. **Component Composition**: Favor composition over configuration
5. **Performance-Oriented**: Optimize for runtime and build-time performance
6. **Accessibility-First**: WCAG AA compliance as baseline

## Directory Structure

```
src/lib/design-system/
├── README.md                    # Design system documentation
├── index.ts                     # Main exports
│
├── tokens/                      # Design tokens
│   ├── index.ts
│   ├── colors.ts               # Color tokens and schemes
│   ├── typography.ts           # Font families, sizes, weights
│   ├── spacing.ts              # Spacing scale
│   ├── motion.ts               # Animation tokens
│   ├── shadows.ts              # Shadow definitions
│   ├── borders.ts              # Border radius, widths
│   └── breakpoints.ts          # Responsive breakpoints
│
├── themes/                      # Theme configurations
│   ├── index.ts
│   ├── base.theme.ts           # Base theme definition
│   ├── light.theme.ts          # Light theme
│   ├── dark.theme.ts           # Dark theme
│   ├── brand/                  # Brand-specific themes
│   │   ├── driplo.theme.ts
│   │   └── seasonal.theme.ts   # Seasonal variations
│   └── theme.types.ts          # TypeScript types
│
├── foundations/                 # Core system utilities
│   ├── index.ts
│   ├── theme-provider.svelte   # Theme context provider
│   ├── style-injection.ts      # Runtime style injection
│   ├── css-layers.ts           # CSS cascade layers
│   └── global-styles.ts        # Global CSS setup
│
├── primitives/                  # Low-level building blocks
│   ├── index.ts
│   ├── Box/                    # Layout primitive
│   ├── Text/                   # Typography primitive
│   ├── Stack/                  # Flex stack primitive
│   ├── Grid/                   # Grid primitive
│   └── Portal/                 # Portal primitive
│
├── components/                  # Enhanced UI components
│   ├── index.ts
│   ├── Button/
│   │   ├── Button.svelte
│   │   ├── Button.types.ts
│   │   ├── Button.styles.ts    # CVA styles
│   │   └── Button.stories.ts   # Component examples
│   ├── Card/
│   ├── Input/
│   ├── Select/
│   └── [other components...]
│
├── patterns/                    # Common UI patterns
│   ├── index.ts
│   ├── FormField/              # Form field pattern
│   ├── DataTable/              # Table pattern
│   ├── Modal/                  # Modal pattern
│   └── Navigation/             # Nav patterns
│
├── utilities/                   # Helper functions
│   ├── index.ts
│   ├── responsive.ts           # Responsive helpers
│   ├── theme.ts                # Theme utilities
│   ├── a11y.ts                 # Accessibility utilities
│   └── performance.ts          # Performance utilities
│
├── hooks/                       # Svelte hooks/stores
│   ├── index.ts
│   ├── use-theme.ts            # Theme hook
│   ├── use-media-query.ts      # Media query hook
│   ├── use-motion.ts           # Motion preferences
│   └── use-design-token.ts     # Token access hook
│
└── docs/                        # Documentation
    ├── getting-started.md
    ├── migration-guide.md
    ├── api-reference.md
    └── examples/
```

## Token System Architecture

### 1. Token Structure
```typescript
// Base token type
interface DesignToken<T = any> {
  name: string;
  value: T;
  css?: string;
  description?: string;
  deprecated?: boolean;
}

// Token categories
interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  motion: MotionTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  breakpoints: BreakpointTokens;
}
```

### 2. Color System
```typescript
// Semantic color tokens
interface ColorTokens {
  // Base colors
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  
  // Semantic colors
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  info: ColorScale;
  
  // Surface colors
  background: {
    base: string;
    subtle: string;
    muted: string;
    inverse: string;
  };
  
  // Interactive states
  interactive: {
    default: string;
    hover: string;
    active: string;
    disabled: string;
  };
}

interface ColorScale {
  50: string;
  100: string;
  // ... through 900
  DEFAULT: string;
  foreground: string;
}
```

### 3. Typography System
```typescript
interface TypographyTokens {
  fonts: {
    sans: string;
    serif: string;
    mono: string;
    display: string;
  };
  
  sizes: {
    xs: { size: string; lineHeight: string; };
    sm: { size: string; lineHeight: string; };
    // ... through 6xl
  };
  
  weights: {
    thin: number;
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    black: number;
  };
}
```

## Theme System

### 1. Theme Provider
```svelte
<!-- ThemeProvider.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Theme } from './theme.types';
  
  export let theme: Theme;
  export let mode: 'light' | 'dark' | 'system' = 'system';
  
  const themeStore = writable({ theme, mode });
  setContext('design-system-theme', themeStore);
  
  // Inject CSS variables
  $: injectThemeVariables($themeStore);
</script>
```

### 2. Runtime Theming
```typescript
// CSS Variable injection
function injectThemeVariables(theme: Theme) {
  const root = document.documentElement;
  
  // Inject color tokens
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, color]) => {
        root.style.setProperty(`--ds-color-${key}-${shade}`, color);
      });
    } else {
      root.style.setProperty(`--ds-color-${key}`, value);
    }
  });
  
  // Inject other tokens...
}
```

## Component Architecture

### 1. Component Structure
```typescript
// Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

// Button/Button.styles.ts
import { cva } from 'class-variance-authority';

export const buttonStyles = cva(
  'ds-button inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### 2. Compound Components
```svelte
<!-- Card compound component example -->
<script context="module">
  export { default as Root } from './Card.svelte';
  export { default as Header } from './CardHeader.svelte';
  export { default as Title } from './CardTitle.svelte';
  export { default as Description } from './CardDescription.svelte';
  export { default as Content } from './CardContent.svelte';
  export { default as Footer } from './CardFooter.svelte';
</script>
```

## Migration Strategy

### Phase 1: Foundation (No Breaking Changes)
1. Create design-system directory structure
2. Implement token system alongside existing CSS variables
3. Create ThemeProvider that works with existing styles
4. Build utility functions and hooks

### Phase 2: Enhancement (Additive Changes)
1. Create new primitive components
2. Build enhanced versions of existing components
3. Add design system patterns
4. Implement documentation site

### Phase 3: Migration (Gradual Adoption)
1. Create migration guide for each component
2. Add deprecation warnings to old patterns
3. Provide codemods for automated migration
4. Update feature components to use new system

### Phase 4: Consolidation (Breaking Changes - Major Version)
1. Remove deprecated components
2. Consolidate duplicate functionality
3. Optimize bundle size
4. Complete documentation

## Performance Considerations

### 1. CSS Architecture
- Use CSS layers for proper cascade management
- Implement CSS containment for layout stability
- Use CSS custom properties for runtime theming
- Minimize specificity wars

### 2. Bundle Optimization
- Tree-shakeable component exports
- Separate runtime and build-time code
- Lazy load heavy components
- Use dynamic imports for themes

### 3. Runtime Performance
- Minimize style recalculations
- Use CSS transforms for animations
- Implement virtual scrolling for lists
- Cache computed styles

## Developer Experience

### 1. TypeScript Support
- Full type coverage for all components
- Auto-completion for design tokens
- Type-safe theme creation
- Prop validation

### 2. Developer Tools
- VS Code snippets
- ESLint rules for consistency
- Prettier configuration
- Component generator CLI

### 3. Documentation
- Interactive component playground
- Copy-paste examples
- Best practices guide
- Migration tools

## Accessibility Features

### 1. Built-in Support
- ARIA attributes by default
- Keyboard navigation
- Focus management
- Screen reader optimization

### 2. Testing
- Automated a11y testing
- Color contrast validation
- Keyboard testing utilities
- Screen reader testing guide

## Implementation Roadmap

### Week 1-2: Foundation
- Set up directory structure
- Implement token system
- Create theme provider
- Build core utilities

### Week 3-4: Primitives
- Create layout primitives
- Build typography system
- Implement responsive utilities
- Add motion preferences

### Week 5-6: Components
- Enhance existing components
- Create new design system components
- Build component documentation
- Add testing infrastructure

### Week 7-8: Integration
- Create migration guides
- Build example implementations
- Update existing features
- Performance optimization

This architecture provides a solid foundation for a modern, scalable design system that enhances the existing Driplo codebase without breaking changes.