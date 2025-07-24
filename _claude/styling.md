# 🎨 DRIPLO Design System & Styling Guide v2.1 (Compact Edition)

> **Status**: Production-Ready | **Updated**: 2025-07-24
> **Stack**: SvelteKit 2 + TypeScript + TailwindCSS + Radix Svelte
> **Design Approach**: Compact (Vercel/Linear style) - NOT Ultra-Compact

## 📋 Table of Contents
- [Design Philosophy](#design-philosophy)
- [File Architecture](#file-architecture)
- [Design Tokens](#design-tokens)
- [Implementation Guide](#implementation-guide)
- [Component Patterns](#component-patterns)
- [Performance Standards](#performance-standards)
- [Migration Strategy](#migration-strategy)

---

## 🎯 Design Philosophy

### Core Principles
1. **Compact UI** - Dense but comfortable (Vercel/Linear style)
2. **Instant Feedback** - Smooth animations under 300ms
3. **Performance First** - 60fps always, zero jank
4. **Modern & Clean** - Professional appearance
5. **E-commerce Optimized** - Fast checkout, quick browse

### Visual Language
- **Subtle shadows** - For depth on floating elements (shadow-md/lg)
- **Comfortable spacing** - 8-16px gaps, readable content
- **High contrast** - Clear hierarchy, instant readability
- **Rounded corners** - 4-6px radius (rounded-md/lg)
- **System fonts** - Zero font loading delay

---

## 📁 File Architecture

```
/src
├── app.css                    # Global styles & token imports
├── lib/
│   ├── styles/
│   │   ├── tokens.css        # Design token definitions
│   │   ├── base.css          # Reset & base styles
│   │   ├── utilities.css     # Custom utility classes
│   │   └── animations.css    # Transition & animation tokens
│   └── components/
│       └── ui/               # Radix-based components
/tailwind.config.js           # Extended with token mappings
/.lighthouserc.js             # Performance benchmarks
```

---

## 🎨 Design Tokens

### 1. Core Token System

```css
/* /src/lib/styles/tokens.css */
@layer tokens {
  :root {
    /* ===== Grid System ===== */
    --grid-unit: 4px;  /* Base 4px grid */
    --grid-2: calc(var(--grid-unit) * 2);   /* 8px */
    --grid-3: calc(var(--grid-unit) * 3);   /* 12px */
    --grid-4: calc(var(--grid-unit) * 4);   /* 16px */
    --grid-5: calc(var(--grid-unit) * 5);   /* 20px */
    --grid-6: calc(var(--grid-unit) * 6);   /* 24px */
    --grid-8: calc(var(--grid-unit) * 8);   /* 32px */
    --grid-10: calc(var(--grid-unit) * 10); /* 40px */
    --grid-12: calc(var(--grid-unit) * 12); /* 48px */
    --grid-16: calc(var(--grid-unit) * 16); /* 64px */

    /* ===== Typography Scale (Compact) ===== */
    --font-sans: Inter, system-ui, -apple-system, sans-serif;
    --font-display: 'Plus Jakarta Sans', var(--font-sans);
    --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

    /* Font Sizes - Ultra compact */
    --text-2xs: 0.625rem;    /* 10px - labels/badges */
    --text-xs: 0.6875rem;    /* 11px - micro info */
    --text-sm: 0.75rem;      /* 12px - secondary */
    --text-base: 0.8125rem;  /* 13px - body default */
    --text-md: 0.875rem;     /* 14px - emphasis */
    --text-lg: 1rem;         /* 16px - headings */
    --text-xl: 1.125rem;     /* 18px - section titles */
    --text-2xl: 1.25rem;     /* 20px - page titles */
    --text-3xl: 1.5rem;      /* 24px - hero */
    --text-4xl: 1.75rem;     /* 28px - display */
    --text-5xl: 2rem;        /* 32px - big numbers */

    /* Line Heights - Tighter for density */
    --leading-none: 1;
    --leading-tight: 1.2;
    --leading-snug: 1.325;
    --leading-normal: 1.4;
    --leading-relaxed: 1.5;

    /* Letter Spacing */
    --tracking-tighter: -0.04em;
    --tracking-tight: -0.02em;
    --tracking-normal: 0;
    --tracking-wide: 0.02em;
    --tracking-wider: 0.04em;

    /* Font Weights */
    --font-light: 300;
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;

    /* ===== Color System ===== */
    /* Brand Colors - Baby Blue */
    --color-brand-50: #f0f9ff;
    --color-brand-100: #e0f2fe;
    --color-brand-200: #bae6fd;
    --color-brand-300: #7dd3fc;
    --color-brand-400: #38bdf8;
    --color-brand-500: #87ceeb;  /* Primary */
    --color-brand-600: #6bb6d8;
    --color-brand-700: #4f9fc5;
    --color-brand-800: #3a88ae;
    --color-brand-900: #1e5a7e;

    /* Neutrals - Blue-tinted grays */
    --color-gray-0: #ffffff;
    --color-gray-50: #f8fafc;
    --color-gray-100: #f1f5f9;
    --color-gray-200: #e2e8f0;
    --color-gray-300: #cbd5e1;
    --color-gray-400: #94a3b8;
    --color-gray-500: #64748b;
    --color-gray-600: #475569;
    --color-gray-700: #334155;
    --color-gray-800: #1e293b;
    --color-gray-900: #0f172a;
    --color-gray-950: #020617;

    /* Semantic Colors */
    --color-success-50: #f0fdf4;
    --color-success-500: #22c55e;
    --color-success-600: #16a34a;
    
    --color-warning-50: #fffbeb;
    --color-warning-500: #f59e0b;
    --color-warning-600: #d97706;
    
    --color-error-50: #fef2f2;
    --color-error-500: #ef4444;
    --color-error-600: #dc2626;
    
    --color-info-50: #eff6ff;
    --color-info-500: #3b82f6;
    --color-info-600: #2563eb;

    /* ===== Spacing Scale (Tight 4px base) ===== */
    --space-0: 0;
    --space-px: 1px;
    --space-0-5: 0.125rem;  /* 2px */
    --space-1: 0.25rem;     /* 4px - base unit */
    --space-1-5: 0.375rem;  /* 6px */
    --space-2: 0.5rem;      /* 8px - default gap */
    --space-2-5: 0.625rem;  /* 10px */
    --space-3: 0.75rem;     /* 12px - comfortable */
    --space-4: 1rem;        /* 16px - section spacing */
    --space-5: 1.25rem;     /* 20px */
    --space-6: 1.5rem;      /* 24px - card padding */
    --space-8: 2rem;        /* 32px - major sections */
    --space-10: 2.5rem;     /* 40px */
    --space-12: 3rem;       /* 48px - page margins */

    /* ===== Component Sizing ===== */
    /* Buttons - Compact (Vercel/Linear style) */
    --button-height-xs: 1.5rem;     /* 24px - micro actions */
    --button-height-sm: 2rem;       /* 32px - small */
    --button-height-md: 2.25rem;    /* 36px - default */
    --button-height-lg: 2.5rem;     /* 40px - primary CTAs */
    --button-height-xl: 2.75rem;    /* 44px - hero actions */

    /* Inputs - Compact sizing */
    --input-height-sm: 2rem;        /* 32px */
    --input-height-md: 2.25rem;     /* 36px - default */
    --input-height-lg: 2.5rem;      /* 40px */

    /* Mobile adjustments (optional - for critical CTAs only) */
    --button-height-mobile-lg: 2.5rem;  /* 40px - mobile primary CTAs */
    --button-height-mobile-xl: 2.75rem; /* 44px - mobile hero only */

    /* Minimum tap areas (invisible expansion) */
    --tap-area-min: 2.75rem;        /* 44px - expand via padding/pseudo-elements */

    /* ===== Borders & Radius ===== */
    /* Border Widths */
    --border-width-thin: 0.5px;
    --border-width-default: 1px;
    --border-width-thick: 2px;

    /* Border Radius - Sharp edges */
    --radius-none: 0;
    --radius-xs: 0.125rem;   /* 2px - ultra sharp */
    --radius-sm: 0.1875rem;  /* 3px - default */
    --radius-md: 0.25rem;    /* 4px - cards */
    --radius-lg: 0.375rem;   /* 6px - modals */
    --radius-xl: 0.5rem;     /* 8px - max */
    --radius-full: 9999px;   /* pills only */

    /* ===== Shadows (None - use borders) ===== */
    --shadow-none: none;
    --shadow-border: 0 0 0 1px var(--color-border-primary);
    --shadow-border-strong: 0 0 0 1px var(--color-border-secondary);
    
    /* Only for critical floating elements */
    --shadow-dropdown: 0 2px 8px rgb(0 0 0 / 0.08);
    --shadow-modal: 0 4px 16px rgb(0 0 0 / 0.12);

    /* Focus Ring */
    --shadow-focus: 0 0 0 2px var(--color-gray-0), 0 0 0 4px var(--color-brand-500);

    /* ===== Animation Tokens ===== */
    /* Durations - FAST only */
    --duration-instant: 0ms;
    --duration-fast: 50ms;    /* Hover states */
    --duration-normal: 100ms; /* Max for any animation */
    --duration-page: 150ms;   /* Page transitions only */

    /* Easings - Sharp and snappy */
    --ease-linear: linear;
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);

    /* ===== Z-Index Scale ===== */
    --z-base: 0;
    --z-dropdown: 10;
    --z-sticky: 20;
    --z-fixed: 30;
    --z-modal-backdrop: 40;
    --z-modal: 50;
    --z-popover: 60;
    --z-tooltip: 70;
    --z-notification: 80;
    --z-max: 99999;

    /* ===== Semantic Mappings ===== */
    /* Layout */
    --container-max: 1280px;
    --container-padding: var(--space-4);
    --header-height: 3.5rem;  /* 56px */
    --sidebar-width: 14rem;   /* 224px */

    /* Light Mode (Default) */
    --color-bg-primary: var(--color-gray-0);
    --color-bg-secondary: var(--color-gray-50);
    --color-bg-tertiary: var(--color-gray-100);
    --color-bg-inverse: var(--color-gray-900);

    --color-surface-primary: var(--color-gray-0);
    --color-surface-secondary: var(--color-gray-50);
    --color-surface-tertiary: var(--color-gray-100);
    --color-surface-hover: var(--color-gray-100);
    --color-surface-active: var(--color-gray-200);

    --color-text-primary: var(--color-gray-900);
    --color-text-secondary: var(--color-gray-600);
    --color-text-tertiary: var(--color-gray-500);
    --color-text-placeholder: var(--color-gray-400);
    --color-text-inverse: var(--color-gray-0);

    --color-border-primary: var(--color-gray-200);
    --color-border-secondary: var(--color-gray-300);
    --color-border-hover: var(--color-gray-400);
    --color-border-focus: var(--color-brand-500);

    /* Component-specific */
    --button-primary-bg: var(--color-brand-500);
    --button-primary-bg-hover: var(--color-brand-600);
    --button-primary-text: var(--color-gray-0);

    --input-bg: var(--color-gray-0);
    --input-border: var(--color-gray-300);
    --input-border-hover: var(--color-gray-400);
    --input-border-focus: var(--color-brand-500);
  }

  /* Dark Mode */
  .dark {
    --color-bg-primary: var(--color-gray-950);
    --color-bg-secondary: var(--color-gray-900);
    --color-bg-tertiary: var(--color-gray-800);
    --color-bg-inverse: var(--color-gray-0);

    --color-surface-primary: var(--color-gray-900);
    --color-surface-secondary: var(--color-gray-800);
    --color-surface-tertiary: var(--color-gray-700);
    --color-surface-hover: var(--color-gray-800);
    --color-surface-active: var(--color-gray-700);

    --color-text-primary: var(--color-gray-50);
    --color-text-secondary: var(--color-gray-400);
    --color-text-tertiary: var(--color-gray-500);
    --color-text-placeholder: var(--color-gray-600);
    --color-text-inverse: var(--color-gray-900);

    --color-border-primary: var(--color-gray-800);
    --color-border-secondary: var(--color-gray-700);
    --color-border-hover: var(--color-gray-600);
    --color-border-focus: var(--color-brand-500);

    --button-primary-bg: var(--color-brand-600);
    --button-primary-bg-hover: var(--color-brand-700);
    --button-primary-text: var(--color-gray-0);

    --input-bg: var(--color-gray-900);
    --input-border: var(--color-gray-700);
    --input-border-hover: var(--color-gray-600);
    --input-border-focus: var(--color-brand-500);

    /* Adjust shadows for dark mode */
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.2);
    --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 4px 8px -2px rgb(0 0 0 / 0.4);
    --shadow-xl: 0 8px 16px -4px rgb(0 0 0 / 0.5);
  }
}
```

### 2. Tailwind Configuration

```javascript
// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        gray: {
          0: 'var(--color-gray-0)',
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
          950: 'var(--color-gray-950)',
        },
        // Semantic colors
        background: 'var(--color-bg-primary)',
        surface: 'var(--color-surface-primary)',
        foreground: 'var(--color-text-primary)',
        border: 'var(--color-border-primary)',
      },
      spacing: {
        // Map spacing tokens
        0: 'var(--space-0)',
        px: 'var(--space-px)',
        0.5: 'var(--space-0-5)',
        1: 'var(--space-1)',
        1.5: 'var(--space-1-5)',
        2: 'var(--space-2)',
        2.5: 'var(--space-2-5)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
      },
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--leading-tight)' }],
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-snug)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-snug)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        md: ['var(--text-md)', { lineHeight: 'var(--leading-normal)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-normal)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-snug)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-none)' }],
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        border: 'var(--shadow-border)',
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        bounce: 'var(--ease-bounce)',
        snappy: 'var(--ease-snappy)',
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        notification: 'var(--z-notification)',
        max: 'var(--z-max)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};
```

### 3. Base Styles

```css
/* /src/lib/styles/base.css */
@layer base {
  /* Modern CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    /* Prevent font size inflation */
    text-size-adjust: none;
    -webkit-text-size-adjust: none;
    /* Smooth scrolling */
    scroll-behavior: smooth;
    /* Better font rendering */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Prevent tap delay on touch devices */
    touch-action: manipulation;
  }

  body {
    min-height: 100vh;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    font-feature-settings: 'rlig' 1, 'calt' 1, 'ss01' 1;
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Selection */
  ::selection {
    background: var(--color-brand-200);
    color: var(--color-gray-900);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }

  /* Typography defaults */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: var(--font-semibold);
    letter-spacing: var(--tracking-tight);
  }

  /* Links */
  a {
    color: var(--color-brand-600);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
  }

  /* Code */
  code, kbd, pre, samp {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  /* Forms */
  input, textarea, select, button {
    font: inherit;
    color: inherit;
  }

  /* Images */
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### 4. Utility Classes

```css
/* /src/lib/styles/utilities.css */
@layer utilities {
  /* Layout */
  .container {
    width: 100%;
    max-width: var(--container-max);
    margin-inline: auto;
    padding-inline: var(--container-padding);
  }

  /* Typography utilities */
  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  /* Truncation */
  .truncate-lines {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .truncate-2 {
    -webkit-line-clamp: 2;
  }

  .truncate-3 {
    -webkit-line-clamp: 3;
  }

  /* Button sizes (compact) */
  .btn-xs {
    height: var(--button-height-xs);
    padding-inline: var(--space-2);
    font-size: var(--text-xs);
    gap: var(--space-1);
  }

  .btn-sm {
    height: var(--button-height-sm);
    padding-inline: var(--space-2-5);
    font-size: var(--text-sm);
    gap: var(--space-1);
  }

  .btn-md {
    height: var(--button-height-md);
    padding-inline: var(--space-3);
    font-size: var(--text-sm);
    gap: var(--space-1-5);
  }

  .btn-lg {
    height: var(--button-height-lg);
    padding-inline: var(--space-4);
    font-size: var(--text-base);
    gap: var(--space-2);
  }

  /* Input sizes */
  .input-sm {
    height: var(--input-height-sm);
    padding-inline: var(--space-2);
    font-size: var(--text-sm);
  }

  .input-md {
    height: var(--input-height-md);
    padding-inline: var(--space-2-5);
    font-size: var(--text-sm);
  }

  .input-lg {
    height: var(--input-height-lg);
    padding-inline: var(--space-3);
    font-size: var(--text-base);
  }

  /* Micro-interactions - FAST */
  .hover-bright {
    transition: background-color var(--duration-fast) var(--ease-sharp),
                border-color var(--duration-fast) var(--ease-sharp);
  }

  .hover-bright:hover {
    filter: brightness(1.1);
  }

  .active-scale {
    transition: transform var(--duration-instant);
  }

  .active-scale:active {
    transform: scale(0.97);
  }

  /* Instant hover states */
  .instant-hover {
    transition-duration: var(--duration-instant) !important;
  }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Glass morphism */
  .glass {
    background: rgb(255 255 255 / 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgb(255 255 255 / 0.2);
  }

  .dark .glass {
    background: rgb(0 0 0 / 0.3);
    border: 1px solid rgb(255 255 255 / 0.1);
  }

  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--color-gray-200) 0%,
      var(--color-gray-100) 50%,
      var(--color-gray-200) 100%
    );
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
  }

  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Scrollbar utilities */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Touch target expansion (invisible tap area) */
  .touch-target {
    position: relative;
  }

  .touch-target::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(100%, var(--tap-area-min));
    height: max(100%, var(--tap-area-min));
    transform: translate(-50%, -50%);
  }

  /* Compact button utilities */
  @media (pointer: coarse) {
    /* On touch devices, add invisible padding for better tap targets */
    .btn-compact-safe {
      position: relative;
      /* Visual size stays compact */
    }
    
    .btn-compact-safe::after {
      content: '';
      position: absolute;
      inset: -0.5rem; /* Expands tap area by 8px on all sides */
    }
  }
}
```

### 5. Animation Library

```css
/* /src/lib/styles/animations.css */
@layer utilities {
  /* Entrance animations - INSTANT */
  .fade-in-fast {
    animation: fade-in var(--duration-fast) var(--ease-sharp);
  }

  .pop-in {
    animation: pop-in var(--duration-normal) var(--ease-sharp);
  }

  /* Page transitions only */
  .slide-in-page {
    animation: slide-in var(--duration-page) var(--ease-sharp);
  }

  /* No exit animations - instant removal */
  .remove {
    display: none !important;
  }

  /* Minimal keyframes - performance focused */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pop-in {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-in {
    from { transform: translateX(-8px); }
    to { transform: translateX(0); }
  }

  /* Loading states only - no decorative animations */
  .animate-spin {
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Skeleton loading - subtle */
  @keyframes skeleton-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }
}
```

---

## 💰 E-commerce Specific Utilities

```css
/* /src/lib/styles/ecommerce.css */
@layer utilities {
  /* Product grid - ultra dense */
  .product-grid {
    display: grid;
    gap: var(--space-2); /* 8px gaps */
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  @media (min-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  /* Price display */
  .price {
    font-variant-numeric: tabular-nums;
    font-weight: var(--font-semibold);
  }

  .price-slash {
    text-decoration: line-through;
    opacity: 0.6;
  }

  /* Product card - no shadows, borders only */
  .product-card {
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: border-color var(--duration-fast);
  }

  .product-card:hover {
    border-color: var(--color-border-hover);
  }

  /* Buy button - instant feedback */
  .btn-buy {
    background: var(--color-success-500);
    color: white;
    transition: transform var(--duration-instant);
  }

  .btn-buy:active {
    transform: scale(0.96);
  }

  /* Stock indicators */
  .in-stock { color: var(--color-success-600); }
  .low-stock { color: var(--color-warning-600); }
  .out-of-stock { color: var(--color-error-600); }

  /* Image loading - instant */
  .product-img {
    aspect-ratio: 1;
    object-fit: cover;
    background: var(--color-gray-100);
  }

  /* Quick view overlay */
  .quick-view {
    opacity: 0;
    transition: opacity var(--duration-fast);
  }

  .product-card:hover .quick-view {
    opacity: 1;
  }
}
```

---

## 🚀 Implementation Guide

### 1. Update app.css

```css
/* /src/app.css */
@import 'tailwindcss/base';
@import './lib/styles/tokens.css';
@import './lib/styles/base.css';
@import 'tailwindcss/components';
@import './lib/styles/utilities.css';
@import './lib/styles/animations.css';
@import 'tailwindcss/utilities';

/* Font imports */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/plus-jakarta-sans/600.css';
@import '@fontsource/plus-jakarta-sans/700.css';
@import '@fontsource/jetbrains-mono/400.css';
```

### 2. Component Pattern Example

```svelte
<!-- Button.svelte - Using Radix Svelte + Tailwind -->
<script lang="ts">
  import { Button as ButtonPrimitive } from 'radix-svelte';
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '$lib/utils';

  const buttonVariants = cva(
    // Base styles
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active-scale touch-target',
    {
      variants: {
        variant: {
          default: 'bg-brand-500 text-white hover:bg-brand-600',
          secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          ghost: 'hover:bg-gray-100 hover:text-gray-900',
          destructive: 'bg-error-500 text-white hover:bg-error-600',
        },
        size: {
          xs: 'btn-xs',
          sm: 'btn-sm',
          md: 'btn-md',
          lg: 'btn-lg',
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'md',
      },
    }
  );

  export let variant: VariantProps<typeof buttonVariants>['variant'] = 'default';
  export let size: VariantProps<typeof buttonVariants>['size'] = 'md';
  export let class: string = '';
</script>

<ButtonPrimitive.Root
  class={cn(buttonVariants({ variant, size }), class)}
  {...$$restProps}
>
  <slot />
</ButtonPrimitive.Root>
```

### 3. Dark Mode Toggle

```svelte
<!-- DarkModeToggle.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { Sun, Moon } from 'lucide-svelte';
  
  let isDark = $state(false);

  $effect(() => {
    if (browser) {
      isDark = document.documentElement.classList.contains('dark');
    }
  });

  function toggle() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }
</script>

<button
  onclick={toggle}
  class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  aria-label="Toggle dark mode"
>
  {#if isDark}
    <Sun class="h-5 w-5 text-yellow-500" />
  {:else}
    <Moon class="h-5 w-5 text-gray-500" />
  {/if}
</button>
```

---

## 📊 Performance Standards

### Lighthouse Configuration

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/', 'http://localhost:4173/browse'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Performance Metrics (E-commerce Critical)
- **FCP**: < 0.8s (First paint fast = higher conversion)
- **LCP**: < 1.5s (Product images visible)
- **TTI**: < 2.0s (Buy button interactive)
- **CLS**: < 0.05 (Zero layout shift)
- **TBT**: < 100ms (Instant interactions)
- **INP**: < 100ms (Instant click feedback)
- **Bundle Size**: < 100KB JS (gzipped)

---

## 🔄 Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create token files
2. Update Tailwind config
3. Install Radix Svelte
4. Set up Lighthouse CI

### Phase 2: Components (Week 2-3)
1. Migrate Button, Input, Card
2. Update color usage
3. Implement dark mode
4. Create component docs

### Phase 3: Polish (Week 4)
1. Animation system
2. Accessibility audit
3. Performance optimization
4. Documentation

---

## 📚 Resources

- [Radix Svelte Docs](https://radix-svelte.com)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)
- [Web.dev Performance](https://web.dev/performance/)

---

## ✅ Checklist

- [ ] Token system implemented
- [ ] Tailwind config updated
- [ ] Base styles applied
- [ ] Radix Svelte installed
- [ ] Dark mode working
- [ ] Lighthouse CI passing
- [ ] Component migration started
- [ ] Documentation complete

---

## 📦 Component Library

### Core UI Components (Phase 1)

#### 1. Button
```svelte
import Button from '$lib/components/ui/button.svelte';

<Button variant="default" size="md">Click me</Button>

// Variants: default, secondary, outline, ghost, destructive, link
// Sizes: xs (h-8), sm (h-9), md (h-9), lg (h-10)
```

#### 2. Input
```svelte
import Input from '$lib/components/ui/input.svelte';

<Input type="text" placeholder="Enter text..." />
// Height: h-9 (36px), rounded-md, px-3
```

#### 3. Textarea
```svelte
import Textarea from '$lib/components/ui/textarea.svelte';

<Textarea placeholder="Enter description..." rows={4} />
// Min height: min-h-[80px], rounded-md, px-3 py-2
```

#### 4. Select
```svelte
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';

<Select value={selected} onValueChange={handleChange}>
  <SelectTrigger class="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### 5. Card
```svelte
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
// Padding: p-6, gap-4, rounded-lg, border
```

#### 6. Dialog
```svelte
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';

<Dialog>
  <DialogTrigger>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Content here</div>
  </DialogContent>
</Dialog>
// Padding: p-6, rounded-lg, shadow-lg, max-w-[425px]
```

#### 7. Sheet (Drawer)
```svelte
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '$lib/components/ui/sheet';

<Sheet>
  <SheetTrigger>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
    <div>Content here</div>
  </SheetContent>
</Sheet>
// Sides: top, right, bottom, left
// Padding: p-6, w-[400px] or w-full
```

#### 8. Alert
```svelte
import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

<Alert variant="default">
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert description</AlertDescription>
</Alert>
// Variants: default, destructive
// Padding: p-4, rounded-lg, border
```

#### 9. Badge
```svelte
import Badge from '$lib/components/ui/badge.svelte';

<Badge variant="default">Badge</Badge>
// Variants: default, secondary, outline, destructive
// Size: text-xs, px-2.5 py-0.5, rounded-full
```

#### 10. Dropdown Menu
```svelte
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
// Padding: px-3 py-2, rounded-md, shadow-md, min-w-[8rem]
```

### Form Components (Phase 2A)

#### 11. Switch
```svelte
import Switch from '$lib/components/ui/switch.svelte';

<Switch checked={isEnabled} onCheckedChange={handleToggle} />
// Size: h-6 w-11, rounded-full (pill shape)
```

#### 12. Radio Group
```svelte
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
import Label from '$lib/components/ui/label.svelte';

<RadioGroup value={selected} onValueChange={handleChange}>
  <div class="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label for="r1">Option 1</Label>
  </div>
  <div class="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label for="r2">Option 2</Label>
  </div>
</RadioGroup>
// Size: h-4 w-4, rounded-full (circles)
```

#### 13. Label
```svelte
import Label from '$lib/components/ui/label.svelte';

<Label for="email">Email</Label>
<Input id="email" type="email" />
// Font: text-sm font-medium
```

#### 14. Price Range Slider
```svelte
import PriceRangeSlider from '$lib/components/ui/PriceRangeSlider.svelte';

<PriceRangeSlider
  min={0}
  max={1000}
  values={[100, 500]}
  onValuesChange={handleRangeChange}
/>
// Track: h-2 rounded-full, Thumb: h-5 w-5 rounded-full with shadow
```

### Navigation Components (Phase 2B)

#### 15. Tabs
```svelte
import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <div>Tab 1 content</div>
  </TabsContent>
  <TabsContent value="tab2">
    <div>Tab 2 content</div>
  </TabsContent>
</Tabs>
// TabsList: h-8, p-0.5, rounded-md, bg-gray-50
// TabsTrigger: px-3 py-1.5, text-sm
```

#### 16. Breadcrumb
```svelte
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink>Current Page</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
// Gap: gap-1.5, text-sm, ChevronRight separator (h-3.5 w-3.5)
```

#### 17. Pagination
```svelte
import { Pagination, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '$lib/components/ui/pagination';

<Pagination>
  <PaginationItem>
    <PaginationPrevious href="#" />
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#" isActive>1</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">2</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationEllipsis />
  </PaginationItem>
  <PaginationItem>
    <PaginationNext href="#" />
  </PaginationItem>
</Pagination>
// Button size: h-8 w-8, text-sm, rounded-md
```

### Modal Overlays (Phase 2C)

#### 18. Alert Dialog
```svelte
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '$lib/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
// Padding: p-6, rounded-lg, shadow-lg, max-w-lg
```

#### 19. Popover
```svelte
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

<Popover>
  <PopoverTrigger>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div class="grid gap-4">
      <h4 class="font-medium leading-none">Dimensions</h4>
      <p class="text-sm text-gray-600">Set the dimensions for the layer.</p>
    </div>
  </PopoverContent>
</Popover>
// Padding: p-4, rounded-md, shadow-md, w-72
```

#### 20. Tooltip
```svelte
import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

<Tooltip>
  <TooltipTrigger>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Add to library</p>
  </TooltipContent>
</Tooltip>
// Padding: px-3 py-1.5, text-xs, bg-gray-900, text-white
// Delay: 500ms default
```

### Data Display (Phase 3A)

#### 21. Table
```svelte
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
// TableHead: h-10 px-3, TableCell: p-3
```

#### 22. Data Table
```svelte
import { DataTable, DataTablePagination } from '$lib/components/ui/data-table';

<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role',
      cell: (user) => user.role.toUpperCase()
    }
  ]}
  onRowClick={handleRowClick}
/>

<DataTablePagination
  page={currentPage}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

#### 23. List
```svelte
import { List, ListItem, ListCard, ListHeader, ListDescription } from '$lib/components/ui/list';

<List spacing="normal" type="none">
  <ListItem>
    <ListCard hoverable onclick={handleClick}>
      <ListHeader>Item Title</ListHeader>
      <ListDescription>Item description text</ListDescription>
    </ListCard>
  </ListItem>
</List>
// Spacing: tight (gap-1), normal (gap-2), loose (gap-4)
// Types: none, disc, decimal
```

### Component Sizing Reference

| Component | Height | Padding | Font Size |
|-----------|---------|---------|-----------|
| Button (sm) | h-8 (32px) | px-3 | text-sm |
| Button (default) | h-9 (36px) | px-4 | text-sm |
| Button (lg) | h-10 (40px) | px-5 | text-base |
| Input | h-9 (36px) | px-3 | text-sm |
| Select | h-9 (36px) | px-3 | text-sm |
| Card | - | p-6 | - |
| Dialog | - | p-6 | - |
| Dropdown Item | - | px-3 py-2 | text-sm |
| Table Cell | - | p-3 | text-sm |
| Badge | - | px-2.5 py-0.5 | text-xs |
| Tooltip | - | px-3 py-1.5 | text-xs |

---

*This guide represents a professional, scalable design system inspired by industry leaders like Vercel, Stripe, and Linear. Follow it closely for consistent, performant UI.*