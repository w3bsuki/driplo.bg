import { writable, derived, type Readable } from 'svelte/store';
import { apiFetch, type ApiOptions } from './api-client';
import { withRetry, AppError, logError } from './error-handling';
import { logger } from '$lib/utils/logger';

interface DataState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
	lastFetch: Date | null;
}

interface FetchOptions extends ApiOptions {
	/**
	 * Cache time in milliseconds
	 */
	cacheTime?: number;
	/**
	 * Stale time in milliseconds
	 */
	staleTime?: number;
	/**
	 * Whether to refetch on window focus
	 */
	refetchOnWindowFocus?: boolean;
	/**
	 * Whether to retry on error
	 */
	retryOnError?: boolean;
	/**
	 * Transform function for the response data
	 */
	transform?: (data: any) => any;
	/**
	 * Enable optimistic updates
	 */
	optimistic?: boolean;
}

/**
 * Create a reactive data fetcher with error handling and caching
 */
export function createDataFetcher<T>(
	url: string | (() => string),
	options: FetchOptions = {}
) {
	const {
		cacheTime = 5 * 60 * 1000, // 5 minutes
		staleTime = 30 * 1000, // 30 seconds
		refetchOnWindowFocus = true,
		retryOnError = true,
		transform,
		optimistic = false,
		...fetchOptions
	} = options;

	const initialState: DataState<T> = {
		data: null,
		loading: false,
		error: null,
		lastFetch: null
	};

	const state = writable<DataState<T>>(initialState);

	let abortController: AbortController | null = null;
	let refetchTimeout: NodeJS.Timeout | null = null;

	/**
	 * Check if data is stale
	 */
	function isStale(lastFetch: Date | null): boolean {
		if (!lastFetch) return true;
		return Date.now() - lastFetch.getTime() > staleTime;
	}

	/**
	 * Check if cache is expired
	 */
	function isExpired(lastFetch: Date | null): boolean {
		if (!lastFetch) return true;
		return Date.now() - lastFetch.getTime() > cacheTime;
	}

	/**
	 * Abort any ongoing request
	 */
	function abort() {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		if (refetchTimeout) {
			clearTimeout(refetchTimeout);
			refetchTimeout = null;
		}
	}

	/**
	 * Fetch data with error handling and retry logic
	 */
	async function fetchData(forceRefresh = false): Promise<T | null> {
		const currentUrl = typeof url === 'function' ? url() : url;
		if (!currentUrl) return null;

		// Check cache first
		const currentState = await new Promise<DataState<T>>(resolve => {
			const unsubscribe = state.subscribe(resolve);
			unsubscribe();
		});

		if (!forceRefresh && currentState.data && !isExpired(currentState.lastFetch)) {
			return currentState.data;
		}

		// Abort previous request
		abort();
		abortController = new AbortController();

		// Set loading state
		state.update(s => ({
			...s,
			loading: true,
			error: null
		}));

		try {
			const response = await apiFetch(currentUrl, {
				...fetchOptions,
				signal: abortController.signal,
				retry: retryOnError
			});

			if (!response.ok) {
				throw new AppError(
					`Failed to fetch data: ${response.status}`,
					'fetch-error',
					response.status
				);
			}

			let data = await response.json();

			// Apply transform if provided
			if (transform) {
				data = transform(data);
			}

			// Update state with new data
			state.update(s => ({
				...s,
				data,
				loading: false,
				error: null,
				lastFetch: new Date()
			}));

			logger.debug('Data fetched successfully', { url: currentUrl, data });
			return data;

		} catch (error: unknown) {
			// Don't update error state if request was aborted
			if (error instanceof Error && error.name === 'AbortError') {
				return null;
			}

			// Log error with context
			logError(error, {
				context: 'data_fetcher',
				url: currentUrl,
				fetchOptions
			});

			// Update error state
			state.update(s => ({
				...s,
				loading: false,
				error: error instanceof Error ? error : new Error(String(error))
			}));

			// Schedule retry for recoverable errors
			if (retryOnError && shouldRetry(error)) {
				refetchTimeout = setTimeout(() => {
					fetchData(true);
				}, getRetryDelay(error));
			}

			return null;

		} finally {
			abortController = null;
		}
	}

	/**
	 * Determine if error should trigger retry
	 */
	function shouldRetry(error: unknown): boolean {
		if (error instanceof AppError) {
			// Don't retry auth or validation errors
			if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 400) {
				return false;
			}
			// Retry server errors and network issues
			return error.statusCode >= 500 || error.code.includes('network');
		}
		return true;
	}

	/**
	 * Get retry delay based on error type
	 */
	function getRetryDelay(error: unknown): number {
		if (error instanceof AppError) {
			// Exponential backoff for server errors
			if (error.statusCode >= 500) {
				return Math.min(1000 * Math.pow(2, Math.random()), 30000);
			}
			// Fixed delay for network errors
			if (error.code.includes('network')) {
				return 3000;
			}
		}
		return 5000; // Default delay
	}

	/**
	 * Refetch data
	 */
	function refetch() {
		return fetchData(true);
	}

	/**
	 * Invalidate cache and refetch
	 */
	function invalidate() {
		state.update(s => ({
			...s,
			lastFetch: null
		}));
		return fetchData(true);
	}

	/**
	 * Update data optimistically
	 */
	function mutate(updater: (current: T | null) => T | null, optimistic = false) {
		if (optimistic) {
			state.update(s => ({
				...s,
				data: updater(s.data)
			}));
		} else {
			// Perform actual update and then refetch
			state.update(s => ({
				...s,
				data: updater(s.data)
			}));
			// Could also make an API call here if needed
		}
	}

	/**
	 * Reset to initial state
	 */
	function reset() {
		abort();
		state.set(initialState);
	}

	// Set up window focus refetching
	if (typeof window !== 'undefined' && refetchOnWindowFocus) {
		const handleFocus = () => {
			const currentState = state.subscribe(s => s)();
			if (currentState.data && isStale(currentState.lastFetch)) {
				fetchData();
			}
		};

		window.addEventListener('focus', handleFocus);
		
		// Clean up on component unmount
		const cleanup = () => {
			window.removeEventListener('focus', handleFocus);
			abort();
		};

		// Return cleanup function for manual cleanup
		return {
			state,
			fetch: fetchData,
			refetch,
			invalidate,
			mutate,
			reset,
			cleanup,
			// Derived stores for convenience
			data: derived(state, $state => $state.data),
			loading: derived(state, $state => $state.loading),
			error: derived(state, $state => $state.error)
		};
	}

	return {
		state,
		fetch: fetchData,
		refetch,
		invalidate,
		mutate,
		reset,
		cleanup: abort,
		// Derived stores for convenience
		data: derived(state, $state => $state.data),
		loading: derived(state, $state => $state.loading),
		error: derived(state, $state => $state.error)
	};
}

/**
 * Create a mutation helper for data modifications
 */
export function createMutation<TData, TVariables = unknown>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: {
		onSuccess?: (data: TData, variables: TVariables) => void;
		onError?: (error: Error, variables: TVariables) => void;
		onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
	} = {}
) {
	const { onSuccess, onError, onSettled } = options;

	const state = writable<{
		data: TData | null;
		loading: boolean;
		error: Error | null;
	}>({
		data: null,
		loading: false,
		error: null
	});

	async function mutate(variables: TVariables): Promise<TData | null> {
		state.update(s => ({
			...s,
			loading: true,
			error: null
		}));

		try {
			const data = await mutationFn(variables);

			state.update(s => ({
				...s,
				data,
				loading: false,
				error: null
			}));

			if (onSuccess) {
				onSuccess(data, variables);
			}

			if (onSettled) {
				onSettled(data, null, variables);
			}

			return data;

		} catch (error: unknown) {
			const err = error instanceof Error ? error : new Error(String(error));

			state.update(s => ({
				...s,
				loading: false,
				error: err
			}));

			logError(err, {
				context: 'mutation_error',
				variables
			});

			if (onError) {
				onError(err, variables);
			}

			if (onSettled) {
				onSettled(null, err, variables);
			}

			return null;
		}
	}

	function reset() {
		state.set({
			data: null,
			loading: false,
			error: null
		});
	}

	return {
		state,
		mutate,
		reset,
		// Derived stores for convenience
		data: derived(state, $state => $state.data),
		loading: derived(state, $state => $state.loading),
		error: derived(state, $state => $state.error)
	};
}