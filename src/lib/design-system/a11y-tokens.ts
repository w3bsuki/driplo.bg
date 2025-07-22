// Accessibility-specific design tokens

// WCAG contrast requirements
export const contrastRequirements = {
  // Normal text
  normal: {
    AA: 4.5,
    AAA: 7
  },
  // Large text (18pt+ or 14pt+ bold)
  large: {
    AA: 3,
    AAA: 4.5
  },
  // Non-text (UI components, graphics)
  nonText: {
    AA: 3
  }
}

// Focus indicator specifications
export const focusIndicators = {
  // Default focus ring
  default: {
    style: 'solid',
    width: '2px',
    color: 'var(--color-brand-500)',
    offset: '2px'
  },
  // High contrast focus ring
  highContrast: {
    style: 'solid',
    width: '3px',
    color: 'var(--color-neutral-900)',
    offset: '1px'
  },
  // Subtle focus (for already prominent elements)
  subtle: {
    style: 'solid',
    width: '1px',
    color: 'currentColor',
    offset: '1px',
    opacity: 0.5
  }
}

// Motion and animation preferences
export const motionPreferences = {
  // Reduced motion durations
  reduced: {
    instant: '0ms',
    fast: '0ms',
    normal: '0ms',
    slow: '0ms'
  },
  // Safe animations that respect user preferences
  safe: {
    opacity: true,
    color: true,
    backgroundColor: true,
    borderColor: true,
    boxShadow: true,
    // Avoid these with reduced motion
    transform: false,
    scale: false,
    rotate: false,
    translate: false
  }
}

// Minimum interactive element sizes
export const interactiveSizes = {
  // WCAG 2.1 Level AAA
  minimum: {
    width: '44px',
    height: '44px'
  },
  // WCAG 2.1 Level AA (with exceptions)
  standard: {
    width: '24px',
    height: '24px'
  },
  // Our recommended sizes
  recommended: {
    small: {
      width: '32px',
      height: '32px'
    },
    medium: {
      width: '36px',
      height: '36px'
    },
    large: {
      width: '44px',
      height: '44px'
    }
  }
}

// Screen reader specific tokens
export const screenReaderTokens = {
  // Visually hidden but accessible to screen readers
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0'
  },
  // Hide from screen readers
  ariaHidden: {
    'aria-hidden': 'true',
    role: 'presentation'
  }
}

// Keyboard navigation tokens
export const keyboardTokens = {
  // Common keyboard shortcuts
  shortcuts: {
    submit: ['Enter'],
    cancel: ['Escape'],
    next: ['Tab', 'ArrowDown', 'ArrowRight'],
    previous: ['Shift+Tab', 'ArrowUp', 'ArrowLeft'],
    first: ['Home'],
    last: ['End'],
    select: ['Space', 'Enter'],
    selectAll: ['Ctrl+A', 'Cmd+A'],
    search: ['Ctrl+F', 'Cmd+F', '/']
  },
  // Focus trap behavior
  focusTrap: {
    tabBoundary: true,
    escapeDeactivates: true,
    clickOutsideDeactivates: true,
    returnFocusOnDeactivate: true
  }
}

// Color blind safe palettes
export const colorBlindSafePalettes = {
  // Optimized for different types of color blindness
  deuteranopia: {
    // Red-green color blindness (most common)
    primary: '#0173B2',
    secondary: '#DE8F05',
    tertiary: '#029E73',
    quaternary: '#CC78BC',
    quinary: '#CA9161'
  },
  protanopia: {
    // Red-green color blindness
    primary: '#0173B2',
    secondary: '#ECE133',
    tertiary: '#56B4E9',
    quaternary: '#F0E442',
    quinary: '#009E73'
  },
  tritanopia: {
    // Blue-yellow color blindness
    primary: '#D55E00',
    secondary: '#CC79A7',
    tertiary: '#0072B2',
    quaternary: '#F0E442',
    quinary: '#009E73'
  }
}

// Text readability tokens
export const readabilityTokens = {
  // Optimal line length for reading
  lineLength: {
    min: '45ch',
    optimal: '66ch',
    max: '75ch'
  },
  // Line height for readability
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },
  // Paragraph spacing
  paragraphSpacing: {
    small: '0.75em',
    medium: '1em',
    large: '1.5em'
  }
}

// ARIA live region tokens
export const liveRegionTokens = {
  // Politeness levels
  politeness: {
    off: 'off',
    polite: 'polite',
    assertive: 'assertive'
  },
  // Relevance of changes
  relevant: {
    additions: 'additions',
    removals: 'removals',
    text: 'text',
    all: 'all'
  },
  // Atomicity
  atomic: {
    true: 'true',
    false: 'false'
  }
}

// High contrast mode tokens
export const highContrastTokens = {
  // Border widths for high contrast
  borderWidth: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  },
  // Colors for high contrast mode
  colors: {
    foreground: 'CanvasText',
    background: 'Canvas',
    accent: 'LinkText',
    border: 'CanvasText',
    disabled: 'GrayText'
  }
}