<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: any;
	}
	
	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children,
		...restProps
	}: Props = $props();
	
	// Simple, clean size classes (like HeroSearch)
	const sizeClasses = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-9 px-4 text-sm',
		lg: 'h-10 px-5 text-sm'
	};
	
	// Simple variant classes
	const variantClasses = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
		outline: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
		ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
		destructive: 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class={cn(
		// Base styles (like HeroSearch buttons)
		'inline-flex items-center justify-center rounded-sm font-medium transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
		sizeClasses[size],
		variantClasses[variant],
		className
	)}
	{...restProps}
>
	<slot></slot>
</button>