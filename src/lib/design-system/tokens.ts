export interface ColorTokens {
  brand: {
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
  };
  neutral: {
    0: string;
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
  };
  semantic: {
    success: { light: string; main: string; dark: string; contrast: string };
    warning: { light: string; main: string; dark: string; contrast: string };
    error: { light: string; main: string; dark: string; contrast: string };
    info: { light: string; main: string; dark: string; contrast: string };
  };
}

export interface SpacingTokens {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
}

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
    display: string;
  };
  fontSize: {
    xs: { size: string; lineHeight: string };
    sm: { size: string; lineHeight: string };
    base: { size: string; lineHeight: string };
    lg: { size: string; lineHeight: string };
    xl: { size: string; lineHeight: string };
    '2xl': { size: string; lineHeight: string };
    '3xl': { size: string; lineHeight: string };
    '4xl': { size: string; lineHeight: string };
    '5xl': { size: string; lineHeight: string };
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface AnimationTokens {
  duration: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
    lazy: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
}

export interface ElevationTokens {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  animation: AnimationTokens;
  elevation: ElevationTokens;
  breakpoints: BreakpointTokens;
}

// Extended color utilities
export interface ExtendedColorTokens extends ColorTokens {
  accent: {
    purple: { light: string; main: string; dark: string };
    pink: { light: string; main: string; dark: string };
    cyan: { light: string; main: string; dark: string };
  };
  gradient: {
    brandToPurple: string;
    brandToCyan: string;
    purpleToPink: string;
    blueGradient: string;
    darkGradient: string;
  };
  glass: {
    white: string;
    light: string;
    dark: string;
  };
  condition: {
    newWithTags: { bg: string; text: string; border: string };
    newWithoutTags: { bg: string; text: string; border: string };
    veryGood: { bg: string; text: string; border: string };
    good: { bg: string; text: string; border: string };
    fair: { bg: string; text: string; border: string };
  };
}

export const tokens: DesignTokens & { colors: ExtendedColorTokens } = {
  // Color system with semantic naming
  colors: {
    // Brand colors - maintaining baby blue identity
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#87CEEB', // Primary baby blue
      600: '#6BB6D8',
      700: '#4F9FC5',
      800: '#3A88AE',
      900: '#1E5A7E',
      950: '#0A3A5E'
    },
    
    // Neutral palette with blue undertones for modern feel
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',   // Slight blue tint
      100: '#f1f5f9',  // Cool gray
      200: '#e2e8f0',  // Blue-gray
      300: '#cbd5e1',  // Modern gray
      400: '#94a3b8',  // Muted blue-gray
      500: '#64748b',  // Balanced gray
      600: '#475569',  // Dark blue-gray
      700: '#334155',  // Deep blue-gray
      800: '#1e293b',  // Navy-gray
      900: '#0f172a',  // Almost black with blue
      950: '#020617'   // Rich black
    },
    
    // Semantic colors
    semantic: {
      success: { light: '#dcfce7', main: '#22c55e', dark: '#16a34a', contrast: '#ffffff' },
      warning: { light: '#fef3c7', main: '#f59e0b', dark: '#d97706', contrast: '#ffffff' },
      error: { light: '#fee2e2', main: '#ef4444', dark: '#dc2626', contrast: '#ffffff' },
      info: { light: '#dbeafe', main: '#3b82f6', dark: '#2563eb', contrast: '#ffffff' }
    },
    
    // Modern accent colors
    accent: {
      purple: { light: '#f3e8ff', main: '#a855f7', dark: '#7c3aed' },
      pink: { light: '#fce7f3', main: '#ec4899', dark: '#db2777' },
      cyan: { light: '#cffafe', main: '#06b6d4', dark: '#0891b2' }
    },
    
    // Beautiful gradients
    gradient: {
      brandToPurple: 'linear-gradient(135deg, #87CEEB 0%, #a855f7 100%)',
      brandToCyan: 'linear-gradient(135deg, #87CEEB 0%, #06b6d4 100%)',
      purpleToPink: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      blueGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #87CEEB 100%)',
      darkGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    },
    
    // Glassmorphism backgrounds
    glass: {
      white: 'rgba(255, 255, 255, 0.8)',
      light: 'rgba(248, 250, 252, 0.7)',
      dark: 'rgba(15, 23, 42, 0.7)'
    },
    
    // Condition badge colors (finalized)
    condition: {
      newWithTags: {
        bg: '#10b981', // emerald-500
        text: '#ffffff',
        border: '#10b981'
      },
      newWithoutTags: {
        bg: '#3b82f6', // blue-500
        text: '#ffffff',
        border: '#3b82f6'
      },
      veryGood: {
        bg: '#8b5cf6', // violet-500
        text: '#ffffff',
        border: '#8b5cf6'
      },
      good: {
        bg: '#f59e0b', // amber-500
        text: '#030712', // gray-950 for contrast
        border: '#f59e0b'
      },
      fair: {
        bg: '#ef4444', // red-500
        text: '#ffffff',
        border: '#ef4444'
      }
    }
  },
  
  // Modern spacing scale (rem-based)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
  },
  
  // Typography system
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
      display: 'Plus Jakarta Sans, sans-serif'
    },
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
      sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
      base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
      lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
      xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px
      '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' },   // 36px
      '5xl': { size: '3rem', lineHeight: '1' },           // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em'
    }
  },
  
  // Animation tokens
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      lazy: '600ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.185, 1.85)'
    }
  },
  
  // Elevation system (modern shadows)
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  
  // Responsive breakpoints
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}