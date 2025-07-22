import { tokens } from './tokens'

// Re-export color tokens for easier access
export const colors = tokens.colors

// Semantic color mappings for light theme
export const lightTheme = {
  background: colors.neutral[0],
  surface: colors.neutral[0],
  surfaceSecondary: colors.neutral[50],
  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textTertiary: colors.neutral[500],
  border: colors.neutral[200],
  borderHover: colors.neutral[300],
  
  // Brand colors
  primary: colors.brand[500],
  primaryHover: colors.brand[600],
  primaryActive: colors.brand[700],
  primaryContrast: colors.neutral[0],
  
  // Semantic colors
  success: colors.semantic.success.main,
  successLight: colors.semantic.success.light,
  successDark: colors.semantic.success.dark,
  
  warning: colors.semantic.warning.main,
  warningLight: colors.semantic.warning.light,
  warningDark: colors.semantic.warning.dark,
  
  error: colors.semantic.error.main,
  errorLight: colors.semantic.error.light,
  errorDark: colors.semantic.error.dark,
  
  info: colors.semantic.info.main,
  infoLight: colors.semantic.info.light,
  infoDark: colors.semantic.info.dark,
}

// Semantic color mappings for dark theme
export const darkTheme = {
  background: colors.neutral[950],
  surface: colors.neutral[900],
  surfaceSecondary: colors.neutral[800],
  textPrimary: colors.neutral[50],
  textSecondary: colors.neutral[400],
  textTertiary: colors.neutral[500],
  border: colors.neutral[800],
  borderHover: colors.neutral[700],
  
  // Brand colors
  primary: colors.brand[500],
  primaryHover: colors.brand[400],
  primaryActive: colors.brand[300],
  primaryContrast: colors.neutral[950],
  
  // Semantic colors
  success: colors.semantic.success.main,
  successLight: colors.semantic.success.dark,
  successDark: colors.semantic.success.light,
  
  warning: colors.semantic.warning.main,
  warningLight: colors.semantic.warning.dark,
  warningDark: colors.semantic.warning.light,
  
  error: colors.semantic.error.main,
  errorLight: colors.semantic.error.dark,
  errorDark: colors.semantic.error.light,
  
  info: colors.semantic.info.main,
  infoLight: colors.semantic.info.dark,
  infoDark: colors.semantic.info.light,
}

// Color utility functions
export function getColorWithOpacity(color: string, opacity: number): string {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Get contrast color (for text on colored backgrounds)
export function getContrastColor(backgroundColor: string): string {
  // Simple luminance calculation
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? colors.neutral[900] : colors.neutral[0]
}

// Check color contrast ratio (WCAG compliance)
export function checkContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Theme type
export type Theme = typeof lightTheme