<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { Writable } from 'svelte/store';

	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}

	let { value, class: className, children }: Props = $props();

	const context = getContext<{
		activeTab: Writable<string>;
	}>('tabs');

	const { activeTab } = context;
	
	const isActive = $derived($activeTab === value);
</script>

{#if isActive}
	<div
		class={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
	>
		{@render children()}
	</div>
{/if}