<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		/**
		 * Size of the spinner
		 */
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		
		/**
		 * Color variant
		 */
		variant?: 'primary' | 'secondary' | 'white';
		
		/**
		 * Optional loading text
		 */
		text?: string;
		
		/**
		 * Text position relative to spinner
		 */
		textPosition?: 'right' | 'bottom';
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Whether to center the spinner
		 */
		centered?: boolean;
	}

	let {
		size = 'md',
		variant = 'primary',
		text,
		textPosition = 'right',
		class: className,
		centered = false
	}: Props = $props();

	const sizeClasses = {
		xs: 'h-3 w-3',
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
		xl: 'h-8 w-8'
	};

	const variantClasses = {
		primary: 'text-blue-600',
		secondary: 'text-gray-600',
		white: 'text-white'
	};

	const textSizeClasses = {
		xs: 'text-xs',
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-sm',
		xl: 'text-base'
	};
</script>

<div 
	class={cn(
		'inline-flex items-center',
		textPosition === 'bottom' ? 'flex-col' : 'flex-row',
		textPosition === 'right' && text ? 'gap-2' : '',
		textPosition === 'bottom' && text ? 'gap-1' : '',
		centered ? 'justify-center' : '',
		className
	)}
	role="status"
	aria-label={text || 'Loading'}
>
	<svg 
		class={cn(
			'animate-spin',
			sizeClasses[size],
			variantClasses[variant]
		)}
		fill="none" 
		viewBox="0 0 24 24"
	>
		<circle 
			class="opacity-25" 
			cx="12" 
			cy="12" 
			r="10" 
			stroke="currentColor" 
			stroke-width="4"
		></circle>
		<path 
			class="opacity-75" 
			fill="currentColor" 
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		></path>
	</svg>
	
	{#if text}
		<span class={cn(textSizeClasses[size], variantClasses[variant])}>
			{text}
		</span>
	{/if}
	
	<span class="sr-only">Loading...</span>
</div>