<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		htmlFor?: string
		class?: string
		required?: boolean
		children?: any
	}
	
	let { htmlFor, class: className, required = false, children }: Props = $props()
</script>

<label
	for={htmlFor}
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
>
	{@render children?.()}
	{#if required}
		<span class="text-red-500 ml-1">*</span>
	{/if}
</label>