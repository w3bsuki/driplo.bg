<script lang="ts">
	import { AlertTriangle, X, RefreshCw } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		/**
		 * The error message to display
		 */
		message: string;
		
		/**
		 * Error variant - affects styling
		 */
		variant?: 'error' | 'warning' | 'info';
		
		/**
		 * Size variant
		 */
		size?: 'sm' | 'md' | 'lg';
		
		/**
		 * Whether to show a retry button
		 */
		showRetry?: boolean;
		
		/**
		 * Whether to show a dismiss button
		 */
		dismissible?: boolean;
		
		/**
		 * Custom retry button text
		 */
		retryText?: string;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Callback when retry is clicked
		 */
		onRetry?: () => void;
		
		/**
		 * Callback when dismiss is clicked
		 */
		onDismiss?: () => void;
	}

	let { 
		message,
		variant = 'error',
		size = 'md',
		showRetry = false,
		dismissible = false,
		retryText = 'Try again',
		class: className,
		onRetry,
		onDismiss
	}: Props = $props();

	const variantClasses = {
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-amber-50 border-amber-200 text-amber-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const iconClasses = {
		error: 'text-red-500',
		warning: 'text-amber-500',
		info: 'text-blue-500'
	};

	const sizeClasses = {
		sm: 'p-3 text-sm',
		md: 'p-4 text-sm',
		lg: 'p-6 text-base'
	};

	const iconSizes = {
		sm: 16,
		md: 20,
		lg: 24
	};

	function handleRetry() {
		if (onRetry) {
			onRetry();
		}
	}

	function handleDismiss() {
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

<div 
	class={cn(
		'border rounded-sm flex items-start gap-3',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	role="alert"
	aria-live="polite"
>
	<AlertTriangle 
		size={iconSizes[size]} 
		class={cn('flex-shrink-0 mt-0.5', iconClasses[variant])} 
	/>
	
	<div class="flex-1 min-w-0">
		<p class="font-medium break-words">
			{message}
		</p>
		
		{#if showRetry || dismissible}
			<div class="flex items-center gap-2 mt-3">
				{#if showRetry}
					<button
						type="button"
						onclick={handleRetry}
						class={cn(
							'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm border transition-colors',
							variant === 'error' ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200' :
							variant === 'warning' ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' :
							'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
						)}
					>
						<RefreshCw size={12} />
						{retryText}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	{#if dismissible}
		<button
			type="button"
			onclick={handleDismiss}
			class={cn(
				'flex-shrink-0 rounded-sm p-1 transition-colors',
				iconClasses[variant],
				'hover:bg-black/5'
			)}
			aria-label="Dismiss error"
		>
			<X size={14} />
		</button>
	{/if}
</div>