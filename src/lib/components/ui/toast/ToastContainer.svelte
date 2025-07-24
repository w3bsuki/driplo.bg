<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
		children?: Snippet;
	}

	let {
		class: className,
		position = 'bottom-right',
		children
	}: Props = $props();

	const positionClasses = {
		'top-left': 'top-0 left-0',
		'top-center': 'top-0 left-1/2 -translate-x-1/2',
		'top-right': 'top-0 right-0',
		'bottom-left': 'bottom-0 left-0',
		'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
		'bottom-right': 'bottom-0 right-0'
	};
</script>

<div
	class={cn(
		'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none',
		positionClasses[position],
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>