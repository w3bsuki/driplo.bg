import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';
import type { AppError } from './error-handling';

export interface ErrorContext {
	/**
	 * User ID if available
	 */
	userId?: string;
	
	/**
	 * Current page URL
	 */
	url?: string;
	
	/**
	 * User agent string
	 */
	userAgent?: string;
	
	/**
	 * Component or feature where error occurred
	 */
	component?: string;
	
	/**
	 * User action that triggered the error
	 */
	action?: string;
	
	/**
	 * Additional custom context
	 */
	[key: string]: unknown;
}

export interface ErrorReport {
	/**
	 * Error ID for tracking
	 */
	id: string;
	
	/**
	 * Error message
	 */
	message: string;
	
	/**
	 * Error code
	 */
	code: string;
	
	/**
	 * HTTP status code if applicable
	 */
	status?: number;
	
	/**
	 * Error stack trace
	 */
	stack?: string;
	
	/**
	 * Error context
	 */
	context: ErrorContext;
	
	/**
	 * Timestamp when error occurred
	 */
	timestamp: string;
	
	/**
	 * Error severity
	 */
	severity: 'low' | 'medium' | 'high' | 'critical';
	
	/**
	 * Whether error was handled gracefully
	 */
	handled: boolean;
}

export class ErrorTracker {
	private reports: ErrorReport[] = [];
	private maxReports = 100; // Keep last 100 errors in memory
	private sessionId: string;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.setupGlobalErrorHandlers();
	}

	/**
	 * Generate unique session ID
	 */
	private generateSessionId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Set up global error handlers
	 */
	private setupGlobalErrorHandlers() {
		if (!browser) return;

		// JavaScript errors
		window.addEventListener('error', (event) => {
			this.trackError(event.error || new Error(event.message), {
				url: window.location.href,
				component: 'global_error_handler',
				action: 'unhandled_error',
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno
			}, 'high', false);
		});

		// Unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			this.trackError(event.reason, {
				url: window.location.href,
				component: 'global_promise_handler',
				action: 'unhandled_rejection'
			}, 'high', false);
		});

		// Resource loading errors (images, scripts, etc.)
		window.addEventListener('error', (event) => {
			if (event.target !== window) {
				this.trackError(new Error(`Resource failed to load: ${(event.target as any)?.src || 'unknown'}`), {
					url: window.location.href,
					component: 'resource_loader',
					action: 'resource_load_failed',
					resourceUrl: (event.target as any)?.src
				}, 'medium', false);
			}
		}, true);
	}

	/**
	 * Track an error with context
	 */
	trackError(
		error: Error | AppError | unknown,
		context: ErrorContext = {},
		severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
		handled: boolean = true
	): void {
		try {
			const errorReport = this.createErrorReport(error, context, severity, handled);
			
			// Add to in-memory reports
			this.reports.unshift(errorReport);
			if (this.reports.length > this.maxReports) {
				this.reports = this.reports.slice(0, this.maxReports);
			}

			// Log the error
			logger.error('Error tracked', errorReport);

			// Send to external error tracking service if configured
			this.sendToExternalService(errorReport);

			// Store in localStorage for debugging (dev only)
			if (import.meta.env.DEV) {
				this.storeLocally(errorReport);
			}

		} catch (trackingError) {
			// Fail silently to avoid infinite loops
			logger.error('Failed to track error:', trackingError);
		}
	}

	/**
	 * Create error report from error object
	 */
	private createErrorReport(
		error: Error | AppError | unknown,
		context: ErrorContext,
		severity: 'low' | 'medium' | 'high' | 'critical',
		handled: boolean
	): ErrorReport {
		const id = this.generateErrorId();
		
		let message = 'Unknown error';
		let code = 'unknown';
		let status: number | undefined;
		let stack: string | undefined;

		if (error instanceof Error) {
			message = error.message;
			stack = error.stack;
			
			if ('code' in error) {
				code = String(error.code);
			}
			
			if ('statusCode' in error) {
				status = Number(error.statusCode);
			}
		} else {
			message = String(error);
		}

		return {
			id,
			message,
			code,
			status,
			stack,
			context: {
				...context,
				sessionId: this.sessionId,
				userAgent: browser ? navigator.userAgent : undefined,
				timestamp: new Date().toISOString(),
				url: context.url || (browser ? window.location.href : undefined)
			},
			timestamp: new Date().toISOString(),
			severity,
			handled
		};
	}

	/**
	 * Generate unique error ID
	 */
	private generateErrorId(): string {
		return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Send error to external tracking service
	 */
	private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
		// In production, you would send to services like:
		// - Sentry
		// - LogRocket
		// - Rollbar
		// - Custom error tracking API

		try {
			// Example: Send to custom API endpoint
			if (browser && !import.meta.env.DEV) {
				await fetch('/api/errors', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(errorReport),
					// Don't retry error tracking requests to avoid loops
					mode: 'no-cors'
				}).catch(() => {
					// Ignore failures in error reporting
				});
			}
		} catch {
			// Fail silently
		}
	}

	/**
	 * Store error locally for debugging
	 */
	private storeLocally(errorReport: ErrorReport): void {
		if (!browser) return;

		try {
			const key = 'driplo_error_reports';
			const existing = localStorage.getItem(key);
			const reports = existing ? JSON.parse(existing) : [];
			
			reports.unshift(errorReport);
			
			// Keep only last 50 reports locally
			if (reports.length > 50) {
				reports.splice(50);
			}
			
			localStorage.setItem(key, JSON.stringify(reports));
		} catch {
			// LocalStorage might be full or disabled
		}
	}

	/**
	 * Get recent error reports
	 */
	getRecentReports(limit: number = 10): ErrorReport[] {
		return this.reports.slice(0, limit);
	}

	/**
	 * Get error statistics
	 */
	getErrorStats(): {
		total: number;
		bySeverity: Record<string, number>;
		byCode: Record<string, number>;
		handled: number;
		unhandled: number;
	} {
		const stats = {
			total: this.reports.length,
			bySeverity: {} as Record<string, number>,
			byCode: {} as Record<string, number>,
			handled: 0,
			unhandled: 0
		};

		this.reports.forEach(report => {
			// Count by severity
			stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
			
			// Count by error code
			stats.byCode[report.code] = (stats.byCode[report.code] || 0) + 1;
			
			// Count handled vs unhandled
			if (report.handled) {
				stats.handled++;
			} else {
				stats.unhandled++;
			}
		});

		return stats;
	}

	/**
	 * Clear error reports
	 */
	clearReports(): void {
		this.reports = [];
		
		if (browser) {
			try {
				localStorage.removeItem('driplo_error_reports');
			} catch {
				// Ignore
			}
		}
	}

	/**
	 * Export error reports for debugging
	 */
	exportReports(): string {
		return JSON.stringify({
			sessionId: this.sessionId,
			exportedAt: new Date().toISOString(),
			reports: this.reports,
			stats: this.getErrorStats()
		}, null, 2);
	}
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * Convenience function to track errors
 */
export function trackError(
	error: Error | AppError | unknown,
	context: ErrorContext = {},
	severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
	errorTracker.trackError(error, context, severity, true);
}

/**
 * Track user interactions that might lead to errors
 */
export function trackUserAction(action: string, context: ErrorContext = {}): void {
	if (import.meta.env.DEV) {
		logger.debug('User action tracked', { action, context });
	}
}

/**
 * Track performance issues that might indicate problems
 */
export function trackPerformanceIssue(
	metric: string, 
	value: number, 
	threshold: number,
	context: ErrorContext = {}
): void {
	if (value > threshold) {
		trackError(
			new Error(`Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`),
			{
				...context,
				component: 'performance_monitor',
				action: 'performance_threshold_exceeded',
				metric,
				value,
				threshold
			},
			'medium'
		);
	}
}