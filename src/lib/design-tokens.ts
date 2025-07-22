// Design tokens for consistent UI across the application
export const designTokens = {
  // Typography
  fontSize: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
  },
  
  fontWeight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Spacing
  spacing: {
    0: 'p-0',
    1: 'p-1',    // 4px
    2: 'p-2',    // 8px
    3: 'p-3',    // 12px
    4: 'p-4',    // 16px
    5: 'p-5',    // 20px
    6: 'p-6',    // 24px
    8: 'p-8',    // 32px
  },
  
  gap: {
    1: 'gap-1',    // 4px
    2: 'gap-2',    // 8px
    3: 'gap-3',    // 12px
    4: 'gap-4',    // 16px
    6: 'gap-6',    // 24px
  },
  
  // Heights
  height: {
    input: 'h-11',      // 44px - proper touch target
    button: 'h-11',     // 44px - matches input
    buttonLg: 'h-12',   // 48px - primary actions
    buttonSm: 'h-9',    // 36px - secondary actions
  },
  
  // Border radius
  radius: {
    sm: 'rounded-sm',     // 2px
    md: 'rounded-md',     // 6px
    lg: 'rounded-lg',     // 8px
    xl: 'rounded-xl',     // 12px
    '2xl': 'rounded-2xl', // 16px
    full: 'rounded-full',
  },
  
  // Colors - form specific
  colors: {
    input: {
      border: {
        default: 'border-gray-200',
        hover: 'hover:border-gray-300',
        focus: 'focus:border-blue-500',
        error: 'border-red-300',
        success: 'border-green-300',
      },
      bg: {
        default: 'bg-white',
        disabled: 'bg-gray-50',
      },
      text: {
        default: 'text-gray-900',
        placeholder: 'placeholder:text-gray-400',
        disabled: 'text-gray-500',
      }
    },
    label: {
      default: 'text-gray-700',
      required: 'text-red-500',
      helper: 'text-gray-500',
      error: 'text-red-500',
    },
    button: {
      primary: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        hover: 'hover:from-blue-600 hover:to-blue-700',
        text: 'text-white',
        disabled: 'disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400',
      },
      secondary: {
        bg: 'bg-gray-100',
        hover: 'hover:bg-gray-200',
        text: 'text-gray-700',
        disabled: 'disabled:bg-gray-50 disabled:text-gray-400',
      },
      success: {
        bg: 'bg-gradient-to-r from-green-500 to-green-600',
        hover: 'hover:from-green-600 hover:to-green-700',
        text: 'text-white',
      }
    }
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  
  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  }
}

// Component-specific token compositions
export const formTokens = {
  input: {
    base: `${designTokens.height.input} w-full px-3.5 py-2.5 ${designTokens.fontSize.base} ${designTokens.radius.lg} border ${designTokens.colors.input.border.default} ${designTokens.colors.input.bg.default} ${designTokens.colors.input.text.default} ${designTokens.colors.input.text.placeholder} ${designTokens.transition.fast} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50`,
    error: `${designTokens.colors.input.border.error} focus:border-red-500 focus:ring-red-500`,
    success: `${designTokens.colors.input.border.success} focus:border-green-500 focus:ring-green-500`,
  },
  
  label: {
    base: `${designTokens.fontSize.base} ${designTokens.fontWeight.medium} ${designTokens.colors.label.default} flex items-center gap-1.5`,
    required: designTokens.colors.label.required,
    helper: `${designTokens.fontSize.sm} ${designTokens.colors.label.helper} mt-1`,
    error: `${designTokens.fontSize.sm} ${designTokens.colors.label.error} mt-1`,
  },
  
  button: {
    base: `${designTokens.fontWeight.semibold} ${designTokens.radius.xl} ${designTokens.transition.normal} flex items-center justify-center gap-2 ${designTokens.shadow.sm} hover:${designTokens.shadow.md}`,
    primary: `${designTokens.height.button} px-6 ${designTokens.colors.button.primary.bg} ${designTokens.colors.button.primary.hover} ${designTokens.colors.button.primary.text} ${designTokens.colors.button.primary.disabled}`,
    secondary: `${designTokens.height.button} px-4 ${designTokens.colors.button.secondary.bg} ${designTokens.colors.button.secondary.hover} ${designTokens.colors.button.secondary.text} ${designTokens.colors.button.secondary.disabled}`,
    large: `${designTokens.height.buttonLg} px-8 ${designTokens.fontSize.lg}`,
  },
  
  select: {
    base: `${designTokens.height.input} w-full px-3.5 py-2.5 ${designTokens.fontSize.base} ${designTokens.radius.lg} border ${designTokens.colors.input.border.default} ${designTokens.colors.input.bg.default} ${designTokens.colors.input.text.default} ${designTokens.transition.fast} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50`,
  },
  
  textarea: {
    base: `w-full px-3.5 py-2.5 ${designTokens.fontSize.base} ${designTokens.radius.lg} border ${designTokens.colors.input.border.default} ${designTokens.colors.input.bg.default} ${designTokens.colors.input.text.default} ${designTokens.colors.input.text.placeholder} ${designTokens.transition.fast} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none`,
  },
  
  fieldGroup: {
    base: 'space-y-2',
    withHelper: 'space-y-1.5',
  },
  
  form: {
    section: 'space-y-5',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  }
}

// Mobile-specific overrides
export const mobileTokens = {
  fontSize: {
    label: 'text-base',     // 16px on mobile for better readability
    input: 'text-base',     // 16px to prevent zoom on iOS
    button: 'text-base',    // 16px for consistency
  },
  height: {
    input: 'h-12',          // 48px on mobile
    button: 'h-12',         // 48px on mobile
  },
  padding: {
    input: 'px-4 py-3',     // More padding on mobile
    button: 'px-6 py-3',    // More padding on mobile
  }
}