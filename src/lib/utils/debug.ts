/**
 * Debug utility for production debugging
 */
export function debugLog(category: string, message: string, data?: any) {
	if (typeof window === 'undefined') return;
	
	// Only log in development or if debug flag is set
	const isDebugMode = import.meta.env.DEV || 
		(typeof window !== 'undefined' && window.location.search.includes('debug=true'));
	
	if (isDebugMode) {
		console.log(`[${category}] ${message}`, data || '');
	}
	
	// Also store in sessionStorage for production debugging
	try {
		const logs = JSON.parse(sessionStorage.getItem('driplo-debug-logs') || '[]');
		logs.push({
			timestamp: new Date().toISOString(),
			category,
			message,
			data,
			url: window.location.href,
			userAgent: navigator.userAgent
		});
		
		// Keep only last 50 logs
		if (logs.length > 50) {
			logs.splice(0, logs.length - 50);
		}
		
		sessionStorage.setItem('driplo-debug-logs', JSON.stringify(logs));
	} catch (e) {
		// Ignore errors in sessionStorage
	}
}

/**
 * Get debug logs from sessionStorage
 */
export function getDebugLogs() {
	if (typeof window === 'undefined') return [];
	
	try {
		return JSON.parse(sessionStorage.getItem('driplo-debug-logs') || '[]');
	} catch {
		return [];
	}
}