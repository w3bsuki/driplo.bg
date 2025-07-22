// Central export point for the design system
export * from './tokens'
export * from './colors'
export * from './spacing'
export * from './typography'
export * from './animation'

// Re-export commonly used values
export { tokens } from './tokens'
export { colors, lightTheme, darkTheme } from './colors'
export { spacing, spacingPatterns, touchTargets, zIndex } from './spacing'
export { typography, typographyPresets } from './typography'
export { animation, animationPresets, transitions, motionEnabled } from './animation'

// Design system metadata
export const designSystem = {
  name: 'Driplo Modern Design System',
  version: '1.0.0',
  created: '2025-01-22',
  description: 'A modern, accessible design system for the Driplo marketplace'
}

// Quick reference for developers
export const quickReference = {
  // Primary brand color
  primaryColor: '#87CEEB',
  
  // Touch target sizes
  minTouchTarget: '32px',
  standardButton: '36px',
  primaryCTA: '40px',
  mobileOptimized: '44px',
  
  // Common breakpoints
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
  
  // Animation durations
  fastAnimation: '150ms',
  normalAnimation: '200ms',
  slowAnimation: '300ms',
  
  // Font stacks
  sansFont: 'Inter, system-ui, -apple-system, sans-serif',
  monoFont: 'JetBrains Mono, monospace',
  displayFont: 'Plus Jakarta Sans, sans-serif',
}