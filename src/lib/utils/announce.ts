import { writable } from 'svelte/store'

// Announcement store for reactive announcements
interface Announcement {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

function createAnnouncementStore() {
  const { subscribe, update } = writable<Announcement[]>([])
  
  return {
    subscribe,
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement: Announcement = {
        id: `announce-${Date.now()}-${Math.random()}`,
        message,
        priority,
        timestamp: Date.now()
      }
      
      update(announcements => [...announcements, announcement])
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        update(announcements => 
          announcements.filter(a => a.id !== announcement.id)
        )
      }, 5000)
    },
    clear: () => update(() => [])
  }
}

export const announcements = createAnnouncementStore()

// Announcement categories for consistent messaging
export const announcementTemplates = {
  // Navigation
  pageChanged: (pageName: string) => `Navigated to ${pageName}`,
  sectionEntered: (sectionName: string) => `Entered ${sectionName} section`,
  
  // Forms
  formSubmitted: () => 'Form submitted successfully',
  formError: (errorCount: number) => 
    `Form contains ${errorCount} error${errorCount > 1 ? 's' : ''}`,
  fieldError: (fieldName: string, error: string) => 
    `${fieldName}: ${error}`,
  fieldValid: (fieldName: string) => 
    `${fieldName} is valid`,
  
  // Loading states
  loadingStarted: (itemName?: string) => 
    itemName ? `Loading ${itemName}...` : 'Loading...',
  loadingComplete: (itemName?: string) => 
    itemName ? `${itemName} loaded` : 'Loading complete',
  loadingFailed: (itemName?: string, error?: string) => 
    itemName 
      ? `Failed to load ${itemName}${error ? `: ${error}` : ''}`
      : `Loading failed${error ? `: ${error}` : ''}`,
  
  // Search
  searchResults: (count: number, query: string) => 
    count === 0 
      ? `No results found for "${query}"`
      : `${count} result${count > 1 ? 's' : ''} found for "${query}"`,
  
  // Actions
  itemAdded: (itemName: string, location?: string) => 
    location 
      ? `${itemName} added to ${location}`
      : `${itemName} added`,
  itemRemoved: (itemName: string, location?: string) => 
    location 
      ? `${itemName} removed from ${location}`
      : `${itemName} removed`,
  itemUpdated: (itemName: string) => 
    `${itemName} updated`,
  
  // Selections
  itemSelected: (itemName: string) => 
    `${itemName} selected`,
  itemDeselected: (itemName: string) => 
    `${itemName} deselected`,
  multipleSelected: (count: number) => 
    `${count} items selected`,
  
  // Sorting/Filtering
  sortApplied: (sortBy: string, direction: 'ascending' | 'descending') => 
    `Sorted by ${sortBy} in ${direction} order`,
  filterApplied: (filterName: string, value: string) => 
    `Filter applied: ${filterName} is ${value}`,
  filtersCleared: () => 
    'All filters cleared',
  
  // Notifications
  success: (message: string) => 
    `Success: ${message}`,
  warning: (message: string) => 
    `Warning: ${message}`,
  error: (message: string) => 
    `Error: ${message}`,
  info: (message: string) => 
    `Information: ${message}`
}

// Utility to create live regions in components
export function createLiveRegion(
  priority: 'polite' | 'assertive' = 'polite',
  atomic = true
): {
  element: HTMLDivElement
  announce: (message: string) => void
  clear: () => void
  destroy: () => void
} {
  const element = document.createElement('div')
  element.setAttribute('aria-live', priority)
  element.setAttribute('aria-atomic', atomic.toString())
  element.className = 'sr-only' // Assuming you have screen reader only styles
  element.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  
  document.body.appendChild(element)
  
  return {
    element,
    announce: (message: string) => {
      element.textContent = message
    },
    clear: () => {
      element.textContent = ''
    },
    destroy: () => {
      element.remove()
    }
  }
}

// Progress announcer for long operations
export class ProgressAnnouncer {
  private liveRegion: ReturnType<typeof createLiveRegion>
  private intervalId?: NodeJS.Timeout
  private progress = 0
  
  constructor(
    private taskName: string,
    private announceInterval = 10 // Announce every 10% by default
  ) {
    this.liveRegion = createLiveRegion('polite')
  }
  
  start(): void {
    this.announce(`${this.taskName} started`)
  }
  
  updateProgress(progress: number): void {
    const roundedProgress = Math.round(progress)
    
    if (roundedProgress % this.announceInterval === 0 && 
        roundedProgress !== this.progress) {
      this.progress = roundedProgress
      this.announce(`${this.taskName}: ${roundedProgress}% complete`)
    }
  }
  
  complete(): void {
    this.announce(`${this.taskName} completed`)
    setTimeout(() => this.destroy(), 1000)
  }
  
  error(message?: string): void {
    this.announce(
      message 
        ? `${this.taskName} failed: ${message}`
        : `${this.taskName} failed`
    )
    setTimeout(() => this.destroy(), 1000)
  }
  
  private announce(message: string): void {
    this.liveRegion.announce(message)
  }
  
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.liveRegion.destroy()
  }
}