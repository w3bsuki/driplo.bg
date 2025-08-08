import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';

/**
 * Advanced SWR (Stale-While-Revalidate) cache implementation for client-side caching
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	isStale: boolean;
	isValidating: boolean;
	error?: Error;
}

interface SWROptions<T> {
	/** Cache time in milliseconds (default: 5 minutes) */
	cacheTime?: number;
	/** Stale time in milliseconds (default: 30 seconds) */
	staleTime?: number;
	/** Retry failed requests (default: 3) */
	retryCount?: number;
	/** Retry delay in milliseconds (default: 1000) */
	retryDelay?: number;
	/** Enable background revalidation (default: true) */
	revalidateOnFocus?: boolean;
	/** Revalidate when tab becomes visible (default: true) */
	revalidateOnReconnect?: boolean;
	/** Transform response data */
	transform?: (data: any) => T;
	/** Dedupe requests (default: true) */
	dedupe?: boolean;
	/** Persist cache to localStorage */
	persist?: boolean;
	/** Cache key prefix for localStorage */
	persistKey?: string;
}

interface SWRState<T> {
	data: T | null;
	error: Error | null;
	isLoading: boolean;
	isValidating: boolean;
	mutate: (newData?: T | ((currentData: T | null) => T | null)) => void;
	revalidate: () => Promise<void>;
}

class SWRCache {
	private cache = new Map<string, CacheEntry<any>>();
	private pendingRequests = new Map<string, Promise<any>>();
	private persistedKeys = new Set<string>();
	
	constructor() {
		if (browser) {
			this.setupEventListeners();
			this.loadPersistedCache();
		}
	}
	
	private setupEventListeners() {
		// Revalidate on focus
		window.addEventListener('focus', () => {
			this.revalidateOnFocus();
		});
		
		// Revalidate on online
		window.addEventListener('online', () => {
			this.revalidateAll();
		});
		
		// Cleanup on beforeunload
		window.addEventListener('beforeunload', () => {
			this.persistCache();
		});
		
		// Cleanup expired entries every 5 minutes
		setInterval(() => {
			this.cleanup();
		}, 5 * 60 * 1000);
	}
	
	private loadPersistedCache() {
		try {
			const persistedData = localStorage.getItem('swr-cache');
			if (persistedData) {
				const parsed = JSON.parse(persistedData);
				Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
					// Only restore non-stale entries
					const age = Date.now() - entry.timestamp;
					if (age < entry.cacheTime) {
						this.cache.set(key, {
							...entry,
							isStale: age > entry.staleTime,
							isValidating: false
						});
						this.persistedKeys.add(key);
					}
				});
			}
		} catch (error) {
			logger.warn('Failed to load persisted SWR cache', error);
		}
	}
	
	private persistCache() {
		try {
			const persistData: Record<string, any> = {};
			this.persistedKeys.forEach(key => {
				const entry = this.cache.get(key);
				if (entry) {
					persistData[key] = entry;
				}
			});
			localStorage.setItem('swr-cache', JSON.stringify(persistData));
		} catch (error) {
			logger.warn('Failed to persist SWR cache', error);
		}
	}
	
	private revalidateOnFocus() {
		this.cache.forEach((entry, key) => {
			if (entry.isStale && !entry.isValidating) {
				// Trigger background revalidation for stale entries
				this.backgroundRevalidate(key);
			}
		});
	}
	
	private revalidateAll() {
		this.cache.forEach((entry, key) => {
			if (!entry.isValidating) {
				this.backgroundRevalidate(key);
			}
		});
	}
	
	private async backgroundRevalidate(key: string) {
		const entry = this.cache.get(key);
		if (!entry || entry.isValidating) return;
		
		// This would need the original fetcher function
		// For now, just mark as needing revalidation
		entry.isValidating = true;
		this.cache.set(key, entry);
	}
	
	private cleanup() {
		const now = Date.now();
		const keysToDelete: string[] = [];
		
		this.cache.forEach((entry, key) => {
			// Remove entries older than cache time
			if (now - entry.timestamp > 30 * 60 * 1000) { // 30 minutes max
				keysToDelete.push(key);
			}
		});
		
		keysToDelete.forEach(key => {
			this.cache.delete(key);
			this.persistedKeys.delete(key);
		});
		
		logger.debug(`SWR Cache cleanup: removed ${keysToDelete.length} expired entries`);
	}
	
	get<T>(key: string): CacheEntry<T> | null {
		return this.cache.get(key) || null;
	}
	
	set<T>(key: string, data: T, options: SWROptions<T> = {}) {
		const {
			cacheTime = 5 * 60 * 1000,
			staleTime = 30 * 1000,
			persist = false
		} = options;
		
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			isStale: false,
			isValidating: false
		};
		
		this.cache.set(key, entry);
		
		if (persist) {
			this.persistedKeys.add(key);
		}
		
		// Schedule stale time
		setTimeout(() => {
			const currentEntry = this.cache.get(key);
			if (currentEntry && currentEntry.timestamp === entry.timestamp) {
				currentEntry.isStale = true;
				this.cache.set(key, currentEntry);
			}
		}, staleTime);
	}
	
	delete(key: string) {
		this.cache.delete(key);
		this.persistedKeys.delete(key);
	}
	
	clear() {
		this.cache.clear();
		this.persistedKeys.clear();
		if (browser) {
			localStorage.removeItem('swr-cache');
		}
	}
	
	// Get cache statistics
	getStats() {
		const entries = Array.from(this.cache.entries());
		return {
			totalEntries: entries.length,
			staleEntries: entries.filter(([_, entry]) => entry.isStale).length,
			validatingEntries: entries.filter(([_, entry]) => entry.isValidating).length,
			persistedEntries: this.persistedKeys.size,
			cacheSize: entries.reduce((size, [key, entry]) => {
				return size + key.length + JSON.stringify(entry.data).length;
			}, 0)
		};
	}
}

// Singleton cache instance
export const swrCache = new SWRCache();

/**
 * SWR hook for data fetching with caching
 */
export function useSWR<T>(
	key: string | (() => string) | null,
	fetcher: (key: string) => Promise<T>,
	options: SWROptions<T> = {}
): Readable<SWRState<T>> {
	const {
		cacheTime = 5 * 60 * 1000,
		staleTime = 30 * 1000,
		retryCount = 3,
		retryDelay = 1000,
		revalidateOnFocus = true,
		revalidateOnReconnect = true,
		transform,
		dedupe = true,
		persist = false,
		persistKey = 'default'
	} = options;
	
	const store = writable<SWRState<T>>({
		data: null,
		error: null,
		isLoading: false,
		isValidating: false,
		mutate: () => {},
		revalidate: async () => {}
	});
	
	let currentKey: string | null = null;
	let retryTimer: NodeJS.Timeout;
	let currentRetryCount = 0;
	
	// Get the actual key
	function getKey(): string | null {
		if (key === null) return null;
		if (typeof key === 'function') return key();
		return key;
	}
	
	// Fetch data with retry logic
	async function fetchData(cacheKey: string, isRevalidation = false): Promise<T | null> {
		try {
			// Check for pending request to avoid duplication
			if (dedupe && swrCache['pendingRequests'].has(cacheKey)) {
				return await swrCache['pendingRequests'].get(cacheKey);
			}
			
			const fetchPromise = fetcher(cacheKey);
			
			if (dedupe) {
				swrCache['pendingRequests'].set(cacheKey, fetchPromise);
			}
			
			let result = await fetchPromise;
			
			// Transform data if needed
			if (transform) {
				result = transform(result);
			}
			
			// Update cache
			swrCache.set(cacheKey, result, { cacheTime, staleTime, persist });
			
			// Clear pending request
			if (dedupe) {
				swrCache['pendingRequests'].delete(cacheKey);
			}
			
			// Reset retry count on success
			currentRetryCount = 0;
			
			return result;
			
		} catch (error) {
			// Clear pending request
			if (dedupe) {
				swrCache['pendingRequests'].delete(cacheKey);
			}
			
			const err = error instanceof Error ? error : new Error(String(error));
			
			// Retry logic
			if (currentRetryCount < retryCount) {
				currentRetryCount++;
				const delay = retryDelay * Math.pow(2, currentRetryCount - 1); // Exponential backoff
				
				retryTimer = setTimeout(() => {
					fetchData(cacheKey, isRevalidation);
				}, delay);
				
				logger.debug(`SWR retry ${currentRetryCount}/${retryCount} for key: ${cacheKey}`, err);
			} else {
				// Max retries reached, update store with error
				store.update(state => ({
					...state,
					error: err,
					isLoading: false,
					isValidating: false
				}));
				
				logger.error(`SWR fetch failed after ${retryCount} retries for key: ${cacheKey}`, err);
			}
			
			throw err;
		}
	}
	
	// Mutate function
	function mutate(newData?: T | ((currentData: T | null) => T | null)) {
		const key = getKey();
		if (!key) return;
		
		store.update(state => {
			let updatedData: T | null;
			
			if (typeof newData === 'function') {
				updatedData = (newData as (currentData: T | null) => T | null)(state.data);
			} else {
				updatedData = newData !== undefined ? newData : state.data;
			}
			
			// Update cache
			if (updatedData !== null) {
				swrCache.set(key, updatedData, { cacheTime, staleTime, persist });
			}
			
			return {
				...state,
				data: updatedData,
				error: null
			};
		});
	}
	
	// Revalidate function
	async function revalidate() {
		const key = getKey();
		if (!key) return;
		
		store.update(state => ({ ...state, isValidating: true }));
		
		try {
			const data = await fetchData(key, true);
			store.update(state => ({
				...state,
				data,
				error: null,
				isValidating: false
			}));
		} catch (error) {
			// Error handling is done in fetchData
		}
	}
	
	// Initialize data fetching
	function initialize() {
		const key = getKey();
		if (!key) {
			store.update(state => ({
				...state,
				data: null,
				error: null,
				isLoading: false,
				isValidating: false
			}));
			return;
		}
		
		currentKey = key;
		
		// Check cache first
		const cached = swrCache.get<T>(key);
		
		if (cached) {
			// Return cached data immediately
			store.update(state => ({
				...state,
				data: cached.data,
				error: cached.error || null,
				isLoading: false,
				isValidating: cached.isStale // Revalidate if stale
			}));
			
			// Revalidate in background if stale
			if (cached.isStale && !cached.isValidating) {
				fetchData(key, true).then(freshData => {
					store.update(state => ({
						...state,
						data: freshData || state.data,
						isValidating: false
					}));
				});
			}
		} else {
			// No cache, fetch fresh data
			store.update(state => ({
				...state,
				isLoading: true,
				error: null
			}));
			
			fetchData(key).then(data => {
				store.update(state => ({
					...state,
					data,
					isLoading: false
				}));
			}).catch(() => {
				// Error handling is done in fetchData
			});
		}
	}
	
	// Update store with mutate and revalidate functions
	store.update(state => ({
		...state,
		mutate,
		revalidate
	}));
	
	// Initialize on first subscribe
	let initialized = false;
	const { subscribe } = derived(store, (state) => state, (set) => {
		if (!initialized) {
			initialized = true;
			initialize();
		}
	});
	
	// Cleanup function
	function cleanup() {
		if (retryTimer) {
			clearTimeout(retryTimer);
		}
	}
	
	return {
		subscribe,
		// Expose cleanup for manual cleanup
		cleanup: cleanup as any
	};
}

/**
 * Preload data into cache
 */
export function preload<T>(
	key: string,
	fetcher: (key: string) => Promise<T>,
	options: SWROptions<T> = {}
): Promise<T> {
	const cached = swrCache.get<T>(key);
	
	// Return cached data if available and not stale
	if (cached && !cached.isStale) {
		return Promise.resolve(cached.data);
	}
	
	// Fetch and cache
	return fetcher(key).then(data => {
		const transformed = options.transform ? options.transform(data) : data;
		swrCache.set(key, transformed, options);
		return transformed;
	});
}

/**
 * Invalidate cache entries by key pattern
 */
export function invalidate(keyPattern: string | RegExp) {
	const keysToInvalidate: string[] = [];
	
	swrCache['cache'].forEach((_, key) => {
		if (typeof keyPattern === 'string') {
			if (key.includes(keyPattern)) {
				keysToInvalidate.push(key);
			}
		} else {
			if (keyPattern.test(key)) {
				keysToInvalidate.push(key);
			}
		}
	});
	
	keysToInvalidate.forEach(key => {
		swrCache.delete(key);
	});
	
	logger.debug(`SWR invalidated ${keysToInvalidate.length} cache entries`);
	return keysToInvalidate.length;
}

// Export cache instance for direct access
export { swrCache };