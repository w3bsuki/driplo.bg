<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'outline' | 
			'condition-new-with-tags' | 'condition-new-without-tags' | 'condition-very-good' | 
			'condition-good' | 'condition-fair';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', size = 'md', class: className, children }: Props = $props();

	const variants = {
		default: 'bg-gray-50 text-gray-600 border-gray-200',
		secondary: 'bg-blue-50 text-blue-600 border-blue-200',
		success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
		destructive: 'bg-red-50 text-red-600 border-red-200',
		outline: 'border-gray-200 text-gray-600 bg-transparent',
		// Condition variants
		'condition-new-with-tags': 'bg-green-600 text-white border-green-600',
		'condition-new-without-tags': 'bg-green-500 text-white border-green-500',
		'condition-very-good': 'bg-yellow-400 text-gray-950 border-yellow-400',
		'condition-good': 'bg-orange-500 text-white border-orange-500',
		'condition-fair': 'bg-red-500 text-white border-red-500'
	};

	const sizes = {
		sm: 'h-6 px-2 text-xs',
		md: 'h-8 px-3 text-sm',
		lg: 'h-10 px-4 text-base'
	};
</script>

<span
	class={cn(
		'inline-flex items-center justify-center rounded-[var(--radius-sm)] border',
		variants[variant],
		sizes[size],
		className
	)}
>
	{@render children()}
</span>