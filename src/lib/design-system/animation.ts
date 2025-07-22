import { tokens } from './tokens'
import { writable } from 'svelte/store'

// Re-export animation tokens for easier access
export const animation = tokens.animation

// Motion preference store
function createMotionStore() {
  const { subscribe, set } = writable(true)
  
  // Check system preference
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    set(!mediaQuery.matches)
    
    mediaQuery.addEventListener('change', (e) => {
      set(!e.matches)
    })
  }
  
  return {
    subscribe,
    toggle: () => set(current => !current),
    enable: () => set(true),
    disable: () => set(false)
  }
}

export const motionEnabled = createMotionStore()

// Animation presets
export const animationPresets = {
  // Fade animations
  fadeIn: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  fadeOut: {
    duration: animation.duration.normal,
    easing: animation.easing.easeIn,
    from: { opacity: 1 },
    to: { opacity: 0 }
  },
  
  // Scale animations
  scaleIn: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  },
  scaleOut: {
    duration: animation.duration.normal,
    easing: animation.easing.easeIn,
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 }
  },
  
  // Slide animations
  slideInLeft: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 }
  },
  slideInRight: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 }
  },
  slideInUp: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },
  slideInDown: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },
  
  // Micro-interactions
  buttonPress: {
    duration: animation.duration.fast,
    easing: animation.easing.easeInOut,
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(0.97)' }
  },
  ripple: {
    duration: animation.duration.slow,
    easing: animation.easing.easeOut,
    from: { transform: 'scale(0)', opacity: 0.5 },
    to: { transform: 'scale(4)', opacity: 0 }
  },
  
  // Loading animations
  pulse: {
    duration: animation.duration.slower,
    easing: animation.easing.easeInOut,
    keyframes: [
      { opacity: 1 },
      { opacity: 0.5 },
      { opacity: 1 }
    ],
    iterations: 'infinite'
  },
  spin: {
    duration: '1s',
    easing: animation.easing.linear,
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ],
    iterations: 'infinite'
  },
  
  // Page transitions
  pageEnter: {
    duration: animation.duration.slow,
    easing: animation.easing.easeOut,
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  pageExit: {
    duration: animation.duration.normal,
    easing: animation.easing.easeIn,
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(-20px)' }
  }
}

// CSS transition utilities
export const transitions = {
  all: `all ${animation.duration.normal} ${animation.easing.easeInOut}`,
  opacity: `opacity ${animation.duration.normal} ${animation.easing.easeInOut}`,
  transform: `transform ${animation.duration.normal} ${animation.easing.easeInOut}`,
  colors: `background-color ${animation.duration.fast} ${animation.easing.easeInOut}, 
           border-color ${animation.duration.fast} ${animation.easing.easeInOut}, 
           color ${animation.duration.fast} ${animation.easing.easeInOut}`,
  shadow: `box-shadow ${animation.duration.normal} ${animation.easing.easeInOut}`,
}

// Svelte animation helpers
export function createAnimation(preset: keyof typeof animationPresets) {
  const config = animationPresets[preset]
  
  return (node: HTMLElement, params = {}) => {
    let motionAllowed = true
    
    const unsubscribe = motionEnabled.subscribe(value => {
      motionAllowed = value
    })
    
    return {
      duration: motionAllowed ? config.duration : 0,
      easing: config.easing,
      css: (t: number) => {
        if (!motionAllowed) return ''
        
        const styles: Record<string, string> = {}
        
        if (config.from && config.to) {
          Object.keys(config.from).forEach(key => {
            const fromValue = (config.from as any)[key]
            const toValue = (config.to as any)[key]
            
            if (typeof fromValue === 'number' && typeof toValue === 'number') {
              styles[key] = `${fromValue + (toValue - fromValue) * t}`
            } else {
              styles[key] = t < 0.5 ? fromValue : toValue
            }
          })
        }
        
        return Object.entries(styles)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
      },
      destroy: unsubscribe
    }
  }
}

// Stagger animation utility
export function stagger(delay = 50) {
  return (node: HTMLElement, index: number) => {
    return {
      delay: index * delay,
    }
  }
}

// Spring physics configuration
export const springConfigs = {
  default: { stiffness: 300, damping: 30 },
  gentle: { stiffness: 200, damping: 20 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 400, damping: 40 },
  slow: { stiffness: 100, damping: 20 }
}