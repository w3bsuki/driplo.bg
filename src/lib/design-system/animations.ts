import { spring, tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'
import { tokens } from './tokens'

const animation = tokens.animation

// Animation configuration with TypeScript types
export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: (t: number) => number
  css?: (t: number, u: number) => string
}

// Standard animation configs based on design tokens
export const animationConfigs = {
  fast: {
    duration: parseInt(animation.duration.fast),
    easing: cubicOut
  },
  normal: {
    duration: parseInt(animation.duration.normal),
    easing: cubicOut
  },
  slow: {
    duration: parseInt(animation.duration.slow),
    easing: cubicOut
  },
  slower: {
    duration: parseInt(animation.duration.slower),
    easing: cubicOut
  }
}

// Svelte transition functions
export function fadeScale(node: HTMLElement, { 
  delay = 0, 
  duration = parseInt(animation.duration.normal),
  easing = cubicOut,
  start = 0.95
}: AnimationConfig & { start?: number } = {}) {
  const opacity = +getComputedStyle(node).opacity
  const transform = getComputedStyle(node).transform === 'none' ? '' : getComputedStyle(node).transform
  
  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      opacity: ${t * opacity};
      transform: ${transform} scale(${1 - (1 - start) * (1 - t)});
    `
  }
}

export function slideUp(node: HTMLElement, {
  delay = 0,
  duration = parseInt(animation.duration.normal),
  easing = cubicOut
}: AnimationConfig = {}) {
  const style = getComputedStyle(node)
  const opacity = +style.opacity
  const height = parseFloat(style.height)
  const paddingTop = parseFloat(style.paddingTop)
  const paddingBottom = parseFloat(style.paddingBottom)
  const marginTop = parseFloat(style.marginTop)
  const marginBottom = parseFloat(style.marginBottom)
  const borderTopWidth = parseFloat(style.borderTopWidth)
  const borderBottomWidth = parseFloat(style.borderBottomWidth)
  
  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      overflow: hidden;
      opacity: ${Math.min(t * 20, 1) * opacity};
      height: ${t * height}px;
      padding-top: ${t * paddingTop}px;
      padding-bottom: ${t * paddingBottom}px;
      margin-top: ${t * marginTop}px;
      margin-bottom: ${t * marginBottom}px;
      border-top-width: ${t * borderTopWidth}px;
      border-bottom-width: ${t * borderBottomWidth}px;
    `
  }
}

export function slideHorizontal(node: HTMLElement, {
  delay = 0,
  duration = parseInt(animation.duration.normal),
  easing = cubicOut,
  direction = 'left'
}: AnimationConfig & { direction?: 'left' | 'right' } = {}) {
  const translateX = direction === 'left' ? -100 : 100
  
  return {
    delay,
    duration,
    easing,
    css: (t: number, u: number) => `
      transform: translateX(${u * translateX}%);
      opacity: ${t};
    `
  }
}

// Ripple effect for buttons
export function ripple(node: HTMLElement, color = 'currentColor') {
  const handleClick = (e: MouseEvent) => {
    const rect = node.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      background: ${color};
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.5;
      border-radius: 50%;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: ${x}px;
      top: ${y}px;
      animation: ripple-effect ${animation.duration.slow} ${animation.easing.easeOut};
    `
    
    node.style.position = 'relative'
    node.style.overflow = 'hidden'
    node.appendChild(ripple)
    
    setTimeout(() => ripple.remove(), parseInt(animation.duration.slow))
  }
  
  node.addEventListener('click', handleClick)
  
  // Add ripple animation to global styles if not already present
  if (!document.querySelector('#ripple-animation')) {
    const style = document.createElement('style')
    style.id = 'ripple-animation'
    style.textContent = `
      @keyframes ripple-effect {
        to {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  return {
    destroy() {
      node.removeEventListener('click', handleClick)
    }
  }
}

// Intersection Observer for scroll animations
export function inView(
  node: HTMLElement,
  { threshold = 0.1, rootMargin = '0px', animation: animationName = 'fadeScale' } = {}
) {
  let hasAnimated = false
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true
          node.style.animation = `${animationName} ${animation.duration.normal} ${animation.easing.easeOut} both`
          node.dispatchEvent(new CustomEvent('inview'))
        }
      })
    },
    { threshold, rootMargin }
  )
  
  observer.observe(node)
  
  return {
    destroy() {
      observer.disconnect()
    }
  }
}

// Parallax scrolling effect
export function parallax(node: HTMLElement, { rate = 0.5 } = {}) {
  let rafId: number
  
  const handleScroll = () => {
    if (rafId) return
    
    rafId = requestAnimationFrame(() => {
      const scrolled = window.scrollY
      const yPos = -(scrolled * rate)
      node.style.transform = `translateY(${yPos}px)`
      rafId = 0
    })
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return {
    destroy() {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }
}

// Hover float effect
export function hoverFloat(node: HTMLElement) {
  const handleMouseEnter = () => {
    node.style.transition = `transform ${animation.duration.normal} ${animation.easing.easeOut}`
    node.style.transform = 'translateY(-4px)'
  }
  
  const handleMouseLeave = () => {
    node.style.transform = 'translateY(0)'
  }
  
  node.addEventListener('mouseenter', handleMouseEnter)
  node.addEventListener('mouseleave', handleMouseLeave)
  
  return {
    destroy() {
      node.removeEventListener('mouseenter', handleMouseEnter)
      node.removeEventListener('mouseleave', handleMouseLeave)
    }
  }
}

// Long press action
export function longPress(node: HTMLElement, duration = 500) {
  let timer: NodeJS.Timeout
  
  const handlePressStart = () => {
    timer = setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'))
    }, duration)
  }
  
  const handlePressEnd = () => {
    clearTimeout(timer)
  }
  
  node.addEventListener('mousedown', handlePressStart)
  node.addEventListener('touchstart', handlePressStart)
  node.addEventListener('mouseup', handlePressEnd)
  node.addEventListener('touchend', handlePressEnd)
  node.addEventListener('mouseleave', handlePressEnd)
  
  return {
    destroy() {
      clearTimeout(timer)
      node.removeEventListener('mousedown', handlePressStart)
      node.removeEventListener('touchstart', handlePressStart)
      node.removeEventListener('mouseup', handlePressEnd)
      node.removeEventListener('touchend', handlePressEnd)
      node.removeEventListener('mouseleave', handlePressEnd)
    }
  }
}