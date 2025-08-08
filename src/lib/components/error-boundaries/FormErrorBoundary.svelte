<script lang="ts">
	import { ErrorBoundary } from '$lib/components/shared';
	import { ErrorMessage } from '$lib/components/ui';
	import { logError } from '$lib/utils/error-handling';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		/**
		 * Form validation errors
		 */
		validationErrors?: Record<string, string[]>;
		
		/**
		 * General form error
		 */
		formError?: string;
		
		/**
		 * Whether the form is currently submitting
		 */
		submitting?: boolean;
		
		/**
		 * Callback when form needs to be reset
		 */
		onReset?: () => void;
		
		/**
		 * Callback when validation errors are cleared
		 */
		onClearErrors?: () => void;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Children to render
		 */
		children?: any;
	}
	
	interface FormError {
		code?: string;
		message?: string;
		status?: number;
		details?: Record<string, unknown>;
	}

	let { 
		validationErrors = {},
		formError,
		submitting = false,
		onReset,
		onClearErrors,
		class: className,
		children
	}: Props = $props();

	let submitError = $state<FormError | null>(null);

	function isFormError(error: unknown): error is FormError {
		const formErrorCodes = [
			'validation',
			'invalid-input',
			'required-field',
			'form-submission',
			'PGRST202', // Supabase validation error
			'23505', // Unique constraint violation
			'23503', // Foreign key violation
		];

		if (typeof error !== 'object' || error === null) return false;
		
		const typedError = error as Partial<FormError>;
		
		return formErrorCodes.some(code => 
			typedError.code?.includes(code) ||
			typedError.message?.toLowerCase().includes(code) ||
			typedError.status === 400 ||
			typedError.status === 422
		);
	}

	function formatValidationErrors(errors: Record<string, string[]>): string[] {
		const messages: string[] = [];
		
		for (const [field, fieldErrors] of Object.entries(errors)) {
			const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
			fieldErrors.forEach(error => {
				messages.push(`${fieldName}: ${error}`);
			});
		}
		
		return messages;
	}

	function handleReset() {
		submitError = null;
		if (onReset) {
			onReset();
		}
		if (onClearErrors) {
			onClearErrors();
		}
	}

	function resetFormBoundary() {
		submitError = null;
	}

	// Catch form errors from children
	function handleError(error: unknown) {
		if (isFormError(error)) {
			submitError = error;
			logError(error, { context: 'form_submission_error' });
		} else {
			// Re-throw non-form errors
			throw error;
		}
	}

	const hasValidationErrors = $derived(Object.keys(validationErrors).length > 0);
	const hasFormError = $derived(!!formError);
	const hasSubmitError = $derived(!!submitError);
	const hasAnyError = $derived(hasValidationErrors || hasFormError || hasSubmitError);
</script>

<ErrorBoundary 
	error={submitError}
	reset={resetFormBoundary}
	variant="minimal"
	title="Form Error"
	showHome={false}
	autoRetry={false}
	class={className}
>
	<!-- Display validation errors -->
	{#if hasValidationErrors}
		<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm">
			<div class="flex items-start">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h4 class="text-sm font-medium text-red-800">
						Please correct the following errors:
					</h4>
					<div class="mt-2 text-sm text-red-700">
						<ul class="list-disc pl-5 space-y-1">
							{#each formatValidationErrors(validationErrors) as error}
								<li class="capitalize">{error}</li>
							{/each}
						</ul>
					</div>
					{#if onClearErrors}
						<button
							onclick={onClearErrors}
							class="mt-2 text-sm font-medium text-red-800 underline hover:text-red-900"
						>
							Dismiss
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Display general form error -->
	{#if hasFormError}
		<div class="mb-4">
			<ErrorMessage 
				message={formError}
				variant="error"
				dismissible={!!onClearErrors}
				onDismiss={onClearErrors}
			/>
		</div>
	{/if}

	<!-- Display submission error -->
	{#if hasSubmitError && !submitting}
		<div class="mb-4">
			<ErrorMessage 
				message="There was a problem submitting the form. Please try again."
				variant="error"
				showRetry={!!onReset}
				onRetry={handleReset}
				dismissible={true}
				onDismiss={() => submitError = null}
			/>
		</div>
	{/if}

	<!-- Form content -->
	<div class={hasAnyError ? 'opacity-90' : ''}>
		{@render children?.()}
	</div>

	<!-- Show loading overlay during submission -->
	{#if submitting}
		<div class="absolute inset-0 bg-white/50 flex items-center justify-center rounded-sm">
			<div class="text-center">
				<svg class="animate-spin h-5 w-5 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p class="mt-1 text-sm text-gray-600">Submitting...</p>
			</div>
		</div>
	{/if}
</ErrorBoundary>