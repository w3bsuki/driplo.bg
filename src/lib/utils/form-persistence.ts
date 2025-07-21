/**
 * Form persistence utilities for saving form data to sessionStorage
 * Helps prevent data loss when navigating between steps or on accidental refresh
 */

const STORAGE_PREFIX = 'driplo_form_'

/**
 * Save form data to sessionStorage
 */
export function saveFormData(formId: string, data: any): void {
	try {
		const key = `${STORAGE_PREFIX}${formId}`
		sessionStorage.setItem(key, JSON.stringify(data))
	} catch (error) {
		// Silently fail if storage is full or unavailable
		console.warn('Failed to save form data:', error)
	}
}

/**
 * Load form data from sessionStorage
 */
export function loadFormData<T>(formId: string): T | null {
	try {
		const key = `${STORAGE_PREFIX}${formId}`
		const stored = sessionStorage.getItem(key)
		return stored ? JSON.parse(stored) : null
	} catch (error) {
		console.warn('Failed to load form data:', error)
		return null
	}
}

/**
 * Clear form data from sessionStorage
 */
export function clearFormData(formId: string): void {
	try {
		const key = `${STORAGE_PREFIX}${formId}`
		sessionStorage.removeItem(key)
	} catch (error) {
		console.warn('Failed to clear form data:', error)
	}
}

/**
 * Debounce function to limit how often form data is saved
 */
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null
			func(...args)
		}

		if (timeout !== null) {
			clearTimeout(timeout)
		}
		timeout = setTimeout(later, wait)
	}
}