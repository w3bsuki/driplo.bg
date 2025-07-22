import { tokens } from './tokens'

// Re-export spacing tokens for easier access
export const spacing = tokens.spacing

// Common spacing patterns
export const spacingPatterns = {
  // Component padding
  componentPaddingXs: spacing[2],     // 8px
  componentPaddingSm: spacing[3],     // 12px
  componentPaddingMd: spacing[4],     // 16px
  componentPaddingLg: spacing[5],     // 20px
  componentPaddingXl: spacing[6],     // 24px
  
  // Section spacing
  sectionSpacingSm: spacing[8],       // 32px
  sectionSpacingMd: spacing[12],      // 48px
  sectionSpacingLg: spacing[16],      // 64px
  sectionSpacingXl: spacing[20],      // 80px
  
  // Gap spacing for flexbox/grid
  gapXs: spacing[1],                  // 4px
  gapSm: spacing[2],                  // 8px
  gapMd: spacing[3],                  // 12px
  gapLg: spacing[4],                  // 16px
  gapXl: spacing[5],                  // 20px
  
  // Icon spacing
  iconSpacingXs: spacing[1],          // 4px
  iconSpacingSm: spacing[2],          // 8px
  iconSpacingMd: spacing[3],          // 12px
  
  // Form element spacing
  formFieldGap: spacing[4],           // 16px
  formGroupGap: spacing[6],           // 24px
  formSectionGap: spacing[8],         // 32px
  
  // Mobile-specific spacing
  mobilePaddingX: spacing[4],         // 16px
  mobilePaddingY: spacing[3],         // 12px
  mobileGap: spacing[3],              // 12px
}

// Spacing utility functions
export function getSpacingValue(key: keyof typeof spacing): string {
  return spacing[key]
}

export function multiplySpacing(key: keyof typeof spacing, multiplier: number): string {
  const value = parseFloat(spacing[key])
  const unit = spacing[key].replace(/[0-9.-]/g, '')
  return `${value * multiplier}${unit}`
}

// Common margin/padding utilities
export const marginUtils = {
  auto: 'auto',
  center: '0 auto',
  none: spacing[0],
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[10],
  '3xl': spacing[12],
}

export const paddingUtils = {
  none: spacing[0],
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[10],
  '3xl': spacing[12],
}

// Touch target sizes (for accessibility)
export const touchTargets = {
  minimum: spacing[8],      // 32px - absolute minimum
  small: spacing[9],        // 36px - small buttons
  medium: spacing[10],      // 40px - standard inputs
  large: spacing[11],       // 44px - primary CTAs
  xl: spacing[12],          // 48px - mobile-optimized
}

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  notification: 700,
  max: 999,
}