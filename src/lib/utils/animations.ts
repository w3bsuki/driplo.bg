import { get } from 'svelte/store'
import { motionEnabled } from '$lib/stores/motion'
import { animation } from '$lib/design-system/tokens'

// Stagger children animations
export function staggerChildren(
  parent: HTMLElement,
  {
    delay = 50,
    duration = parseInt(animation.duration.normal),
    easing = animation.easing.easeOut
  } = {}
) {
  const children = Array.from(parent.children) as HTMLElement[]
  
  children.forEach((child, index) => {
    child.style.opacity = '0'
    child.style.transform = 'translateY(20px)'
    
    setTimeout(() => {
      if (get(motionEnabled)) {
        child.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`
      }
      child.style.opacity = '1'
      child.style.transform = 'translateY(0)'
    }, index * delay)
  })
}

// Page transition manager
export class PageTransition {
  private static instance: PageTransition
  private transitioning = false
  
  static getInstance(): PageTransition {
    if (!PageTransition.instance) {
      PageTransition.instance = new PageTransition()
    }
    return PageTransition.instance
  }
  
  async transitionOut(element: HTMLElement): Promise<void> {
    if (this.transitioning || !get(motionEnabled)) return
    
    this.transitioning = true
    element.style.transition = `opacity ${animation.duration.normal} ${animation.easing.easeIn}`
    element.style.opacity = '0'
    
    await new Promise(resolve => setTimeout(resolve, parseInt(animation.duration.normal)))
  }
  
  async transitionIn(element: HTMLElement): Promise<void> {
    if (!get(motionEnabled)) {
      element.style.opacity = '1'
      this.transitioning = false
      return
    }
    
    element.style.opacity = '0'
    element.style.transition = `opacity ${animation.duration.normal} ${animation.easing.easeOut}`
    
    // Force reflow
    element.offsetHeight
    
    element.style.opacity = '1'
    
    await new Promise(resolve => setTimeout(resolve, parseInt(animation.duration.normal)))
    this.transitioning = false
  }
}

// Smooth height transition for collapsible elements
export function smoothHeight(
  element: HTMLElement,
  {
    duration = parseInt(animation.duration.normal),
    easing = animation.easing.easeInOut
  } = {}
) {
  const startHeight = element.offsetHeight
  const isHidden = element.style.display === 'none' || startHeight === 0
  
  if (isHidden) {
    // Expanding
    element.style.display = 'block'
    element.style.height = 'auto'
    const endHeight = element.offsetHeight
    element.style.height = '0px'
    element.offsetHeight // Force reflow
    
    if (get(motionEnabled)) {
      element.style.transition = `height ${duration}ms ${easing}`
    }
    element.style.height = `${endHeight}px`
    
    setTimeout(() => {
      element.style.height = 'auto'
    }, duration)
  } else {
    // Collapsing
    element.style.height = `${startHeight}px`
    element.offsetHeight // Force reflow
    
    if (get(motionEnabled)) {
      element.style.transition = `height ${duration}ms ${easing}`
    }
    element.style.height = '0px'
    
    setTimeout(() => {
      element.style.display = 'none'
    }, duration)
  }
}

// Gesture animations
export function swipeGesture(
  element: HTMLElement,
  {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  }: {
    threshold?: number
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
  }
) {
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  
  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    endX = e.touches[0].clientX
    endY = e.touches[0].clientY
  }
  
  const handleTouchEnd = () => {
    const deltaX = endX - startX
    const deltaY = endY - startY
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchmove', handleTouchMove, { passive: true })
  element.addEventListener('touchend', handleTouchEnd)
  
  return {
    destroy() {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }
}

// Skeleton loading animation
export function skeletonPulse(element: HTMLElement) {
  if (!get(motionEnabled)) return
  
  element.style.background = `
    linear-gradient(
      90deg,
      var(--color-neutral-200) 0%,
      var(--color-neutral-100) 50%,
      var(--color-neutral-200) 100%
    )
  `
  element.style.backgroundSize = '200% 100%'
  element.style.animation = `skeleton-pulse ${animation.duration.slower} ${animation.easing.easeInOut} infinite`
  
  // Add keyframes if not present
  if (!document.querySelector('#skeleton-animation')) {
    const style = document.createElement('style')
    style.id = 'skeleton-animation'
    style.textContent = `
      @keyframes skeleton-pulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }
}

// Number counter animation
export function animateNumber(
  element: HTMLElement,
  {
    from = 0,
    to,
    duration = parseInt(animation.duration.slower),
    format = (n: number) => Math.round(n).toString()
  }: {
    from?: number
    to: number
    duration?: number
    format?: (n: number) => string
  }
) {
  if (!get(motionEnabled)) {
    element.textContent = format(to)
    return
  }
  
  const startTime = performance.now()
  const range = to - from
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing
    const easedProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease out
    
    const current = from + (range * easedProgress)
    element.textContent = format(current)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}