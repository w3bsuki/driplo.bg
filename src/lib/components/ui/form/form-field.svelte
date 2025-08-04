<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getFormContext } from './form-context.svelte'
	
	interface Props {
		name: string
		children: Snippet
		class?: string
	}
	
	let { name, children, class: className = '' }: Props = $props()
	
	const form = getFormContext()
	const error = $derived(form?.errors?.[name])
</script>

<div class="space-y-2 {className}" data-field={name}>
	{@render children()}
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>