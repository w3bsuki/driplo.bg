import { tokens } from './tokens'

// Re-export typography tokens for easier access
export const typography = tokens.typography

// Typography presets for common use cases
export const typographyPresets = {
  // Display headings
  displayLarge: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['5xl'].size,
    lineHeight: typography.fontSize['5xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  displayMedium: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'].size,
    lineHeight: typography.fontSize['4xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  displaySmall: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Headings
  h1: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize['4xl'].size,
    lineHeight: typography.fontSize['4xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize['2xl'].size,
    lineHeight: typography.fontSize['2xl'].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  h4: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.fontSize.xl.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  h5: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  h6: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyBase: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // UI text
  labelLarge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  labelBase: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  labelSmall: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
  },
  
  // Button text
  buttonLarge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  buttonBase: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  
  // Caption text
  caption: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Code
  code: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  codeBlock: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
}

// Utility function to apply typography preset
export function applyTypography(preset: keyof typeof typographyPresets): string {
  const styles = typographyPresets[preset]
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value};`
    })
    .join(' ')
}

// Text truncation utilities
export const textTruncate = {
  singleLine: `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  multiLine: (lines: number) => `
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
}

// Responsive typography scaling
export const responsiveScale = {
  mobile: 0.875,    // 87.5% of base size
  tablet: 0.9375,   // 93.75% of base size
  desktop: 1,       // 100% base size
}

// Line height adjustments for different languages
export const lineHeightAdjustments = {
  default: 1,
  dense: 0.875,     // For languages with tall characters
  relaxed: 1.125,   // For improved readability
}