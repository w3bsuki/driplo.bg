/**
 * Development-only logger utility
 * 
 * In production builds, all logging methods become no-ops.
 * In development, logs are output to the browser console.
 * 
 * Usage:
 *   import { logger } from '$lib/utils/logger';
 *   logger.log('Debug info');
 *   logger.error('Something went wrong', error);
 *   logger.warn('Potential issue');
 *   logger.info('Information');
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
	/**
	 * Log general debug information
	 */
	log: (...args: unknown[]) => {
		if (isDevelopment) {
			console.log('[DEBUG]', ...args);
		}
	},

	/**
	 * Log error information
	 */
	error: (...args: unknown[]) => {
		if (isDevelopment) {
			console.error('[ERROR]', ...args);
		}
	},

	/**
	 * Log warning information
	 */
	warn: (...args: unknown[]) => {
		if (isDevelopment) {
			console.warn('[WARN]', ...args);
		}
	},

	/**
	 * Log informational messages
	 */
	info: (...args: unknown[]) => {
		if (isDevelopment) {
			console.info('[INFO]', ...args);
		}
	},

	/**
	 * Log debug information (alias for log)
	 */
	debug: (...args: unknown[]) => {
		if (isDevelopment) {
			console.log('[DEBUG]', ...args);
		}
	},

	/**
	 * Group related log messages
	 */
	group: (label: string) => {
		if (isDevelopment) {
			console.group(label);
		}
	},

	/**
	 * End a log group
	 */
	groupEnd: () => {
		if (isDevelopment) {
			console.groupEnd();
		}
	},

	/**
	 * Log a table of data
	 */
	table: (data: unknown) => {
		if (isDevelopment) {
			console.table(data);
		}
	}
};

export default logger;