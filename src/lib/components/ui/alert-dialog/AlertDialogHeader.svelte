<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
	{@render children()}
</div>