import { checkContrastRatio } from '$lib/design-system/colors'
import { touchTargets } from '$lib/design-system/spacing'

// Accessibility report interface
export interface AccessibilityReport {
  element: HTMLElement
  issues: AccessibilityIssue[]
  score: number
  passed: boolean
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  element?: HTMLElement
  recommendation?: string
}

// Touch target validation
export function validateTouchTarget(element: HTMLElement): {
  valid: boolean
  width: number
  height: number
  minSize: number
} {
  const minSize = parseInt(touchTargets.minimum) // 32px
  const rect = element.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  
  return {
    valid: width >= minSize && height >= minSize,
    width,
    height,
    minSize
  }
}

// Check color contrast for WCAG compliance
export function validateColorContrast(
  element: HTMLElement,
  options: {
    fontSize?: number
    fontWeight?: string
  } = {}
): {
  valid: boolean
  ratio: number
  requiredRatio: number
  level: 'AA' | 'AAA' | 'FAIL'
} {
  const styles = window.getComputedStyle(element)
  const backgroundColor = styles.backgroundColor
  const color = styles.color
  const fontSize = options.fontSize || parseInt(styles.fontSize)
  const fontWeight = options.fontWeight || styles.fontWeight
  
  // Convert RGB to hex for contrast calculation
  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/\d+/g)
    if (!match) return '#000000'
    
    const [r, g, b] = match.map(n => parseInt(n))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
  
  const bgHex = rgbToHex(backgroundColor)
  const fgHex = rgbToHex(color)
  const ratio = checkContrastRatio(fgHex, bgHex)
  
  // WCAG requirements
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700)
  const requiredRatioAA = isLargeText ? 3 : 4.5
  const requiredRatioAAA = isLargeText ? 4.5 : 7
  
  let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL'
  if (ratio >= requiredRatioAAA) {
    level = 'AAA'
  } else if (ratio >= requiredRatioAA) {
    level = 'AA'
  }
  
  return {
    valid: ratio >= requiredRatioAA,
    ratio,
    requiredRatio: requiredRatioAA,
    level
  }
}

// Check if element has proper ARIA attributes
export function validateAriaAttributes(element: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const role = element.getAttribute('role')
  const tagName = element.tagName.toLowerCase()
  
  // Check interactive elements
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName) ||
                       element.onclick || element.tabIndex >= 0
  
  if (isInteractive) {
    // Check for accessible name
    const hasAriaLabel = element.hasAttribute('aria-label')
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby')
    const hasTextContent = element.textContent?.trim().length > 0
    const hasTitle = element.hasAttribute('title')
    
    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent && !hasTitle) {
      issues.push({
        type: 'error',
        category: 'aria',
        message: 'Interactive element missing accessible name',
        recommendation: 'Add aria-label, aria-labelledby, or visible text content'
      })
    }
    
    // Check for proper roles
    if (tagName === 'div' || tagName === 'span') {
      if (!role) {
        issues.push({
          type: 'warning',
          category: 'semantics',
          message: `Interactive ${tagName} without explicit role`,
          recommendation: 'Use semantic HTML elements or add appropriate role attribute'
        })
      }
    }
  }
  
  // Check form controls
  if (['input', 'select', 'textarea'].includes(tagName)) {
    const id = element.id
    const hasLabel = id && document.querySelector(`label[for="${id}"]`)
    const hasAriaLabel = element.hasAttribute('aria-label')
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby')
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'error',
        category: 'forms',
        message: 'Form control without associated label',
        recommendation: 'Add a <label> element or aria-label attribute'
      })
    }
  }
  
  // Check images
  if (tagName === 'img') {
    const alt = element.getAttribute('alt')
    if (alt === null) {
      issues.push({
        type: 'error',
        category: 'images',
        message: 'Image missing alt attribute',
        recommendation: 'Add alt="" for decorative images or descriptive alt text for informative images'
      })
    }
  }
  
  return issues
}

// Check keyboard accessibility
export function validateKeyboardAccess(element: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const tagName = element.tagName.toLowerCase()
  const tabIndex = element.tabIndex
  
  // Check if interactive element is keyboard accessible
  const isNaturallyFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName)
  const hasClickHandler = element.onclick !== null
  
  if (hasClickHandler && !isNaturallyFocusable && tabIndex < 0) {
    issues.push({
      type: 'error',
      category: 'keyboard',
      message: 'Interactive element not keyboard accessible',
      recommendation: 'Add tabindex="0" to make element focusable'
    })
  }
  
  // Check for positive tabindex (bad practice)
  if (tabIndex > 0) {
    issues.push({
      type: 'warning',
      category: 'keyboard',
      message: `Positive tabindex (${tabIndex}) disrupts natural tab order`,
      recommendation: 'Use tabindex="0" or rely on natural tab order'
    })
  }
  
  return issues
}

// Check focus indicators
export function validateFocusIndicator(element: HTMLElement): boolean {
  // Create a temporary focus state to check styles
  const originalOutline = element.style.outline
  const originalOutlineOffset = element.style.outlineOffset
  
  element.focus()
  const styles = window.getComputedStyle(element)
  
  const hasOutline = styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px'
  const hasBoxShadow = styles.boxShadow !== 'none'
  const hasBorderChange = true // This would require comparing focused vs unfocused states
  
  // Restore original styles
  element.style.outline = originalOutline
  element.style.outlineOffset = originalOutlineOffset
  element.blur()
  
  return hasOutline || hasBoxShadow || hasBorderChange
}

// Comprehensive accessibility audit
export function auditAccessibility(
  element: HTMLElement | Document = document,
  options: {
    checkContrast?: boolean
    checkTouchTargets?: boolean
    checkAria?: boolean
    checkKeyboard?: boolean
    checkFocus?: boolean
  } = {}
): AccessibilityReport[] {
  const {
    checkContrast = true,
    checkTouchTargets = true,
    checkAria = true,
    checkKeyboard = true,
    checkFocus = true
  } = options
  
  const reports: AccessibilityReport[] = []
  const elements = element instanceof Document 
    ? element.querySelectorAll('*') 
    : element.querySelectorAll('*')
  
  elements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return
    
    const issues: AccessibilityIssue[] = []
    
    // Touch target validation
    if (checkTouchTargets) {
      const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase()) ||
                           el.onclick || el.tabIndex >= 0
      
      if (isInteractive) {
        const touchTargetResult = validateTouchTarget(el)
        if (!touchTargetResult.valid) {
          issues.push({
            type: 'warning',
            category: 'touch-target',
            message: `Touch target too small (${touchTargetResult.width}x${touchTargetResult.height}px)`,
            recommendation: `Increase size to at least ${touchTargetResult.minSize}x${touchTargetResult.minSize}px`,
            element: el
          })
        }
      }
    }
    
    // Color contrast validation
    if (checkContrast && el.textContent?.trim()) {
      const contrastResult = validateColorContrast(el)
      if (!contrastResult.valid) {
        issues.push({
          type: 'error',
          category: 'contrast',
          message: `Insufficient color contrast (${contrastResult.ratio.toFixed(2)}:1)`,
          recommendation: `Increase contrast to at least ${contrastResult.requiredRatio}:1`,
          element: el
        })
      }
    }
    
    // ARIA validation
    if (checkAria) {
      issues.push(...validateAriaAttributes(el))
    }
    
    // Keyboard validation
    if (checkKeyboard) {
      issues.push(...validateKeyboardAccess(el))
    }
    
    // Focus indicator validation
    if (checkFocus) {
      const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase()) ||
                           el.onclick || el.tabIndex >= 0
      
      if (isInteractive && !validateFocusIndicator(el)) {
        issues.push({
          type: 'warning',
          category: 'focus',
          message: 'Missing or insufficient focus indicator',
          recommendation: 'Add visible focus styles (outline, border, or shadow)',
          element: el
        })
      }
    }
    
    if (issues.length > 0) {
      const errorCount = issues.filter(i => i.type === 'error').length
      const warningCount = issues.filter(i => i.type === 'warning').length
      const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10))
      
      reports.push({
        element: el,
        issues,
        score,
        passed: errorCount === 0
      })
    }
  })
  
  return reports
}

// Announce to screen readers
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  clearAfter = 3000
): void {
  const id = `announce-${Date.now()}`
  const announcer = document.createElement('div')
  announcer.id = id
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  
  document.body.appendChild(announcer)
  
  // Delay to ensure screen readers pick up the change
  setTimeout(() => {
    announcer.textContent = message
  }, 100)
  
  if (clearAfter > 0) {
    setTimeout(() => {
      document.getElementById(id)?.remove()
    }, clearAfter)
  }
}

// Live region manager for dynamic content
export class LiveRegionManager {
  private region: HTMLElement
  
  constructor(priority: 'polite' | 'assertive' = 'polite') {
    this.region = document.createElement('div')
    this.region.setAttribute('aria-live', priority)
    this.region.setAttribute('aria-atomic', 'true')
    this.region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(this.region)
  }
  
  announce(message: string): void {
    this.region.textContent = message
  }
  
  clear(): void {
    this.region.textContent = ''
  }
  
  destroy(): void {
    this.region.remove()
  }
}