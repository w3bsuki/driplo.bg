# 🚀 PRODUCTION REFACTOR 2025 - SYSTEMATIC EXECUTION PLAN
**Created**: 2025-08-04  
**Target**: Native Svelte 5 + SvelteKit 2 + Tailwind CSS v4  
**Approach**: Phase-by-phase systematic refactor with explicit agent tasks

---

## 🎯 REFACTOR GOALS
1. **Component Size**: All components < 150 lines
2. **Architecture**: Flat, simple, no over-engineering  
3. **Design System**: Consistent Tailwind CSS v4 with modern theme
4. **Performance**: Bundle < 500KB, Lighthouse > 95
5. **Code Quality**: 0 TypeScript errors, 0 console.logs

---

## 🎨 PHASE 0: TAILWIND CSS V4 STYLING GUIDE
**Execute First - All agents must follow this**

### Design Tokens (app.css)
```css
/* Color System - Modern Purple/Pink Gradient Theme */
:root {
  /* Primary Colors */
  --color-primary: 147 51 234;        /* Purple 600 */
  --color-primary-hover: 124 58 237;  /* Purple 700 */
  --color-secondary: 236 72 153;      /* Pink 500 */
  --color-accent: 99 102 241;         /* Indigo 500 */
  
  /* Neutral Colors */
  --color-background: 250 250 250;    /* Neutral 50 */
  --color-surface: 255 255 255;       /* White */
  --color-border: 229 231 235;        /* Gray 200 */
  --color-text: 17 24 39;            /* Gray 900 */
  --color-text-muted: 107 114 128;   /* Gray 500 */
  
  /* Semantic Colors */
  --color-success: 34 197 94;         /* Green 500 */
  --color-warning: 251 146 60;        /* Orange 400 */
  --color-error: 239 68 68;           /* Red 500 */
  
  /* Spacing Scale - Compact Design */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  
  /* Typography Scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  
  /* Border Radius - Consistent */
  --radius-sm: 0.25rem;  /* 4px - USE THIS EVERYWHERE */
  --radius-full: 9999px; /* Full circle - avatars only */
  
  /* Shadows - Minimal */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* Dropdowns only */
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: 17 24 39;
    --color-surface: 31 41 55;
    --color-border: 55 65 81;
    --color-text: 243 244 246;
    --color-text-muted: 156 163 175;
  }
}
```

### Component Classes
```css
/* Buttons */
.btn-primary { @apply h-8 px-3 py-1.5 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-hover transition-colors; }
.btn-secondary { @apply h-8 px-3 py-1.5 bg-surface text-primary border border-primary rounded-sm text-sm font-medium hover:bg-primary/10 transition-colors; }
.btn-ghost { @apply h-8 px-3 py-1.5 text-text hover:bg-gray-100 rounded-sm text-sm font-medium transition-colors; }

/* Inputs */
.input { @apply h-8 px-2 bg-surface border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary; }
.textarea { @apply p-2 bg-surface border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary; }

/* Cards */
.card { @apply bg-surface border border-border rounded-sm; }
.card-compact { @apply p-3; }
.card-normal { @apply p-4; }

/* Badges */
.badge { @apply inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium; }
.badge-primary { @apply bg-primary/10 text-primary; }
.badge-success { @apply bg-success/10 text-success; }
.badge-error { @apply bg-error/10 text-error; }
```

### Tailwind Config
```js
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'full': 'var(--radius-full)',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
      },
    },
  },
}
```

---

## 📋 SVELTE 5 / SVELTEKIT 2 RULES

### ✅ DO - MANDATORY PATTERNS
```svelte
<!-- Event Handlers - ALWAYS use new syntax -->
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={handleSubmit}>

<!-- Props - ALWAYS use $props() -->
<script>
  const { value, onChange } = $props();
</script>

<!-- State - ALWAYS use runes -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<!-- Children - Use snippets not slots -->
{#snippet children()}
  <p>Content here</p>
{/snippet}

<!-- Bindings -->
<input bind:value={searchQuery} />

<!-- SSR Data Loading -->
// +page.server.ts
export async function load({ locals }) {
  return { user: locals.user };
}
```

### ❌ DON'T - FORBIDDEN PATTERNS
```svelte
<!-- NEVER use old event syntax -->
<button on:click={handler}> ❌

<!-- NEVER use export let -->
export let value; ❌

<!-- NEVER use old reactivity -->
$: doubled = count * 2; ❌

<!-- NEVER use <slot> -->
<slot /> ❌

<!-- NEVER load data client-side in +page.svelte -->
onMount(() => fetch('/api/data')); ❌
```

---

## 🔨 PHASE 1: COMPONENT BREAKDOWN (Day 1-3)
**Agent Instructions: Break monolithic components into small pieces**

### EXPLICIT TODOS - CheckoutModal.svelte (769→150 lines)
```bash
# Terminal 1 - CheckoutModal Refactor
cd K:\driplo.bg-1

# Step 1: Read the monolithic component
Read src/lib/components/checkout/CheckoutModal.svelte

# Step 2: Create sub-components
Write src/lib/components/checkout/CheckoutHeader.svelte          # Lines 1-50
Write src/lib/components/checkout/PaymentMethodSelector.svelte   # Lines 51-150  
Write src/lib/components/checkout/ShippingAddressForm.svelte     # Lines 151-250
Write src/lib/components/checkout/OrderSummary.svelte            # Lines 251-350
Write src/lib/components/checkout/PaymentProcessing.svelte       # Lines 351-450

# Step 3: Update parent to use sub-components
Edit src/lib/components/checkout/CheckoutModal.svelte
# Import all sub-components
# Replace inline code with component usage
# Final size: <150 lines

# Step 4: Test checkout flow
pnpm dev
# Navigate to checkout, test all payment methods
```

### EXPLICIT TODOS - BrandOnboardingWizard.svelte (757→150 lines)
```bash
# Terminal 2 - BrandOnboardingWizard Refactor
cd K:\driplo.bg-1

# Step 1: Read the monolithic component
Read src/lib/components/brands/BrandOnboardingWizard.svelte

# Step 2: Create step components
Write src/lib/components/brands/onboarding/BrandInfoStep.svelte      # Brand details form
Write src/lib/components/brands/onboarding/SocialMediaStep.svelte    # Social links
Write src/lib/components/brands/onboarding/VerificationStep.svelte   # ID verification
Write src/lib/components/brands/onboarding/PaymentSetupStep.svelte   # Payment info
Write src/lib/components/brands/onboarding/StepIndicator.svelte      # Progress bar

# Step 3: Create step manager
Write src/lib/components/brands/onboarding/useSteps.svelte.ts        # Step logic

# Step 4: Update parent wizard
Edit src/lib/components/brands/BrandOnboardingWizard.svelte
# Use dynamic component switching
# Final size: <150 lines

# Step 5: Test wizard flow
pnpm dev
# Complete full onboarding flow
```

### EXPLICIT TODOS - Route Pages (940→300 lines max)
```bash
# Terminal 3 - Route Page Refactor
cd K:\driplo.bg-1

# listings/[id]/+page.svelte (940→300)
Read src/routes/(app)/listings/[id]/+page.svelte
Write src/lib/components/listings/detail/ProductGallery.svelte
Write src/lib/components/listings/detail/ProductInfo.svelte  
Write src/lib/components/listings/detail/SellerInfo.svelte
Write src/lib/components/listings/detail/ProductActions.svelte
Write src/lib/components/listings/detail/RelatedProducts.svelte
Edit src/routes/(app)/listings/[id]/+page.svelte              # <300 lines

# browse/+page.svelte (732→200)
Read src/routes/(app)/browse/+page.svelte
Write src/lib/components/browse/FilterSidebar.svelte
Write src/lib/components/browse/ProductGrid.svelte
Write src/lib/components/browse/SortingControls.svelte
Edit src/routes/(app)/browse/+page.svelte                     # <200 lines
```

---

## 🎨 PHASE 2: DESIGN SYSTEM CLEANUP (Day 4-5)
**Agent Instructions: Apply consistent Tailwind classes globally**

### EXPLICIT TODOS - Global Find & Replace
```bash
# Terminal 4 - Design System Cleanup
cd K:\driplo.bg-1

# Border Radius - Replace ALL occurrences
Grep "rounded-md" --glob="**/*.svelte"
# For each file: Edit and replace rounded-md → rounded-sm

Grep "rounded-lg" --glob="**/*.svelte"  
# For each file: Edit and replace rounded-lg → rounded-sm

Grep "rounded-xl" --glob="**/*.svelte"
# For each file: Edit and replace rounded-xl → rounded-sm

# Spacing - Reduce ALL padding/gaps
Grep "p-4|p-6|p-8" --glob="**/*.svelte"
# Replace: p-4→p-2, p-6→p-3, p-8→p-3

Grep "gap-4|gap-6|gap-8" --glob="**/*.svelte"
# Replace: gap-4→gap-2, gap-6→gap-3, gap-8→gap-3

# Shadows - Remove excessive shadows  
Grep "shadow-md|shadow-lg|shadow-xl" --glob="**/*.svelte"
# Remove all except dropdowns/modals

# Heights - Reduce component heights
Grep "h-10|h-12|h-14|h-16" --glob="**/*.svelte"
# Replace: h-10→h-8, h-12→h-9, h-14→h-9, h-16→h-9
```

---

## 🔄 PHASE 3: DEDUPLICATION (Day 6-7)
**Agent Instructions: Merge duplicate code and utilities**

### EXPLICIT TODOS - Utility Consolidation
```bash
# Terminal 5 - Utility Cleanup
cd K:\driplo.bg-1

# Storage utilities
Read src/lib/utils/storage.ts
Read src/lib/utils/storage-client.ts
Write src/lib/utils/storage.ts         # Merge both into one
Bash rm src/lib/utils/storage-client.ts
# Update all imports

# Image utilities  
Read src/lib/utils/image-compression.ts
Read src/lib/utils/image-optimization.ts
Read src/lib/utils/image-processor.ts
Write src/lib/utils/images.ts          # Merge all three
Bash rm src/lib/utils/image-*.ts
# Update all imports

# Validation utilities
Read src/lib/utils/validation.ts
Read src/lib/utils/form-validation.ts
Read src/lib/utils/auth-validation.ts  
Write src/lib/utils/validation.ts      # Merge all validation
Bash rm src/lib/utils/form-validation.ts
Bash rm src/lib/utils/auth-validation.ts
# Update all imports
```

### EXPLICIT TODOS - Remove Console Logs
```bash
# Terminal 6 - Dead Code Cleanup
cd K:\driplo.bg-1

# Find all console.log statements
Grep "console\\.log" --glob="**/*.{ts,svelte}"

# For each file found:
Edit [filename]
# Remove the console.log line

# Find all TODO/FIXME comments
Grep "TODO|FIXME" --glob="**/*.{ts,svelte}"

# For each file found:
Edit [filename]  
# Either fix the issue or remove the comment
```

---

## 🏗️ PHASE 4: ARCHITECTURE SIMPLIFICATION (Day 8-9)
**Agent Instructions: Flatten directory structure, remove complexity**

### EXPLICIT TODOS - Auth Simplification
```bash
# Terminal 7 - Auth Refactor
cd K:\driplo.bg-1

# Read current auth architecture
Read src/lib/stores/auth-context.svelte.ts
Read src/lib/services/auth-compat.ts
Read src/lib/services/auth.ts

# Merge into single auth context
Write src/lib/stores/auth.svelte.ts    # Single source of truth
Bash rm src/lib/services/auth-compat.ts
# Update all imports to use new auth store
```

### EXPLICIT TODOS - Component Directory Flattening
```bash
# Terminal 8 - Directory Structure
cd K:\driplo.bg-1

# Move nested components to flat structure
Bash mv src/lib/components/CreateListingForm/components/* src/lib/components/listings/
Bash rm -rf src/lib/components/CreateListingForm

# Update imports in all files that used nested components
Grep "CreateListingForm/components" --glob="**/*.svelte"
# Fix each import path
```

---

## 🚀 PHASE 5: DEPENDENCY CLEANUP (Day 10)
**Agent Instructions: Remove unused packages and optimize bundle**

### EXPLICIT TODOS - Package Audit
```bash
# Terminal 9 - Dependency Cleanup
cd K:\driplo.bg-1

# Remove Storybook if not actively used
Bash pnpm remove @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/svelte @storybook/svelte-vite @storybook/test storybook

# Remove unused dev dependencies
Bash pnpm remove prettier-plugin-organize-imports

# Check for unused dependencies
Bash npx depcheck

# Remove any packages marked as unused
Bash pnpm remove [unused-packages]

# Reinstall and check bundle size
Bash pnpm install
Bash pnpm build
```

---

## 📊 PHASE 6: FINAL VERIFICATION (Day 11-12)
**Agent Instructions: Verify all refactoring goals met**

### EXPLICIT TODOS - Quality Checks
```bash
# Terminal 10 - Final Verification
cd K:\driplo.bg-1

# Check component sizes
Bash find src -name "*.svelte" -exec wc -l {} + | sort -rn | head -20
# Verify no component > 150 lines

# Check TypeScript errors
Bash pnpm check

# Run linting
Bash pnpm lint

# Build and check bundle size
Bash pnpm build
Bash ls -lh .svelte-kit/output/client/_app/immutable/chunks/

# Run dev server and manual testing
Bash pnpm dev
# Test all major flows
```

---

## 🚫 UNIVERSAL DON'TS FOR ALL AGENTS

1. **DON'T create files > 150 lines**
2. **DON'T use `on:click` syntax - use `onclick`**  
3. **DON'T use `export let` - use `$props()`**
4. **DON'T add console.log statements**
5. **DON'T create nested component directories**
6. **DON'T over-engineer - keep it simple**
7. **DON'T duplicate code - reuse components**
8. **DON'T use rounded-md/lg/xl - only rounded-sm**
9. **DON'T use p-4/6/8 - max p-3**
10. **DON'T add heavy shadows - minimal design**

---

## ✅ SUCCESS CRITERIA

### Quantitative Metrics
- [ ] 0 components > 150 lines
- [ ] 0 TypeScript errors  
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 95
- [ ] 0 console.log statements
- [ ] < 100 total components (from 197)
- [ ] < 15 utility files (from 30)

### Qualitative Goals  
- [ ] Consistent Tailwind design system
- [ ] Flat component architecture
- [ ] Native Svelte 5 patterns everywhere
- [ ] Simple, maintainable code
- [ ] Fast development iteration

---

## 🎯 AGENT EXECUTION NOTES

1. **Each phase = New terminal window**
2. **Follow EXPLICIT TODOS exactly**
3. **No improvisation or over-engineering**
4. **Test after each major change**
5. **Commit after each phase completion**

**START WITH PHASE 1 - COMPONENT BREAKDOWN**