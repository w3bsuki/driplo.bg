<script lang="ts">
  import { page } from '$app/stores';
  import { getErrorMessage, logError } from '$lib/utils/error-handling';
  import { ErrorMessage, RetryButton } from '$lib/components/ui';
  import * as m from '$lib/paraglide/messages.js';
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils/cn';

  interface Props {
    error?: any;
    reset?: (() => void) | null;
    /**
     * Fallback UI variant
     */
    variant?: 'full' | 'inline' | 'minimal';
    /**
     * Custom fallback title
     */
    title?: string;
    /**
     * Whether to show home button
     */
    showHome?: boolean;
    /**
     * Whether to auto-retry after errors
     */
    autoRetry?: boolean;
    /**
     * Auto-retry delay in milliseconds
     */
    retryDelay?: number;
    /**
     * Maximum auto-retry attempts
     */
    maxRetries?: number;
    /**
     * Additional CSS classes
     */
    class?: string;
    /**
     * Child content
     */
    children?: import('svelte').Snippet;
  }

  let { 
    error = null, 
    reset = null,
    variant = 'full',
    title,
    showHome = true,
    autoRetry = false,
    retryDelay = 3000,
    maxRetries = 3,
    class: className,
    children
  }: Props = $props();

  let errorMessage = $state('');
  let showDetails = $state(false);
  let retryCount = $state(0);
  let isRetrying = $state(false);

  $effect(() => {
    if (error) {
      errorMessage = getErrorMessage(error);
      logError(error, {
        url: $page.url.pathname,
        errorBoundary: true,
        variant,
        retryCount
      });

      // Auto-retry logic
      if (autoRetry && retryCount < maxRetries && shouldRetry(error)) {
        setTimeout(() => {
          handleReset();
        }, retryDelay);
      }
    }
  });

  function shouldRetry(error: any): boolean {
    // Don't retry auth, permission, or validation errors
    const nonRetryableCodes = [
      'auth/invalid-credentials',
      'auth/user-not-found', 
      'permission-denied',
      'validation',
      'payment/card-declined'
    ];
    
    return !nonRetryableCodes.some(code => 
      error?.code === code || 
      error?.message?.includes(code) ||
      error?.status === 401 ||
      error?.status === 403 ||
      error?.status === 404
    );
  }

  async function handleReset() {
    if (isRetrying) return;
    
    isRetrying = true;
    retryCount++;

    try {
      if (reset) {
        await reset();
        error = null; // Clear error on successful retry
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (retryError) {
      logError(retryError, { 
        context: 'retry_failed', 
        originalError: error,
        retryCount
      });
    } finally {
      isRetrying = false;
    }
  }

  onMount(() => {
    // Set up global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      error = event.error;
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      error = event.reason;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });
</script>

{#if error}
  {#if variant === 'minimal'}
    <div class={cn('p-4', className)}>
      <ErrorMessage 
        message={errorMessage}
        showRetry={true}
        onRetry={handleReset}
        dismissible={false}
      />
    </div>
  {:else if variant === 'inline'}
    <div class={cn('my-4', className)}>
      <ErrorMessage 
        message={errorMessage}
        showRetry={true}
        dismissible={true}
        onRetry={handleReset}
        onDismiss={() => error = null}
      />
      
      {#if import.meta.env['DEV'] && error}
        <details class="mt-2">
          <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Technical details
          </summary>
          <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-32 text-gray-600">
{JSON.stringify(error, null, 2)}
          </pre>
        </details>
      {/if}
    </div>
  {:else}
    <!-- Full variant (default) -->
    <div class={cn('min-h-[400px] flex items-center justify-center p-4', className)}>
      <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title || m.error_boundary_title()}
            </h3>
          </div>
        </div>

        <div class="mt-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
          
          {#if autoRetry && retryCount < maxRetries}
            <p class="text-xs text-gray-500 mt-2">
              Auto-retrying in {Math.ceil(retryDelay / 1000)} seconds... (Attempt {retryCount + 1} of {maxRetries})
            </p>
          {/if}
        </div>

        {#if import.meta.env['DEV'] && error}
          <div class="mt-4">
            <button
              onclick={() => showDetails = !showDetails}
              class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>
            
            {#if showDetails}
              <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-48">
{JSON.stringify(error, null, 2)}
              </pre>
            {/if}
          </div>
        {/if}

        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <RetryButton 
            onclick={handleReset}
            loading={isRetrying}
            text={m.error_boundary_retry()}
            class="flex-1"
          />
          
          {#if showHome}
            <a
              href="/"
              class="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
            >
              {m.error_boundary_home()}
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{:else}
  {@render children?.()}
{/if}