<script lang="ts">
	import { ErrorBoundary } from '$lib/components/shared';
	import { EmptyState, LoadingSpinner, RetryButton } from '$lib/components/ui';
	import { withRetry } from '$lib/utils/error-handling';
	import * as m from '$lib/paraglide/messages.js';
	import { logger } from '$lib/utils/logger';

	interface EmptyStateConfig {
		title: string;
		description?: string;
		actionText?: string;
		onAction?: () => void;
	}
	
	interface DataError {
		message?: string;
		code?: string;
		status?: number;
		name?: string;
	}
	
	interface Props {
		/**
		 * Function to fetch data
		 */
		fetchData?: () => Promise<unknown>;
		
		/**
		 * Loading state
		 */
		loading?: boolean;
		
		/**
		 * Data state
		 */
		data?: unknown;
		
		/**
		 * Empty state configuration
		 */
		emptyState?: EmptyStateConfig;
		
		/**
		 * Whether to auto-retry on network errors
		 */
		autoRetry?: boolean;
		
		/**
		 * Maximum number of retry attempts
		 */
		maxRetries?: number;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Children to render when data is available
		 */
		children?: any;
	}

	let { 
		fetchData,
		loading = false,
		data = null,
		emptyState,
		autoRetry = true,
		maxRetries = 3,
		class: className,
		children
	}: Props = $props();

	let dataError = $state<DataError | null>(null);
	let isRetrying = $state(false);
	let retryAttempts = $state(0);

	function isDataError(error: unknown): error is DataError {
		// Network, timeout, and server errors that can be retried
		const retryableErrors = [
			'network',
			'timeout',
			'server-error',
			'503', // Service unavailable
			'502', // Bad gateway
			'504', // Gateway timeout
			'ConnectionError',
			'TimeoutError'
		];

		if (typeof error !== 'object' || error === null) return false;
		
		const typedError = error as Partial<DataError>;
		
		return retryableErrors.some(code => 
			typedError.code?.includes(code) ||
			typedError.message?.toLowerCase().includes(code) ||
			(typedError.status !== undefined && typedError.status >= 500) ||
			!navigator.onLine
		);
	}

	async function handleRetry() {
		if (isRetrying || !fetchData) return;

		try {
			isRetrying = true;
			retryAttempts++;

			// Use the retry utility with exponential backoff
			const result = await withRetry(fetchData, {
				maxAttempts: maxRetries,
				delayMs: 1000,
				backoff: true,
				onRetry: (attempt, error) => {
					logger.log(`Retrying data fetch (attempt ${attempt}):`, error);
				}
			});

			// Clear error on successful fetch
			dataError = null;
			return result;
		} catch (error) {
			dataError = error;
		} finally {
			isRetrying = false;
		}
	}

	// Auto-retry for certain errors
	$effect(() => {
		if (dataError && autoRetry && retryAttempts < maxRetries && isDataError(dataError)) {
			const delay = Math.min(1000 * Math.pow(2, retryAttempts), 10000);
			setTimeout(() => {
				handleRetry();
			}, delay);
		}
	});

	function resetDataBoundary() {
		dataError = null;
		retryAttempts = 0;
	}

	// Catch data errors from children
	function handleError(error: unknown) {
		if (isDataError(error)) {
			dataError = error;
		} else {
			// For non-data errors, create a generic data error
			dataError = {
				message: error instanceof Error ? error.message : 'Unknown data error',
				code: 'unknown'
			};
		}
	}

	// Determine what to show based on state
	const shouldShowLoading = $derived(loading || isRetrying);
	const shouldShowEmpty = $derived(!shouldShowLoading && !dataError && (!data || (Array.isArray(data) && data.length === 0)));
	const shouldShowError = $derived(!shouldShowLoading && dataError);
	const shouldShowContent = $derived(!shouldShowLoading && !dataError && data && (!Array.isArray(data) || data.length > 0));
</script>

<ErrorBoundary 
	error={dataError}
	reset={resetDataBoundary}
	variant="inline"
	title="Failed to Load Data"
	showHome={false}
	autoRetry={autoRetry}
	retryDelay={1000}
	maxRetries={maxRetries}
	class={className}
>
	{#if shouldShowLoading}
		<div class="flex items-center justify-center py-8">
			<LoadingSpinner 
				size="lg" 
				text="Loading..." 
				textPosition="bottom"
			/>
		</div>
	{:else if shouldShowError}
		<div class="py-8">
			<div class="text-center space-y-4">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				
				<div>
					<h3 class="text-lg font-medium text-gray-900">Unable to load data</h3>
					<p class="mt-1 text-sm text-gray-600">
						{#if !navigator.onLine}
							You appear to be offline. Please check your connection.
						{:else if retryAttempts > 0}
							Still having trouble loading data. This might be a temporary issue.
						{:else}
							There was a problem loading the data. Please try again.
						{/if}
					</p>
				</div>

				{#if fetchData}
					<div class="flex justify-center">
						<RetryButton 
							onclick={handleRetry}
							loading={isRetrying}
							text={retryAttempts > 0 ? 'Try Again' : 'Retry'}
						/>
					</div>
				{/if}

				{#if autoRetry && retryAttempts < maxRetries && isDataError(dataError)}
					<p class="text-xs text-gray-500">
						Auto-retrying... (Attempt {retryAttempts + 1} of {maxRetries})
					</p>
				{/if}
			</div>
		</div>
	{:else if shouldShowEmpty && emptyState}
		<EmptyState 
			title={emptyState.title}
			description={emptyState.description}
			actionText={emptyState.actionText}
			onAction={emptyState.onAction}
			icon="search"
		/>
	{:else if shouldShowContent}
		{@render children?.()}
	{/if}
</ErrorBoundary>