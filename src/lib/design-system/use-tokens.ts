// Helper utilities for using design tokens in components

// Color utilities
export const colors = {
  primary: {
    DEFAULT: 'var(--color-primary-500)',
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
  },
  neutral: {
    0: 'var(--color-neutral-0)',
    50: 'var(--color-neutral-50)',
    100: 'var(--color-neutral-100)',
    200: 'var(--color-neutral-200)',
    300: 'var(--color-neutral-300)',
    400: 'var(--color-neutral-400)',
    500: 'var(--color-neutral-500)',
    600: 'var(--color-neutral-600)',
    700: 'var(--color-neutral-700)',
    800: 'var(--color-neutral-800)',
    900: 'var(--color-neutral-900)',
  },
  semantic: {
    success: 'var(--color-success-main)',
    'success-light': 'var(--color-success-light)',
    'success-dark': 'var(--color-success-dark)',
    warning: 'var(--color-warning-main)',
    'warning-light': 'var(--color-warning-light)',
    'warning-dark': 'var(--color-warning-dark)',
    error: 'var(--color-error-main)',
    'error-light': 'var(--color-error-light)',
    'error-dark': 'var(--color-error-dark)',
    info: 'var(--color-info-main)',
    'info-light': 'var(--color-info-light)',
    'info-dark': 'var(--color-info-dark)',
  },
  condition: {
    'new-with-tags': 'var(--color-condition-new-with-tags)',
    'new-without-tags': 'var(--color-condition-new-without-tags)',
    'very-good': 'var(--color-condition-very-good)',
    good: 'var(--color-condition-good)',
    fair: 'var(--color-condition-fair)',
  }
};

// Typography utilities
export const typography = {
  size: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
    '5xl': 'var(--text-5xl)',
  },
  weight: {
    light: 'var(--font-light)',
    normal: 'var(--font-normal)',
    medium: 'var(--font-medium)',
    semibold: 'var(--font-semibold)',
    bold: 'var(--font-bold)',
  },
  lineHeight: {
    tight: 'var(--leading-tight)',
    snug: 'var(--leading-snug)',
    normal: 'var(--leading-normal)',
    relaxed: 'var(--leading-relaxed)',
  }
};

// Spacing utilities
export const spacing = {
  0: 'var(--space-0)',
  '0.5': 'var(--space-0-5)',
  1: 'var(--space-1)',
  '1.5': 'var(--space-1-5)',
  2: 'var(--space-2)',
  '2.5': 'var(--space-2-5)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
};

// Component sizes
export const componentSizes = {
  button: {
    xs: 'var(--button-height-xs)',
    sm: 'var(--button-height-sm)',
    md: 'var(--button-height-md)',
    lg: 'var(--button-height-lg)',
    xl: 'var(--button-height-xl)',
  },
  input: {
    sm: 'var(--input-height-sm)',
    md: 'var(--input-height-md)',
    lg: 'var(--input-height-lg)',
  },
  badge: {
    sm: 'var(--badge-height-sm)',
    md: 'var(--badge-height-md)',
    lg: 'var(--badge-height-lg)',
  }
};

// Border radius
export const radius = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
};

// Shadows
export const shadows = {
  none: 'var(--shadow-none)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  border: 'var(--shadow-border)',
};

// Animation
export const animation = {
  duration: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  },
  easing: {
    default: 'var(--ease-default)',
    bounce: 'var(--ease-bounce)',
  }
};

// Helper function to apply compact styles
export function compact(baseClass: string, compactClass?: string): string {
  return compactClass || baseClass;
}

// Common component styles using tokens
export const commonStyles = {
  // Card styles
  card: {
    base: 'bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]',
    hover: 'hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--duration-fast)]',
    compact: 'p-[var(--space-3)]',
    normal: 'p-[var(--space-4)]',
    spacious: 'p-[var(--space-6)]',
  },
  
  // Form styles
  input: {
    base: 'border border-gray-200 rounded-[var(--radius-md)] bg-white text-[var(--text-sm)] transition-all duration-[var(--duration-fast)]',
    focus: 'focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-opacity-20',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  },
  
  // Text styles
  text: {
    heading: {
      h1: 'text-[var(--text-4xl)] font-[var(--font-bold)] leading-[var(--leading-tight)]',
      h2: 'text-[var(--text-3xl)] font-[var(--font-semibold)] leading-[var(--leading-tight)]',
      h3: 'text-[var(--text-2xl)] font-[var(--font-semibold)] leading-[var(--leading-snug)]',
      h4: 'text-[var(--text-xl)] font-[var(--font-medium)] leading-[var(--leading-snug)]',
    },
    body: {
      large: 'text-[var(--text-lg)] leading-[var(--leading-normal)]',
      base: 'text-[var(--text-base)] leading-[var(--leading-normal)]',
      small: 'text-[var(--text-sm)] leading-[var(--leading-normal)]',
      tiny: 'text-[var(--text-xs)] leading-[var(--leading-snug)]',
    }
  }
};