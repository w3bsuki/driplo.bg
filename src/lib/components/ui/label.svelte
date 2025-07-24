<script lang="ts">
	import type { Snippet } from 'svelte'
	import { cn } from '$lib/utils'
	
	interface Props {
		class?: string
		for?: string
		children?: Snippet
	}
	
	let { class: className, children, ...restProps }: Props = $props()
</script>

<label 
	class={cn(
		"text-base font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</label>