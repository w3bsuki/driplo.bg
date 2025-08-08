<script lang="ts">
	import { ErrorBoundary } from '$lib/components/shared';
	import { ErrorMessage, RetryButton } from '$lib/components/ui';
	import { logError } from '$lib/utils/error-handling';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		/**
		 * Whether to show alternative payment methods on error
		 */
		showAlternatives?: boolean;
		
		/**
		 * Callback when payment needs to be retried
		 */
		onRetry?: () => void | Promise<void>;
		
		/**
		 * Callback when user wants to change payment method
		 */
		onChangePaymentMethod?: () => void;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Children to render
		 */
		children?: any;
	}
	
	interface PaymentError {
		code?: string;
		message?: string;
		type?: string;
		decline_code?: string;
	}

	let { 
		showAlternatives = true,
		onRetry,
		onChangePaymentMethod,
		class: className,
		children
	}: Props = $props();

	let paymentError = $state<PaymentError | null>(null);
	let isRetrying = $state(false);

	function isPaymentError(error: unknown): error is PaymentError {
		const paymentErrorCodes = [
			'payment/card-declined',
			'payment/insufficient-funds', 
			'payment/processing-error',
			'payment/invalid-card',
			'payment/expired-card',
			'payment/authentication-required',
			'stripe'
		];

		if (typeof error !== 'object' || error === null) return false;
		
		const typedError = error as Partial<PaymentError>;
		
		return paymentErrorCodes.some(code => 
			typedError.code?.includes(code) ||
			typedError.message?.toLowerCase().includes(code) ||
			typedError.type?.includes('card') ||
			Boolean(typedError.decline_code)
		);
	}

	function getPaymentErrorMessage(error: PaymentError): string {
		// Map specific payment error types to user-friendly messages
		if (error?.decline_code === 'insufficient_funds') {
			return 'Your card has insufficient funds. Please try a different payment method.';
		}
		if (error?.decline_code === 'card_declined') {
			return 'Your card was declined. Please check your details or try a different card.';
		}
		if (error?.code === 'payment/authentication-required') {
			return 'Additional authentication is required. Please complete the verification process.';
		}
		if (error?.message?.includes('expired')) {
			return 'Your card has expired. Please use a different payment method.';
		}
		
		// Default payment error message
		return 'There was a problem processing your payment. Please try again or use a different payment method.';
	}

	async function handleRetry() {
		if (isRetrying || !onRetry) return;

		try {
			isRetrying = true;
			await onRetry();
			paymentError = null; // Clear error on successful retry
		} catch (error) {
			logError(error, { context: 'payment_retry_failed', originalError: paymentError });
		} finally {
			isRetrying = false;
		}
	}

	function handleChangePaymentMethod() {
		if (onChangePaymentMethod) {
			onChangePaymentMethod();
			paymentError = null; // Clear error when changing payment method
		}
	}

	// Custom reset function for payment errors
	function resetPaymentBoundary() {
		paymentError = null;
	}

	// Catch payment errors from children
	function handleError(error: unknown) {
		if (isPaymentError(error)) {
			paymentError = error;
		} else {
			// Re-throw non-payment errors
			throw error;
		}
	}
</script>

<ErrorBoundary 
	error={paymentError}
	reset={resetPaymentBoundary}
	variant="inline"
	title="Payment Error"
	showHome={false}
	autoRetry={false}
	class={className}
>
	{@render children?.()}
</ErrorBoundary>

<!-- Specialized payment error UI -->
{#if paymentError && isPaymentError(paymentError)}
	<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-sm">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3 flex-1">
				<h4 class="text-sm font-medium text-red-800">
					Payment Failed
				</h4>
				<p class="mt-1 text-sm text-red-700">
					{getPaymentErrorMessage(paymentError)}
				</p>

				<div class="mt-4 flex flex-col sm:flex-row gap-2">
					{#if onRetry}
						<RetryButton 
							onclick={handleRetry}
							loading={isRetrying}
							text="Try Payment Again"
							variant="secondary"
							size="sm"
						/>
					{/if}

					{#if showAlternatives && onChangePaymentMethod}
						<button
							onclick={handleChangePaymentMethod}
							class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Change Payment Method
						</button>
					{/if}
				</div>

				{#if paymentError?.decline_code}
					<div class="mt-3 text-xs text-gray-600">
						Error code: {paymentError.decline_code}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}