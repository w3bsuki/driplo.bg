/**
 * Core Web Vitals Monitoring
 * 
 * Tracks key performance metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

import type { Metric } from 'web-vitals';

export interface VitalsConfig {
	// Send metrics to analytics
	sendToAnalytics?: (metric: Metric) => void;
	// Log metrics to console in dev
	logToConsole?: boolean;
	// Sample rate (0-1) for production reporting
	sampleRate?: number;
	// Custom metadata to include
	metadata?: Record<string, unknown>;
}

const DEFAULT_CONFIG: VitalsConfig = {
	logToConsole: import.meta.env['DEV'],
	sampleRate: 1,
	metadata: {}
};

/**
 * Initialize Core Web Vitals monitoring
 */
export async function initWebVitals(config: VitalsConfig = {}) {
	const options = { ...DEFAULT_CONFIG, ...config };
	
	// Only load web-vitals library when needed
	const { onCLS, onLCP, onFCP, onTTFB, onINP } = await import('web-vitals');
	
	const handleMetric = (metric: Metric) => {
		// Sample rate check
		if (Math.random() > options.sampleRate!) return;
		
		// Add metadata
		const enrichedMetric = {
			...metric,
			metadata: {
				...options.metadata,
				url: window.location.href,
				timestamp: new Date().toISOString(),
				connection: getConnectionInfo()
			}
		};
		
		// Log to console in dev
		if (options.logToConsole) {
		}
		
		// Send to analytics
		if (options.sendToAnalytics) {
			options.sendToAnalytics(enrichedMetric);
		}
		
		// Store in performance buffer
		storeMetric(enrichedMetric);
	};
	
	// Register all metrics
	onCLS(handleMetric);
	onLCP(handleMetric);
	onFCP(handleMetric);
	onTTFB(handleMetric);
	onINP(handleMetric); // INP replaces FID in web-vitals v5
}

/**
 * Get connection information
 */
function getConnectionInfo() {
	const nav = navigator as Navigator & {
		connection?: NetworkInformation;
		mozConnection?: NetworkInformation;
		webkitConnection?: NetworkInformation;
	};
	const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
	
	if (!connection) return null;
	
	return {
		effectiveType: connection.effectiveType,
		downlink: connection.downlink,
		rtt: connection.rtt,
		saveData: connection.saveData
	};
}

/**
 * Store metrics in a buffer for batch sending
 */
const metricsBuffer: unknown[] = [];
const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

function storeMetric(metric: unknown) {
	metricsBuffer.push(metric);
	
	if (metricsBuffer.length >= BUFFER_SIZE) {
		flushMetrics();
	}
}

/**
 * Flush metrics buffer
 */
export function flushMetrics() {
	if (metricsBuffer.length === 0) return;
	
	const metrics = [...metricsBuffer];
	metricsBuffer.length = 0;
	
	// Send metrics as beacon for reliability
	if ('sendBeacon' in navigator && window.location.protocol === 'https:') {
		const data = JSON.stringify({ metrics });
		navigator.sendBeacon('/api/metrics', data);
	}
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
	window.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			flushMetrics();
		}
	});
	
	// Periodic flush
	setInterval(flushMetrics, FLUSH_INTERVAL);
}

/**
 * Get current Web Vitals score
 */
export function getVitalsScore(): {
	lcp?: number;
	fid?: number;
	cls?: number;
	inp?: number;
	score?: 'good' | 'needs-improvement' | 'poor';
} {
	const scores: Record<string, unknown> = {};
	
	// Get from performance observer if available
	if ('PerformanceObserver' in window) {
		const entries = performance.getEntriesByType('measure')
			.concat(performance.getEntriesByType('navigation'));
		
		// Extract vitals from entries
		entries.forEach(entry => {
			if (entry.name.includes('LCP')) scores['lcp'] = entry.startTime;
			if (entry.name.includes('FID')) scores['fid'] = entry.duration;
			if (entry.name.includes('CLS')) scores['cls'] = entry.startTime;
		});
	}
	
	// Calculate overall score
	if (scores['lcp'] && scores['fid'] && scores['cls']) {
		const lcpValue = typeof scores['lcp'] === 'number' ? scores['lcp'] : 0;
		const fidValue = typeof scores['fid'] === 'number' ? scores['fid'] : 0;
		const clsValue = typeof scores['cls'] === 'number' ? scores['cls'] : 0;
		
		const isGood = lcpValue < 2500 && fidValue < 100 && clsValue < 0.1;
		const isPoor = lcpValue > 4000 || fidValue > 300 || clsValue > 0.25;
		
		scores['score'] = isGood ? 'good' : isPoor ? 'poor' : 'needs-improvement';
	}
	
	return scores;
}

/**
 * Report custom performance marks
 */
export function markPerformance(name: string, metadata?: Record<string, unknown>) {
	if (!('performance' in window)) return;
	
	performance.mark(name, {
		detail: metadata
	});
	
	// Log in dev
	if (import.meta.env['DEV']) {
	}
}

/**
 * Measure between two marks
 */
export function measurePerformance(
	name: string,
	startMark: string,
	endMark: string = name
) {
	if (!('performance' in window)) return;
	
	try {
		performance.measure(name, startMark, endMark);
		
		const measure = performance.getEntriesByName(name, 'measure')[0];
		if (measure && import.meta.env['DEV']) {
		}
		
		return measure?.duration;
	} catch (e) {
		// Performance measurement failed
	}
}