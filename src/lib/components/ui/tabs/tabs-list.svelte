<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div
	class={cn(
		'inline-flex h-10 items-center justify-center rounded-lg bg-gray-50 p-1 text-gray-600 border border-gray-200',
		className
	)}
>
	{@render children()}
</div>