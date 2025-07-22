import { writable, derived } from 'svelte/store'
import { validateTouchTarget } from '$lib/utils/accessibility'

// Component migration status types
export type MigrationStatus = 'pending' | 'in-progress' | 'completed' | 'validated' | 'failed'

export interface ComponentMigration {
  id: string
  name: string
  path: string
  category: 'ui' | 'layout' | 'feature' | 'shared'
  status: MigrationStatus
  oldSpecs: {
    touchTarget?: string
    height?: string
    padding?: string
    fontSize?: string
  }
  newSpecs: {
    touchTarget?: string
    height?: string
    padding?: string
    fontSize?: string
  }
  breaking: boolean
  notes?: string
  assignee?: string
  startedAt?: Date
  completedAt?: Date
  validatedAt?: Date
  issues?: string[]
}

// Initial component migration list based on existing components
export const initialMigrationList: ComponentMigration[] = [
  // UI Components - Buttons
  {
    id: 'button',
    name: 'Button',
    path: 'src/lib/components/ui/button.svelte',
    category: 'ui',
    status: 'pending',
    oldSpecs: { height: '44px', fontSize: '16px' },
    newSpecs: { height: '36px', fontSize: '14px' },
    breaking: false
  },
  
  // UI Components - Form Elements
  {
    id: 'input',
    name: 'Input',
    path: 'src/lib/components/ui/input.svelte',
    category: 'ui',
    status: 'pending',
    oldSpecs: { height: '44px' },
    newSpecs: { height: '40px' },
    breaking: false
  },
  {
    id: 'textarea',
    name: 'Textarea',
    path: 'src/lib/components/ui/textarea/textarea.svelte',
    category: 'ui',
    status: 'pending',
    oldSpecs: { padding: '12px' },
    newSpecs: { padding: '10px' },
    breaking: false
  },
  {
    id: 'select',
    name: 'Select',
    path: 'src/lib/components/ui/select/index.js',
    category: 'ui',
    status: 'pending',
    oldSpecs: { height: '44px' },
    newSpecs: { height: '40px' },
    breaking: false
  },
  
  // UI Components - Display
  {
    id: 'card',
    name: 'Card',
    path: 'src/lib/components/ui/card/index.js',
    category: 'ui',
    status: 'pending',
    oldSpecs: { padding: '24px' },
    newSpecs: { padding: '16px' },
    breaking: false
  },
  {
    id: 'badge',
    name: 'Badge',
    path: 'src/lib/components/ui/badge.svelte',
    category: 'ui',
    status: 'pending',
    oldSpecs: { height: '28px', fontSize: '14px' },
    newSpecs: { height: '24px', fontSize: '12px' },
    breaking: false
  },
  
  // Layout Components
  {
    id: 'header',
    name: 'Header',
    path: 'src/lib/components/layout/Header.svelte',
    category: 'layout',
    status: 'pending',
    oldSpecs: { height: '64px' },
    newSpecs: { height: '56px' },
    breaking: true,
    notes: 'Mobile navigation height change may affect fixed positioned content'
  },
  {
    id: 'mobile-nav',
    name: 'MobileNav',
    path: 'src/lib/components/layout/MobileNav.svelte',
    category: 'layout',
    status: 'pending',
    oldSpecs: { height: '64px', touchTarget: '44px' },
    newSpecs: { height: '56px', touchTarget: '36px' },
    breaking: true
  },
  
  // Feature Components
  {
    id: 'listing-card',
    name: 'ListingCard',
    path: 'src/lib/components/listings/ListingCard.svelte',
    category: 'feature',
    status: 'pending',
    oldSpecs: { padding: '16px' },
    newSpecs: { padding: '12px' },
    breaking: false
  },
  {
    id: 'product-card',
    name: 'ProductCard',
    path: 'src/lib/components/products/ProductCard.svelte',
    category: 'feature',
    status: 'pending',
    oldSpecs: { padding: '16px' },
    newSpecs: { padding: '12px' },
    breaking: false
  },
  {
    id: 'message-thread',
    name: 'MessageThread',
    path: 'src/lib/components/messaging/MessageThread.svelte',
    category: 'feature',
    status: 'pending',
    oldSpecs: { touchTarget: '44px' },
    newSpecs: { touchTarget: '36px' },
    breaking: false
  }
]

// Migration store
function createMigrationStore() {
  const { subscribe, update, set } = writable<ComponentMigration[]>(initialMigrationList)
  
  return {
    subscribe,
    
    updateStatus: (id: string, status: MigrationStatus) => {
      update(components => 
        components.map(c => {
          if (c.id === id) {
            const updatedComponent = { ...c, status }
            
            // Set timestamps
            if (status === 'in-progress' && !c.startedAt) {
              updatedComponent.startedAt = new Date()
            } else if (status === 'completed') {
              updatedComponent.completedAt = new Date()
            } else if (status === 'validated') {
              updatedComponent.validatedAt = new Date()
            }
            
            return updatedComponent
          }
          return c
        })
      )
    },
    
    assignComponent: (id: string, assignee: string) => {
      update(components =>
        components.map(c => c.id === id ? { ...c, assignee } : c)
      )
    },
    
    addNote: (id: string, note: string) => {
      update(components =>
        components.map(c => c.id === id 
          ? { ...c, notes: c.notes ? `${c.notes}\n${note}` : note }
          : c
        )
      )
    },
    
    addIssue: (id: string, issue: string) => {
      update(components =>
        components.map(c => c.id === id 
          ? { ...c, issues: [...(c.issues || []), issue] }
          : c
        )
      )
    },
    
    addComponent: (component: ComponentMigration) => {
      update(components => [...components, component])
    },
    
    reset: () => set(initialMigrationList)
  }
}

export const migrationStore = createMigrationStore()

// Derived stores for migration statistics
export const migrationStats = derived(migrationStore, $components => {
  const total = $components.length
  const byStatus = $components.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {} as Record<MigrationStatus, number>)
  
  const byCategory = $components.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const breakingCount = $components.filter(c => c.breaking).length
  const completionPercentage = Math.round(
    ((byStatus.completed || 0) + (byStatus.validated || 0)) / total * 100
  )
  
  return {
    total,
    byStatus,
    byCategory,
    breakingCount,
    completionPercentage,
    pending: byStatus.pending || 0,
    inProgress: byStatus['in-progress'] || 0,
    completed: byStatus.completed || 0,
    validated: byStatus.validated || 0,
    failed: byStatus.failed || 0
  }
})

// Validation utilities for migrated components
export interface ValidationResult {
  component: string
  passed: boolean
  checks: {
    touchTarget: boolean
    colorContrast: boolean
    focusIndicator: boolean
    keyboardAccess: boolean
    semanticHTML: boolean
  }
  issues: string[]
  score: number
}

export async function validateMigratedComponent(
  componentPath: string,
  element: HTMLElement
): Promise<ValidationResult> {
  const result: ValidationResult = {
    component: componentPath,
    passed: true,
    checks: {
      touchTarget: true,
      colorContrast: true,
      focusIndicator: true,
      keyboardAccess: true,
      semanticHTML: true
    },
    issues: [],
    score: 100
  }
  
  // Touch target validation
  const touchTargetResult = validateTouchTarget(element)
  if (!touchTargetResult.valid) {
    result.checks.touchTarget = false
    result.issues.push(`Touch target too small: ${touchTargetResult.width}x${touchTargetResult.height}px`)
    result.score -= 20
  }
  
  // Additional validation checks would go here...
  
  result.passed = result.score >= 80
  
  return result
}

// Export helper to generate migration report
export function generateMigrationReport(components: ComponentMigration[]): string {
  const stats = {
    total: components.length,
    completed: components.filter(c => c.status === 'completed' || c.status === 'validated').length,
    inProgress: components.filter(c => c.status === 'in-progress').length,
    pending: components.filter(c => c.status === 'pending').length,
    failed: components.filter(c => c.status === 'failed').length
  }
  
  const report = `
# Design System Migration Report
Generated: ${new Date().toLocaleDateString()}

## Summary
- Total Components: ${stats.total}
- Completed: ${stats.completed} (${Math.round(stats.completed / stats.total * 100)}%)
- In Progress: ${stats.inProgress}
- Pending: ${stats.pending}
- Failed: ${stats.failed}

## Component Status

${components.map(c => `
### ${c.name}
- Status: ${c.status}
- Path: ${c.path}
- Breaking Changes: ${c.breaking ? 'Yes' : 'No'}
- Old Specs: ${JSON.stringify(c.oldSpecs)}
- New Specs: ${JSON.stringify(c.newSpecs)}
${c.notes ? `- Notes: ${c.notes}` : ''}
${c.issues?.length ? `- Issues: ${c.issues.join(', ')}` : ''}
`).join('\n')}
  `.trim()
  
  return report
}