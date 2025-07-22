# Compact Design System Guide (Vercel/Stripe Style)

## Overview
This design system creates a clean, compact UI similar to modern platforms like Vercel and Stripe.

## Core Principles
1. **Compact sizing** - Smaller components, tighter spacing
2. **Subtle effects** - Minimal shadows, muted colors
3. **Clear hierarchy** - Using size and weight, not decoration
4. **Consistent spacing** - 4px grid system

## Using the Design System

### Typography
```svelte
<!-- Body text (14px default) -->
<p class="text-[var(--text-base)]">Regular text</p>

<!-- Small text (13px) -->
<p class="text-[var(--text-sm)]">Small text</p>

<!-- Headings -->
<h1 class="text-[var(--text-3xl)] font-[var(--font-semibold)]">Page Title</h1>
<h2 class="text-[var(--text-2xl)] font-[var(--font-medium)]">Section Title</h2>
```

### Spacing
```svelte
<!-- Use CSS variables for consistent spacing -->
<div class="p-[var(--space-3)] gap-[var(--space-2)]">
  <!-- 12px padding, 8px gap -->
</div>

<!-- Compact card -->
<div class="p-[var(--space-2)] rounded-[var(--radius-md)]">
  <!-- 8px padding, 6px radius -->
</div>
```

### Colors
```svelte
<!-- Primary button -->
<button class="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]">
  Save Changes
</button>

<!-- Semantic colors -->
<div class="text-[var(--color-success-main)]">Success message</div>
<div class="text-[var(--color-error-main)]">Error message</div>
```

### Components

#### Buttons (Compact sizes)
```svelte
<!-- Extra small: 24px height -->
<Button size="xs">XS Button</Button>

<!-- Small: 28px height -->
<Button size="sm">Small Button</Button>

<!-- Medium (default): 32px height -->
<Button size="md">Medium Button</Button>

<!-- Large: 36px height -->
<Button size="lg">Large Button</Button>
```

#### Inputs (Compact sizes)
```svelte
<!-- Small: 28px height -->
<input class="input-size-sm" />

<!-- Medium: 32px height -->
<input class="input-size-md" />

<!-- Large: 36px height -->
<input class="input-size-lg" />
```

#### Badges (Minimal style)
```svelte
<!-- Small: 18px height -->
<Badge size="sm">New</Badge>

<!-- Medium: 22px height (recommended for visibility) -->
<Badge size="md">Status</Badge>

<!-- Large: 26px height -->
<Badge size="lg">Category</Badge>
```

### Shadows (Minimal elevation)
```css
/* Very subtle shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
--shadow-md: 0 2px 4px 0 rgb(0 0 0 / 0.06);
--shadow-lg: 0 4px 8px 0 rgb(0 0 0 / 0.08);
--shadow-border: 0 0 0 1px rgba(0, 0, 0, 0.08);
```

### Border Radius (Subtle curves)
```css
--radius-sm: 3px;  /* Very subtle */
--radius-md: 6px;  /* Default */
--radius-lg: 8px;  /* Slightly rounded */
--radius-xl: 12px; /* More rounded */
```

## Common Patterns

### Compact Card
```svelte
<div class="bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--duration-fast)] p-[var(--space-3)]">
  <h3 class="text-[var(--text-lg)] font-[var(--font-medium)] mb-[var(--space-2)]">
    Card Title
  </h3>
  <p class="text-[var(--text-sm)] text-gray-600">
    Card content with compact spacing
  </p>
</div>
```

### Compact Form
```svelte
<form class="space-y-[var(--space-3)]">
  <div>
    <label class="text-[var(--text-sm)] font-[var(--font-medium)] mb-[var(--space-1)] block">
      Email
    </label>
    <input 
      type="email" 
      class="input-size-md w-full"
      placeholder="you@example.com"
    />
  </div>
  
  <Button size="md" class="w-full">
    Continue
  </Button>
</form>
```

### Compact List
```svelte
<ul class="divide-y divide-gray-100">
  {#each items as item}
    <li class="py-[var(--space-2)] px-[var(--space-3)]">
      <div class="flex items-center justify-between">
        <span class="text-[var(--text-sm)]">{item.name}</span>
        <Badge size="sm">{item.status}</Badge>
      </div>
    </li>
  {/each}
</ul>
```

## Migration from Old System

### Before (Bloated)
```svelte
<button class="h-10 px-4 text-base rounded-lg">Button</button>
<div class="p-4 space-y-4">Content</div>
```

### After (Compact)
```svelte
<Button size="md">Button</Button>
<div class="p-[var(--space-3)] space-y-[var(--space-2)]">Content</div>
```

## Best Practices

1. **Use CSS variables** - Always use `var(--token)` instead of hardcoded values
2. **Consistent sizing** - Use the predefined component sizes (xs, sm, md, lg, xl)
3. **Minimal decoration** - Rely on spacing and typography, not borders/shadows
4. **Readable contrast** - Ensure text meets WCAG AA standards
5. **Touch targets** - Maintain 44px minimum for interactive elements on mobile

## Quick Reference

### Component Heights
- Buttons: 24px, 28px, 32px, 36px, 40px
- Inputs: 28px, 32px, 36px
- Badges: 18px, 22px, 26px

### Text Sizes
- xs: 12px
- sm: 13px
- base: 14px (default body)
- lg: 16px
- xl: 18px
- 2xl: 20px
- 3xl: 24px

### Spacing Scale
- 0.5: 2px
- 1: 4px
- 1.5: 6px
- 2: 8px
- 2.5: 10px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px