// Simplified Design System with CSS Variables
// This replaces the overcomplicated tokens.ts

export const designTokens = {
  // Typography Scale (1.25 ratio)
  typography: {
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    weight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      snug: '1.4',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    }
  },

  // Color System with proper contrast
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#87CEEB', // Main brand color
      600: '#6BB6D8',
      700: '#4F9FC5',
      800: '#3A88AE',
      900: '#1E5A7E',
    },
    
    // Neutral Scale
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    
    // Semantic Colors (WCAG AA compliant)
    semantic: {
      success: '#22c55e',
      'success-light': '#dcfce7',
      'success-dark': '#16a34a',
      
      warning: '#f59e0b',
      'warning-light': '#fef3c7',
      'warning-dark': '#d97706',
      
      error: '#ef4444',
      'error-light': '#fee2e2',
      'error-dark': '#dc2626',
      
      info: '#3b82f6',
      'info-light': '#dbeafe',
      'info-dark': '#2563eb',
    },
    
    // Condition Colors (simplified)
    condition: {
      'new-with-tags': '#10b981',    // emerald-500
      'new-without-tags': '#3b82f6', // blue-500
      'very-good': '#8b5cf6',        // violet-500
      'good': '#f59e0b',             // amber-500
      'fair': '#ef4444',             // red-500
    }
  },

  // Spacing System (8px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },

  // Shadows (elevation)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    'product': '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        xs: '2rem',     // 32px
        sm: '2.25rem',  // 36px
        md: '2.5rem',   // 40px
        lg: '2.75rem',  // 44px
        xl: '3rem',     // 48px
      },
      padding: {
        xs: '0 0.75rem',
        sm: '0 1rem',
        md: '0 1.25rem',
        lg: '0 1.5rem',
        xl: '0 2rem',
      }
    },
    badge: {
      height: {
        sm: '1.25rem',  // 20px
        md: '1.5rem',   // 24px
        lg: '1.75rem',  // 28px
      },
      padding: {
        sm: '0 0.5rem',
        md: '0 0.625rem',
        lg: '0 0.75rem',
      }
    },
    input: {
      height: {
        sm: '2.25rem',  // 36px
        md: '2.5rem',   // 40px
        lg: '2.75rem',  // 44px
      }
    }
  }
};

// Generate CSS variables from tokens
export function generateCSSVariables() {
  const cssVars: string[] = [];
  
  // Typography
  Object.entries(designTokens.typography.scale).forEach(([key, value]) => {
    cssVars.push(`--text-${key}: ${value};`);
  });
  
  Object.entries(designTokens.typography.weight).forEach(([key, value]) => {
    cssVars.push(`--font-${key}: ${value};`);
  });
  
  // Colors
  Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
    cssVars.push(`--color-primary-${key}: ${value};`);
  });
  
  Object.entries(designTokens.colors.neutral).forEach(([key, value]) => {
    cssVars.push(`--color-neutral-${key}: ${value};`);
  });
  
  Object.entries(designTokens.colors.semantic).forEach(([key, value]) => {
    cssVars.push(`--color-${key}: ${value};`);
  });
  
  Object.entries(designTokens.colors.condition).forEach(([key, value]) => {
    cssVars.push(`--color-condition-${key}: ${value};`);
  });
  
  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars.push(`--space-${key}: ${value};`);
  });
  
  // Radius
  Object.entries(designTokens.radius).forEach(([key, value]) => {
    cssVars.push(`--radius-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(designTokens.shadows).forEach(([key, value]) => {
    cssVars.push(`--shadow-${key}: ${value};`);
  });
  
  // Animation
  Object.entries(designTokens.animation.duration).forEach(([key, value]) => {
    cssVars.push(`--duration-${key}: ${value};`);
  });
  
  // Component tokens
  Object.entries(designTokens.components.button.height).forEach(([key, value]) => {
    cssVars.push(`--button-height-${key}: ${value};`);
  });
  
  Object.entries(designTokens.components.badge.height).forEach(([key, value]) => {
    cssVars.push(`--badge-height-${key}: ${value};`);
  });
  
  Object.entries(designTokens.components.input.height).forEach(([key, value]) => {
    cssVars.push(`--input-height-${key}: ${value};`);
  });
  
  return cssVars.join('\n  ');
}

// Helper to get token value
export function token(path: string): string {
  const keys = path.split('.');
  let value: any = designTokens;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return '';
  }
  
  return value;
}