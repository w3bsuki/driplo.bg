<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'outline';
		size?: 'sm' | 'default' | 'lg';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', size = 'default', class: className, children }: Props = $props();

	const variants = {
		default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
		secondary: 'bg-brand-50 text-brand-700 border-brand-200',
		success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		destructive: 'bg-red-50 text-red-700 border-red-200',
		outline: 'border-neutral-300 text-neutral-600 bg-transparent'
	};

	const sizes = {
		sm: 'px-2 py-0.5 text-xs',
		default: 'px-2.5 py-1 text-xs',
		lg: 'px-3 py-1.5 text-sm'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-md border font-medium transition-colors',
		variants[variant],
		sizes[size],
		className
	)}
>
	{@render children()}
</span>