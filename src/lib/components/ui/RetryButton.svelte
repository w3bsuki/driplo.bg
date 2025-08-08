<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		/**
		 * Button text
		 */
		text?: string;
		
		/**
		 * Button variant
		 */
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		
		/**
		 * Size variant
		 */
		size?: 'sm' | 'md' | 'lg';
		
		/**
		 * Whether the button is in loading state
		 */
		loading?: boolean;
		
		/**
		 * Whether the button is disabled
		 */
		disabled?: boolean;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Callback when clicked
		 */
		onclick?: () => void | Promise<void>;
	}

	let {
		text = 'Try again',
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		class: className,
		onclick
	}: Props = $props();

	let isLoading = $state(false);

	const variantClasses = {
		primary: 'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-blue-500',
		secondary: 'bg-gray-600 text-white border-transparent hover:bg-gray-700 focus:ring-gray-500',
		outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
		ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-blue-500'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	const iconSizes = {
		sm: 12,
		md: 16,
		lg: 18
	};

	async function handleClick() {
		if (disabled || isLoading || !onclick) return;

		try {
			isLoading = true;
			await onclick();
		} catch (error) {
			logger.error('Retry action failed:', error);
		} finally {
			isLoading = false;
		}
	}

	const isButtonDisabled = $derived(disabled || isLoading || loading);
</script>

<button
	type="button"
	onclick={handleClick}
	disabled={isButtonDisabled}
	class={cn(
		'inline-flex items-center gap-2 font-medium border rounded-sm transition-colors duration-200',
		'focus:outline-none focus:ring-2 focus:ring-offset-2',
		'disabled:opacity-50 disabled:cursor-not-allowed',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
>
	<RefreshCw 
		size={iconSizes[size]} 
		class={cn(
			'flex-shrink-0',
			(isLoading || loading) ? 'animate-spin' : ''
		)} 
	/>
	{text}
</button>